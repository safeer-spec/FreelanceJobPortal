import { API_BASE_URL } from "./apiBase.js";
import { handleUnauthorized } from "./authSession.js";



export async function createJob(data) {
  let response;
  try {
    response = await fetch(API_BASE_URL + "/job/create", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Could not connect to the server. Make sure the backend is running.");
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || result.error || "Could not create the job.");
  }
  return result;
}


async function jobRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error("Could not connect to the server. Make sure the backend is running.");
  }
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) handleUnauthorized(path.match(/^\/job\/(admin|client|freelancer)\//)?.[1]);
  if (!response.ok) throw new Error(result.message || result.error || "The request failed.");
  return result;
}

export function getClientJobs() {
  return jobRequest("/job/my-jobs");
}

export function getAdminJobs() {
  return jobRequest("/job/admin/list");
}

export function getAdminDashboardStats() {
  return jobRequest("/admin/dashboard-stats");
}

export function reviewJob(jobId, decision) {
  return jobRequest(`/job/admin/review/${encodeURIComponent(jobId)}`, {
    method: "PATCH",
    body: JSON.stringify({ decision }),
  });
}

export function updateJob(jobId, data) {
  return jobRequest(`/job/update/${encodeURIComponent(jobId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAdminJob(jobId) {
  return jobRequest(`/job/admin/delete/${encodeURIComponent(jobId)}`, { method: "DELETE" });
}

export function deleteClientJob(jobId) {
  return jobRequest(`/job/delete/${encodeURIComponent(jobId)}`, { method: "DELETE" });
}

export function suggestJobEdit(jobId, suggestion) {
  return jobRequest(`/job/admin/suggest/${encodeURIComponent(jobId)}`, {
    method: "PUT",
    body: JSON.stringify({ suggestion }),
  });
}

export function applyToJob(jobId, data = {}) {
  return jobRequest(`/job/${encodeURIComponent(jobId)}/apply`, { method: "POST", body: JSON.stringify(data) });
}

export function updateMyApplication(applicationId, data) {
  return jobRequest(`/job/freelancer/applications/${encodeURIComponent(applicationId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getMyApplications() {
  return jobRequest("/job/freelancer/applications");
}

export function shareResumeWithClient(applicationId) {
  return jobRequest(`/job/freelancer/applications/${encodeURIComponent(applicationId)}/resume`, {
    method: "PUT",
    body: "{}",
  });
}

export function getClientApplications() {
  return jobRequest("/job/client/applications");
}

export function postClientReview(applicationId, review) {
  return jobRequest(`/job/client/applications/${encodeURIComponent(applicationId)}/review`, {
    method: "POST",
    body: JSON.stringify(review),
  });
}

export function getFreelancerReviews() {
  return jobRequest("/job/freelancer/reviews");
}

export function getClientReviews() {
  return jobRequest("/job/client/reviews");
}

export function reviewApplication(applicationId, status) {
  return jobRequest(`/job/client/applications/${encodeURIComponent(applicationId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}


export function submitWork(applicationId, data) {
  return jobRequest(`/job/freelancer/applications/${encodeURIComponent(applicationId)}/submission`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getOpenJobs() {
  return jobRequest("/job/list");
}
