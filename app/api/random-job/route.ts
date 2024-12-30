import { NextResponse } from "next/server";
import { getRandomJob } from "../../../lib/midjourney";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface _JobResponse {
  title: string;
  description: string;
}

export async function GET() {
  try {
    const randomJob = getRandomJob();

    // Set cache control headers
    const response = NextResponse.json(randomJob);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error: Error | unknown) {
    console.error("Error fetching random job:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch random job",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
