import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#080c0c] text-[#e8f0ee] font-dm-sans selection:bg-[#00e599]/30 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center text-[#00e599] hover:opacity-80 transition-opacity mb-12 font-syne font-bold">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
        <h1 className="font-syne font-bold text-4xl md:text-5xl text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-[#7a9490]">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-syne text-white mt-12 mb-4">1. Information We Collect</h2>
          <p>
            At LinkBhejo, we collect information you provide directly to us, such as when you create an account, connect your Instagram profile, or contact customer support. This may include your name, email, and social media handles.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our automation services, as well as to communicate with you about updates and offers.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. Your Instagram credentials are handled securely via official Meta APIs and are never exposed.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">4. Third-Party Sharing</h2>
          <p>
            We do not sell your personal data. We may share data with trusted third-party service providers (such as payment processors) strictly to facilitate our services.
          </p>
        </div>
      </div>
    </div>
  );
}
