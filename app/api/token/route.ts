import { NextResponse } from "next/server";
import { getCvSessionSettings } from "@/lib/grounding";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.HUME_API_KEY;
  const secretKey = process.env.HUME_SECRET_KEY;
  const configId = process.env.HUME_CONFIG_ID ?? "";

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      { error: "HUME_API_KEY and HUME_SECRET_KEY must be set" },
      { status: 500 },
    );
  }

  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const response = await fetch("https://api.hume.ai/oauth2-cc/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "Hume token exchange failed", detail },
      { status: 502 },
    );
  }

  const data = (await response.json()) as { access_token: string };
  const sessionSettings = await getCvSessionSettings();

  return NextResponse.json({
    accessToken: data.access_token,
    configId,
    sessionSettings,
  });
}
