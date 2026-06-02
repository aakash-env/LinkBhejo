import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#080c0c] text-[#e8f0ee] font-dm-sans selection:bg-[#00e599]/30 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center text-[#00e599] hover:opacity-80 transition-opacity mb-12 font-syne font-bold">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
        <h1 className="font-syne font-bold text-4xl md:text-5xl text-white mb-8">Refund Policy</h1>
        <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-[#7a9490]">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-syne text-white mt-12 mb-4">1. General Policy</h2>
          <p>
            At LinkBhejo, we stand behind our product. If you are not completely satisfied with our Instagram automation platform within the first 7 days of your initial purchase, you may request a full refund.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">2. Eligibility</h2>
          <p>
            Refunds are only applicable to new subscribers on their first billing cycle. Renewals and subsequent charges are non-refundable unless legally required.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">3. How to Request a Refund</h2>
          <p>
            To request a refund, please contact us at hello@linkbhejo.com from the email address associated with your account. Include your account details and reason for the request.
          </p>

          <h2 className="text-2xl font-syne text-white mt-12 mb-4">4. Processing Time</h2>
          <p>
            Approved refunds are processed within 5-7 business days. It may take additional time for your bank or credit card provider to post the refund to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
