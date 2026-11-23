const STORAGE_KEY = "jobportal.liked-jobs";
export const LIKED_JOBS_EVENT = "jobportal:liked-jobs-updated";

export function jobFavoriteKey(job) {
  return String(job?._id || job?.id || `sample:${(job?.title || "job").trim().toLowerCase()}`);
}

export function getLikedJobs() {
  try {
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(jobs) ? jobs : [];
  } catch {
    return [];
  }
}

function saveLikedJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event(LIKED_JOBS_EVENT));
  return jobs;
}

export function toggleLikedJob(job) {
  const key = jobFavoriteKey(job);
  const current = getLikedJobs();
  const exists = current.some((item) => jobFavoriteKey(item) === key);
  const updated = exists
    ? current.filter((item) => jobFavoriteKey(item) !== key)
    : [...current, { ...job, _likedKey: key }];
  return saveLikedJobs(updated);
}

export function removeLikedJob(key) {
  return saveLikedJobs(getLikedJobs().filter((job) => jobFavoriteKey(job) !== String(key)));
}
