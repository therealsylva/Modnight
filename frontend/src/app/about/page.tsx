import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - NightWood",
  description: "Learn about NightWood, the team behind ModNight marketplace for plugins, mods, and add-ons.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">About NightWood</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          NightWood is a software development studio dedicated to building tools that enhance 
          your digital experience. We believe in the power of customization and community-driven 
          innovation.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-4">
          We aim to create the best marketplace for developers and users to discover, share, 
          and distribute plugins, mods, and add-ons. Our platform empowers creators while 
          making it easy for users to find high-quality modifications for their favorite applications.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What We Build</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
          <li>ModNight - A marketplace for plugins and mods</li>
          <li>Developer tools for distribution and monetization</li>
          <li>Installation and management utilities</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
          <li>Community-first approach to development</li>
          <li>Transparency in all our operations</li>
          <li>Quality over quantity</li>
          <li>Supporting independent developers</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p className="text-muted-foreground mb-4">
          Have questions or want to collaborate? Reach out at{" "}
          <a href="mailto:nightwood@modnight.com" className="text-primary hover:underline">
            nightwood@modnight.com
          </a>
        </p>
      </div>
    </div>
  );
}
