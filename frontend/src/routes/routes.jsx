import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar.jsx";
import Head from "../components/Header.jsx";
import AccountPage from "../accountpage/accountPage.jsx";
import Signup from "../page/signUp.jsx";
import Login from "../page/login.jsx";
import Mid from "../midHeader/mid.jsx";
import Footer from "../components/Footer.jsx";
import Main from "../Mainp.jsx/Main.jsx";
import Premium from "../premium/premium.jsx";
import PremiumCvReview from "../premium/PremiumCvReview.jsx";
import PremiumSupportPage from "../premium/PremiumSupportPage.jsx";
import PremiumMncJobs from "../premium/PremiumMncJobs.jsx";
import PremiumMncCompanyPage from "../premium/PremiumMncCompanyPage.jsx";
import PremiumRoadmap from "../premium/PremiumRoadmap.jsx";
import { useEffect, useState } from "react";
import { getMyProfile } from "../services/profileservices.js";

import About from "../foo/about.jsx";
import Contact from "../foo/contact.jsx";
import Privacy from "../foo/privacyPolicy.jsx";
import Terms from "../foo/tc.jsx";

import LearnAboutUpskill from "../navlist/learnAboutUpskill.jsx";
import SuccessStories from "../navlist/success-stories.jsx";
import Reviews from "../navlist/reviews.jsx";
import HowToLearn from "../navlist/how-to-learn.jsx";
import HowToTeach from "../navlist/how-to-teach.jsx";
import Updates from "../navlist/updates.jsx";
import Research from "../navlist/research.jsx";

import Freelancer from "../profile/freelancer.jsx";
import Client from "../profile/client.jsx";
import ClientSubscriptionPlanPage from "../profile/ClientSubscriptionPlanPage.jsx";
import PaymentSuccessPage from "../profile/PaymentSuccessPage.jsx";
import Admin from "../profile/admin.jsx";
import LikedJobsPage from "../components/LikedJobsPage.jsx";
import ProfilePage from "../profile/ProfilePage.jsx";
import PersonalDetailsPage from "../profile/PersonalDetailsPage.jsx";
import CvPage from "../profile/CvPage.jsx";
import CvEditorPage from "../profile/CvEditorPage.jsx";
import WelcomePage from "../components/WelcomePage.jsx";
import NotificationsPage from "../profile/NotificationsPage.jsx";

function JobsRoute() {
  return (
    <>
      <Navbar />
      <Mid />
      <Head />
      <Main />
      <Footer />
    </>
  );
}

function PremiumRoute() {
  let profile = null;
  try {
    profile = JSON.parse(sessionStorage.getItem("jobportal.profile") || "null");
  } catch {
    profile = null;
  }
  if (profile?.role !== "freelancer") {
    const destination = profile?.role === "client" ? "/client" : profile?.role === "admin" ? "/admin" : "/login?role=freelancer";
    return <Navigate to={destination} replace />;
  }
  return (
    <>
      <Navbar />
      <Mid />
      <Premium />
      <Footer />
    </>
  );
}

function PremiumCvReviewRoute() {
  let profile = null;
  try { profile = JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); } catch { profile = null; }
  if (profile?.role !== "freelancer") {
    const destination = profile?.role === "client" ? "/client" : profile?.role === "admin" ? "/admin" : "/login?role=freelancer";
    return <Navigate to={destination} replace />;
  }
  return <><Navbar /><PremiumCvReview /><Footer /></>;
}

function PremiumFeatureRoute({ children }) {
  const location = useLocation();
  let account = null;
  try { account = JSON.parse(sessionStorage.getItem("jobportal.profile") || "null"); } catch { account = null; }
  const [active, setActive] = useState(null);
  useEffect(() => {
    let mounted = true;
    getMyProfile("freelancer").then((profile) => {
      if (!mounted) return;
      sessionStorage.setItem("jobportal.profile", JSON.stringify({ ...profile, role: "freelancer" }));
      setActive(profile.subscriptionPlan === "freelancer-premium" && ["active", "trialing"].includes(profile.subscriptionStatus));
    }).catch(() => { if (mounted) setActive(false); });
    return () => { mounted = false; };
  }, []);
  if (account?.role !== "freelancer") {
    const destination = account?.role === "client" ? "/client" : account?.role === "admin" ? "/admin" : "/login?role=freelancer";
    return <Navigate to={destination} replace />;
  }
  if (active === null) return <main className="profile-settings"><p>Checking your Premium accessâ€¦</p></main>;
  if (!active) return <Navigate to="/premium?upgrade=required" replace />;
  return <><Navbar />{(["/premium/roadmap", "/premium/ai-career", "/premium/ats-screening", "/premium/admin-connection"].includes(location.pathname) || location.pathname.startsWith("/premium/mnc-jobs")) ? null : <Mid />}{children}<Footer /></>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <h1>Error page</h1>,
    children: [
      {
        index: true,
        element: <WelcomePage />,
      },
      {
        path: "jobs",
        element: <JobsRoute />,
      },
      {
        path: "learnAboutUpskill",
        element: <LearnAboutUpskill />,
      },
      {
        path: "success-stories",
        element: <SuccessStories />,
      },
      {
        path: "reviews",
        element: <Reviews />,
      },
      {
        path: "how-to-learn",
        element: <HowToLearn />,
      },
      {
        path: "how-to-teach",
        element: <HowToTeach />,
      },
      {
        path: "updates",
        element: <Updates />,
      },
      {
        path: "research",
        element: <Research />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
       {
        path: "premium",
        element: <PremiumRoute />,
      },
      {
        path: "Premium",
        element: <PremiumRoute />,
      },
      {
        path: "premium/admin-connection",
        element: <PremiumFeatureRoute><PremiumSupportPage /></PremiumFeatureRoute>,
      },
      {
        path: "premium/ai-career",
        element: <PremiumFeatureRoute><PremiumCvReview mode="ai" /></PremiumFeatureRoute>,
      },
      {
        path: "premium/ats-screening",
        element: <PremiumFeatureRoute><PremiumCvReview mode="ats" /></PremiumFeatureRoute>,
      },
      {
        path: "premium/mnc-jobs",
        element: <PremiumFeatureRoute><PremiumMncJobs /></PremiumFeatureRoute>,
      },
      {
        path: "premium/mnc-jobs/:companySlug",
        element: <PremiumFeatureRoute><PremiumMncCompanyPage /></PremiumFeatureRoute>,
      },
      {
        path: "premium/roadmap",
        element: <PremiumFeatureRoute><PremiumRoadmap /></PremiumFeatureRoute>,
      },
      {
        path: "premium/cv-review",
        element: <PremiumCvReviewRoute />,
      },
      {
        path: "profile/details",
        element: <PersonalDetailsPage />,
      },
      {
        path: "profile/cv/edit",
        element: <CvEditorPage />,
      },
      {
        path: "profile/cv",
        element: <CvPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      { path: "liked", element: <LikedJobsPage /> },
      { path: "notifications", element: <><Navbar /><NotificationsPage /><Footer /></> },
      { path: "cart", element: <Navigate to="/liked" replace /> },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "freelancer",
        element: <Freelancer />,
      },
      {
        path: "client",
        element: <Client />,
      },
      {
        path: "client/plans/:planType",
        element: <ClientSubscriptionPlanPage />,
      },
      {
        path: "payment/success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
      {
        path: "terms",
        element: <Terms />,
      },
      {
        path: "tc",
        element: <Terms />,
      },
    ],
  },
]);

