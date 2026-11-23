const Stripe = require("stripe");
const clientDb = require("../models/clientmodel");
const freelancerDb = require("../models/freelancermodel");

const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const PLANS = {
  "client-monthly": { role: "client", label: "Monthly client plan", amount: 19900, interval: "month" },
  "client-yearly": { role: "client", label: "Yearly client plan", amount: 200000, interval: "year" },
  "freelancer-premium": { role: "freelancer", label: "Premium Career", amount: 49900, interval: "month" },
};

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.");
    error.status = 503;
    throw error;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function reportStripeError(context, error, fallback) {
  const message = String(error.message || "Stripe request failed.")
    .replace(/\b(?:sk|pk|rk)_(?:test|live)_[A-Za-z0-9]+|\bwhsec_[A-Za-z0-9]+/g, "[redacted]");
  console.error(context, {
    type: error.type || "StripeError",
    code: error.code || "",
    requestId: error.requestId || "",
    message,
  });
  return process.env.NODE_ENV === "production"
    ? fallback
    : `${fallback} (${error.code || error.type || "Stripe error"}): ${message}`;
}

function accountModel(role) {
  return role === "client" ? clientDb : freelancerDb;
}

async function saveSubscription({ role, accountId, planKey, subscriptionId, customerId, status = "active" }) {
  const plan = PLANS[planKey];
  if (!plan || plan.role !== role) return;
  await accountModel(role).findByIdAndUpdate(accountId, {
    subscriptionPlan: planKey,
    subscriptionStatus: status,
    stripeSubscriptionId: subscriptionId || "",
    stripeCustomerId: customerId || "",
  });
}

function makeCheckoutHandler(role, getAccountId, resolvePlan) {
  return async (req, res) => {
    try {
      const { key, plan } = resolvePlan(req);
      if (!plan || plan.role !== role) return res.status(400).json({ message: "Choose a valid subscription plan." });
      const accountId = String(getAccountId(req));
      const stripe = stripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "inr",
            unit_amount: plan.amount,
            recurring: { interval: plan.interval },
            product_data: { name: plan.label },
          },
          quantity: 1,
        }],
        client_reference_id: accountId,
        metadata: { accountId, role, plan: key },
        subscription_data: { metadata: { accountId, role, plan: key } },
        success_url: `${frontendUrl()}/payment/success?role=${role}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: role === "client"
          ? `${frontendUrl()}/client/plans/${key.replace("client-", "")}?checkout=cancelled`
          : `${frontendUrl()}/premium?checkout=cancelled`,
      });
      return res.status(200).json({ url: session.url });
    } catch (error) {
      const message = error.status
        ? error.message
        : reportStripeError("Stripe checkout creation failed:", error, "Could not start secure checkout.");
      return res.status(error.status || 502).json({ message });
    }
  };
}

function makeVerifyHandler(role, getAccountId) {
  return async (req, res) => {
    try {
      const stripe = stripeClient();
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      const accountId = String(getAccountId(req));
      const planKey = session.metadata?.plan;
      const plan = PLANS[planKey];
      if (
        !plan || plan.role !== role || session.metadata?.role !== role ||
        session.client_reference_id !== accountId || session.status !== "complete" ||
        session.payment_status !== "paid" || !session.subscription
      ) {
        return res.status(402).json({ message: "This Checkout session is not a completed purchase for your account." });
      }
      await saveSubscription({
        role,
        accountId,
        planKey,
        subscriptionId: session.subscription,
        customerId: session.customer,
      });
      return res.json({
        verified: true,
        plan: plan.label,
        amount: plan.amount / 100,
        currency: "INR",
        interval: plan.interval,
      });
    } catch (error) {
      const message = error.status
        ? error.message
        : reportStripeError("Stripe Checkout verification failed:", error, "Could not verify this purchase.");
      return res.status(error.status || 502).json({ message });
    }
  };
}

function makePortalHandler(role, getAccountId) {
  return async (req, res) => {
    try {
      const stripe = stripeClient();
      const account = await accountModel(role).findById(getAccountId(req)).select("+stripeCustomerId");
      if (!account?.stripeCustomerId) return res.status(404).json({ message: "No Stripe subscription is linked to this account yet." });
      const session = await stripe.billingPortal.sessions.create({
        customer: account.stripeCustomerId,
        return_url: role === "freelancer" ? `${frontendUrl()}/premium` : `${frontendUrl()}/${role}`,
      });
      return res.json({ url: session.url });
    } catch (error) {
      const message = error.status
        ? error.message
        : reportStripeError("Stripe billing portal creation failed:", error, "Could not open subscription management.");
      return res.status(error.status || 502).json({ message });
    }
  };
}

async function handleWebhook(req, res) {
  let event;
  try {
    const stripe = stripeClient();
    if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send("Stripe webhook is not configured.");
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook signature error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { accountId, role, plan: planKey } = session.metadata || {};
      if (session.mode === "subscription" && session.payment_status === "paid" && accountId && PLANS[planKey]?.role === role) {
        await saveSubscription({ role, accountId, planKey, subscriptionId: session.subscription, customerId: session.customer });
      }
    } else if (["customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      const subscription = event.data.object;
      const { accountId, role, plan: planKey } = subscription.metadata || {};
      if (accountId && PLANS[planKey]?.role === role) {
        const status = event.type === "customer.subscription.deleted" ? "canceled" : subscription.status;
        if (status === "canceled") {
          await accountModel(role).findByIdAndUpdate(accountId, {
            subscriptionPlan: "free",
            subscriptionStatus: "canceled",
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
          });
        } else {
          await saveSubscription({ role, accountId, planKey, subscriptionId: subscription.id, customerId: subscription.customer, status });
        }
      }
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error.message);
    return res.status(500).json({ message: "Could not process Stripe webhook." });
  }
}

module.exports = {
  createClientCheckout: makeCheckoutHandler("client", (req) => req.client, (req) => {
    const key = `client-${req.body?.plan}`;
    return { key, plan: PLANS[key] };
  }),
  createFreelancerCheckout: makeCheckoutHandler("freelancer", (req) => req.freelancer, () => ({ key: "freelancer-premium", plan: PLANS["freelancer-premium"] })),
  verifyClientCheckout: makeVerifyHandler("client", (req) => req.client),
  verifyFreelancerCheckout: makeVerifyHandler("freelancer", (req) => req.freelancer),
  createClientPortal: makePortalHandler("client", (req) => req.client),
  createFreelancerPortal: makePortalHandler("freelancer", (req) => req.freelancer),
  handleWebhook,
};
