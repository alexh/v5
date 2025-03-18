import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "No endpoint specified" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "API configuration error" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        "X-API-Key": process.env.API_KEY || "",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from API" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "No endpoint specified" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  console.log("API Base URL:", baseUrl);

  if (!baseUrl) {
    return NextResponse.json(
      { error: "API configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const apiUrl = `${baseUrl}${endpoint}`;
    console.log("Full API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.API_KEY || "",
      },
      body: JSON.stringify(body),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", response.status, errorText);
      return NextResponse.json(
        { error: `API returned error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // Check if there's content before parsing JSON
    const responseText = await response.text();
    if (!responseText) {
      console.log("Empty response from API");
      return NextResponse.json(
        { message: "API returned empty response" },
        { status: 204 }
      );
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse API response as JSON:", responseText);
      return NextResponse.json(
        { error: "Invalid JSON response from API", raw: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from API" },
      { status: 500 }
    );
  }
}
