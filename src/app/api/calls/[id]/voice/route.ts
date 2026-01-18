import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { voicePath } = await request.json();

    if (!voicePath) {
      return NextResponse.json(
        { error: "Voice path is required" },
        { status: 400 }
      );
    }

    const updatedCall = await prisma.call.update({
      where: { id },
      data: { voicePath },
    });

    return NextResponse.json(updatedCall);
  } catch (error) {
    console.error("Error updating call with voice path:", error);
    return NextResponse.json(
      { error: "Failed to update call" },
      { status: 500 }
    );
  }
}
