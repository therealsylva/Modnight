import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - ModNight | NightWood",
  description: "ModNight's terms of service — the rules and guidelines for using the ModNight marketplace by NightWood.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 pt-28 md:pt-20 md:pl-24 pb-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using NightWood&apos;s services, including ModNight, you agree to be bound
            by these Terms of Service. If you disagree with any part of these terms, you may not
            access our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Use License</h2>
          <p className="text-muted-foreground">
            Permission is granted to temporarily use ModNight for personal, non-commercial use only.
            This is the grant of a license, not a transfer of title.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Plugin Submission</h2>
          <p className="text-muted-foreground">
            When submitting plugins to ModNight, you warrant that:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>You own or have the rights to distribute the plugin</li>
            <li>The plugin does not infringe on third-party intellectual property</li>
            <li>The plugin does not contain malware or malicious code</li>
            <li>You provide accurate information about the plugin</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">User Conduct</h2>
          <p className="text-muted-foreground">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Submit false or misleading information</li>
            <li>Attempt to interfere with the proper working of the site</li>
            <li>Use the service for any unlawful purpose</li>
            <li>Harass, abuse, or harm another person</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <p className="text-muted-foreground">
            ModNight is provided &quot;as is&quot; without any representations or warranties, express or implied.
            NightWood makes no representations or warranties in relation to this website or the
            information and materials provided on this website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            NightWood will not be liable to you in relation to the contents of, or use of,
            or otherwise in connection with, this website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:nightwood@modnight.com" className="text-primary hover:underline">
              nightwood@modnight.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
