import { RevendaHero } from "@/components/revenda/Hero"
import { RevendaMetrics } from "@/components/revenda/Metrics"
import { RevendaAbout } from "@/components/revenda/About"
import { RevendaBenefits } from "@/components/revenda/Benefits"
import { RevendaCategories } from "@/components/revenda/Categories"
import { RevendaTestimonials } from "@/components/revenda/Testimonials"
import { RevendaCTAFinal } from "@/components/revenda/CTAFinal"
import { RevendaFooter } from "@/components/revenda/Footer"

export default function RevendaPage() {
  return (
    <main>
      <RevendaHero />
      <RevendaMetrics />
      <RevendaAbout />
      <RevendaBenefits />
      <RevendaCategories />
      <RevendaTestimonials />
      <RevendaCTAFinal />
      <RevendaFooter />
    </main>
  )
}
