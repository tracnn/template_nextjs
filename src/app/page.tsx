import { Footer } from "@/components/Footer/Footer";
import { Features } from "@/components/Landing/FeaturesSection";
import { Header } from "@/components/Landing/Header";
import { HeroSection } from "@/components/Landing/HeroSection";
import { LandingContainer } from "@/components/Landing/LandingContainer";
import { PricingSection } from "@/components/Landing/PricingSection";
import { SocialProofSection } from "@/components/Landing/SocialProofSection";
import { FAQSection } from "@/components/Landing/FAQSection";
import { CTASection } from "@/components/Landing/CTASection";

export default function Page() {
	return (
		<LandingContainer>
			<Header
				links={[
					{
						link: "/about",
						label: "Home",
					},
					{
						link: "/learn",
						label: "Features",
					},
					{
						link: "/pricing",
						label: "Pricing",
					},
				]}
			/>
			<HeroSection />
			<SocialProofSection />
			<Features />
			<PricingSection />
			<FAQSection />
			<CTASection />
			<Footer />
		</LandingContainer>
	);
}
