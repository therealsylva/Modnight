import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ModNight",
  description: "ModNight is a global marketplace for free plugins, mods, and PC tools. Download without account or payment.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 pt-28 md:pt-20 md:pl-24 pb-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About ModNight</h1>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          ModNight is a global marketplace for free plugins, mods, and PC tools. We provide high-quality utilities that users can download without any account or payment.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Origin</h2>
        <p className="text-muted-foreground mb-4">
          Launched in 2026, ModNight was initiated with support from the Federal University of Technology, Akure (FUTA) as part of their vision to create an open software ecosystem that serves users worldwide.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-4">
          Our mission is to make powerful system tools, productivity add-ons, and custom modifications freely accessible to everyone. We focus on quality, simplicity, and usefulness.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
        <p className="text-muted-foreground mb-4">
          We are committed to offering carefully selected plugins and standalone tools with zero paywalls. Our goal is to build a trusted platform where users can easily find and download practical software.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">NightWood</h2>
        <p className="text-muted-foreground mb-4">
          NightWood is the team behind ModNight. We are focused on developing useful tools and growing a sustainable marketplace for the PC community.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="text-muted-foreground mb-4">
          Have questions or suggestions? Feel free to reach out to us at{" "}
          <a href="mailto:contact@modnight.com" className="text-primary hover:underline">
            contact@modnight.com
          </a>
        </p>
      </div>
    </div>
  );
}
