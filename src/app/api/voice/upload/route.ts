import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as Blob | null;
    const scenarioId = formData.get("scenarioId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "voice");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.type.includes("webm") ? "webm" : "mp4";
    const filename = `voice_${scenarioId || "unknown"}_${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert Blob to Buffer and write to file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      filepath: `/uploads/voice/${filename}`,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Error uploading voice recording:", error);
    return NextResponse.json(
      { error: "Failed to upload voice recording" },
      { status: 500 }
    );
  }
}
