import { MainLayout } from '@/components/MainLayout';
import { Hero } from '@/components/Hero';
import { FeaturedCourses } from '@/components/FeaturedCourses';
import { LiveClasses } from '@/components/LiveClasses';
import { HowItWorks } from '@/components/HowItWorks';
import { TeacherCTA } from '@/components/TeacherCTA';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { CTASection } from '@/components/CTASection';
import { Newsletter } from '@/components/Newsletter';
import { Stats } from '@/components/Stats';

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      {/* <Stats /> */}
      {/* <FeaturedCourses /> */}
      {/* <LiveClasses /> */}
      <HowItWorks />
      <TeacherCTA />
      <Pricing />
      <FAQ />
      {/* <Newsletter /> */}
      <CTASection />
    </MainLayout>
  );
}