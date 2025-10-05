// pages/api/olamundo.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Olá API" });
}
