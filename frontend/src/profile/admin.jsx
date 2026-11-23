import ProfileLayout from "./ProfileLayout.jsx";
import JobListings from "../components/JobListings.jsx";
import JobStatusDashboard from "./JobStatusDashboard.jsx";
import PremiumSupportInbox from "./PremiumSupportInbox.jsx";

export default function Admin() {
  return (
    <ProfileLayout role="admin" title="Admin dashboard">
      <JobStatusDashboard role="admin" />
      <PremiumSupportInbox />
      <JobListings role="admin" />
    </ProfileLayout>
  );
}
