import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - ModNight | NightWood",
  description: "ModNight's privacy policy — how NightWood collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 pt-28 md:pt-20 md:pl-24 pb-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-muted-foreground">
            NightWood (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates ModNight. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Account information (username, email)</li>
            <li>Plugin submissions and content</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How We Use Information</h2>
          <p className="text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Provide and maintain our services</li>
            <li>Process your plugin submissions</li>
            <li>Communicate with you about updates and support</li>
            <li>Improve and develop new features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational security measures to protect
            your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:nightwood@modnight.com" className="text-primary hover:underline">
              nightwood@modnight.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
