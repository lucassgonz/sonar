import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FooterSection } from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="relative z-10">
        <Hero />
      </main>
      <section className="relative z-20">
        <FooterSection />
      </section>
    </div>
  );
};

export default Index;
