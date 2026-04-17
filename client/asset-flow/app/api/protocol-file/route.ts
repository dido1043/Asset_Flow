import type { NextRequest } from "next/server";

function getBackendBaseUrl() {
  return (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  // Accept either "id" or "path" parameter
  let protocolId = request.nextUrl.searchParams.get("id");
  const requestedPath = request.nextUrl.searchParams.get("path");

  if (!protocolId && !requestedPath) {
    return Response.json({ error: "Protocol id or path is required." }, { status: 400 });
  }

  console.log("[protocol-file API] Received id:", protocolId, "path:", requestedPath);

  // If only path is provided, extract the ID from it
  if (!protocolId && requestedPath) {
    const match = requestedPath.match(/\/protocol\/download\/(\d+)/);
    if (!match) {
      console.error("[protocol-file API] Invalid protocol path format:", requestedPath);
      return Response.json({ error: "Invalid protocol path format." }, { status: 400 });
    }
    protocolId = match[1];
  }

  if (!protocolId || !/^\d+$/.test(protocolId)) {
    return Response.json({ error: "Protocol id must be a number." }, { status: 400 });
  }

  const backendUrl = `${getBackendBaseUrl()}/protocol/download/${protocolId}`;
  
  console.log("[protocol-file API] Fetching from backend:", backendUrl);
  
  try {
    const requestHeaders = new Headers({
      Accept: "application/pdf",
    });
    const cookie = request.headers.get("cookie");

    if (cookie) {
      requestHeaders.set("Cookie", cookie);
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });
    
    if (!response.ok) {
      console.error(`[protocol-file API] Backend returned ${response.status}: ${response.statusText}`);
      const errorText = await response.text();
      console.error("[protocol-file API] Error response:", errorText);
      return Response.json({ error: `Failed to fetch protocol: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const file = await response.arrayBuffer();
    console.log("[protocol-file API] Successfully fetched file:", file.byteLength, "bytes");

    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          response.headers.get("Content-Disposition") || `attachment; filename="protocol-${protocolId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[protocol-file API] Error fetching protocol:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ error: "Failed to fetch protocol file.", details: errorMessage }, { status: 502 });
  }
}


