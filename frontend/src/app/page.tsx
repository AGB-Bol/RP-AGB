import type { Metadata } from "next";
import { LandingNav }      from "@/components/landing/LandingNav";
import { LandingHero }     from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingCta }      from "@/components/landing/LandingCta";
import { LandingFooter }   from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "RP-AGB — Gestión integral de servicios",
  description:
    "Plataforma centralizada para la administración de clientes, servicios y reportes de RP-AGB.",
};

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
