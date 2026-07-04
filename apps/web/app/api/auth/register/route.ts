import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("[/api/auth/register] Proxy error:", err?.message);
    return NextResponse.json(
      { error: "Failed to connect to the API server." },
      { status: 502 }
    );
  }
}
