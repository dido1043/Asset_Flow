import { promises as fs } from "fs";
import path from "path";

import type { NextRequest } from "next/server";

const protocolsDirectory = path.resolve(process.cwd(), "..", "..", "AssetFlowApi", "target", "protocols");

function resolveProtocolPath(rawPath: string) {
  const localPath = rawPath.startsWith("file://")
    ? decodeURIComponent(new URL(rawPath).pathname)
    : rawPath;
  const resolvedPath = path.resolve(localPath);
  const relativePath = path.relative(protocolsDirectory, resolvedPath);

  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath) ||
    path.extname(resolvedPath).toLowerCase() !== ".pdf"
  ) {
    return null;
  }

  return resolvedPath;
}

export async function GET(request: NextRequest) {
  const requestedPath = request.nextUrl.searchParams.get("path");

  if (!requestedPath) {
    return Response.json({ error: "Protocol path is required." }, { status: 400 });
  }

  const protocolPath = resolveProtocolPath(requestedPath);

  if (!protocolPath) {
    return Response.json({ error: "Protocol path is not allowed." }, { status: 403 });
  }

  try {
    const file = await fs.readFile(protocolPath);

    return new Response(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${path.basename(protocolPath)}"`,
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return Response.json({ error: "Protocol file not found." }, { status: 404 });
    }

    throw error;
  }
}
