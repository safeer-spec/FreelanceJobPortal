import ProfileLayout from "./ProfileLayout.jsx";
import JobListings from "../components/JobListings.jsx";
import FreelancerApplications from "./FreelancerApplications.jsx";
import Reviews from "./Reviews.jsx";
import FreelancerResume from "./FreelancerResume.jsx";
import Mid from "../midHeader/mid.jsx";
import Header from "../components/Header.jsx";
import FreelancerPremiumPromo from "./FreelancerPremiumPromo.jsx";


export default function Freelancer() {
  return (
    <ProfileLayout role="freelancer" title="Freelancer dashboard">
      <Mid />
      <Header />
      <FreelancerPremiumPromo />
      <FreelancerResume />
      <section className="freelancer-activity" aria-label="Applications and reviews">
        <div className="freelancer-activity__panels">
          <FreelancerApplications />
          <Reviews role="freelancer" />
        </div>
      </section>
      <JobListings role="freelancer" />
    </ProfileLayout>
  );
}
