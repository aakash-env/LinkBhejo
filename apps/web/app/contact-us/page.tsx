import React from "react";
import Link from "next/link";
import { ChevronLeft, Mail, MapPin } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-[#080c0c] text-[#e8f0ee] font-dm-sans selection:bg-[#00e599]/30 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/" className="inline-flex items-center text-[#00e599] hover:opacity-80 transition-opacity mb-12 font-syne font-bold">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Link>
        <h1 className="font-syne font-bold text-4xl md:text-5xl text-white mb-8">Contact Us</h1>
        <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-[#7a9490]">
          <p className="text-lg">
            Have questions about LinkBhejo? We're here to help you scale your Instagram automation.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-[#0d1111] border border-[#1e3030] p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-[#00e599]" />
              </div>
              <h3 className="font-syne font-bold text-xl text-white mb-2">Email Support</h3>
              <p className="text-[#7a9490] mb-4">Our team typically responds within 24 hours.</p>
              <a href="mailto:aakashsharma.ghd@gmail.com" className="text-[#00e599] hover:underline font-medium">aakashsharma.ghd@gmail.com</a>
            </div>

            {/* <div className="bg-[#0d1111] border border-[#1e3030] p-8 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-syne font-bold text-xl text-white mb-2">Headquarters</h3>
              <p className="text-[#7a9490]">
                <br />
                <br />
                New Delhi, India
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
