import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Basic Security & Probing Logging
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  console.log(`[SECURITY LOG] ${req.method} ${req.nextUrl.pathname} | IP: ${ip}`);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
