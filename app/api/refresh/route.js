import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const PATHS = ["/", "/power-rankings", "/predictions", "/transactions", "/recaps"];

// Vercel Cron (configured in vercel.json) hits this route on a schedule so
// the site pulls fresh data from Sleeper even if nobody visits in between.
// Vercel automatically sends "Authorization: Bearer <CRON_SECRET>" on cron
// requests when a CRON_SECRET env var is set, which is what's checked here.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  PATHS.forEach((path) => revalidatePath(path));
  return NextResponse.json({ revalidated: true, paths: PATHS, at: new Date().toISOString() });
}
