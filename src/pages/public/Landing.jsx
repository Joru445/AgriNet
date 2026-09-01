import LandingHeader from "../../components/landing/LandingHeader";
import LandingHero from "../../components/landing/LandingHero";
import LandingAbout from "../../components/landing/LandingAbout";
import LandingBenefits from "../../components/landing/LandingBenefits";
import LandingHowItWorks from "../../components/landing/LandingHowItWorks";
import LandingFooter from "../../components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <LandingHero />
      <LandingAbout />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingFooter />
    </>
  );
}
