import { NextResponse } from "next/server";
import { runDailyDigest } from "@/lib/dailyDigest";

export async function GET() {
  await runDailyDigest();
  return NextResponse.json({ status: "ok" });
}
