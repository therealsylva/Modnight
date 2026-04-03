import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - NightWood",
  description: "Get in touch with NightWood. We'd love to hear from you about partnerships, support, or general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        We’d love to hear from you. Whether you have a question about our products, 
        want to partner with us, or just want to say hello, our team is here to help.
      </p>

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
        <p className="text-muted-foreground mb-4">
          For all inquiries, please email us at:
        </p>
        <a 
          href="mailto:nightwood@modnight.com" 
          className="text-2xl font-mono text-primary hover:underline"
        >
          nightwood@modnight.com
        </a>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">What We Can Help With</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Plugin submission and curation questions</li>
          <li>Developer partnerships</li>
          <li>Bug reports and technical support</li>
          <li>Business inquiries</li>
          <li>Media and press inquiries</li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        We aim to respond to all inquiries within 48 hours.
      </p>
    </div>
  );
}
