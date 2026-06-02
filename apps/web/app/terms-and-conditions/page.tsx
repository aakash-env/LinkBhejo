import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#080c0c] text-[#e8f0ee] font-dm-sans selection:bg-[#00e599]/30 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center text-[#00e599] hover:opacity-80 transition-opacity mb-12 font-syne font-bold">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
        <h1 className="font-syne font-bold text-4xl md:text-5xl text-white mb-8">Terms and Conditions</h1>
        <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-[#7a9490]">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-syne text-white mt-12 mb-4">1. Introduction</h2>
          <p>
            Welcome to LinkBhejo. These Terms and Conditions govern your use of the LinkBhejo website and services.
            By accessing or using our platform, you agree to be bound by these terms.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">2. Use of Service</h2>
          <p>
            LinkBhejo provides an Instagram DM automation platform. You agree to use this service in compliance with all applicable laws and Meta's official Terms of Service.
            You are responsible for any content you automate or distribute via LinkBhejo.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">3. Accounts and Subscriptions</h2>
          <p>
            You must provide accurate information when creating an account. Subscriptions are billed according to the plan selected and are subject to our Refund Policy.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">4. Limitation of Liability</h2>
          <p>
            LinkBhejo is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of the service. We do not guarantee specific growth metrics or results.
          </p>
        </div>
      </div>
    </div>
  );
}
