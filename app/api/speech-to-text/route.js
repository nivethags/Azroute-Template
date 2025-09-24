import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

export const runtime = "nodejs"; // ensure Node runtime (we need Buffer/File)

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file"); // Blob from client

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert Blob to a File compatible with OpenAI SDK
    const openAiFile = await toFile(
      Buffer.from(await file.arrayBuffer()),
      // keep extension so Whisper infers container
      file.name || "recording.webm",
      { type: file.type || "audio/webm" }
    );

    // Models: "gpt-4o-mini-transcribe" (fast) or "whisper-1" (classic)
    const resp = await client.audio.transcriptions.create({
      file: openAiFile,
      model: "gpt-4o-transcribe",
      language: "en" // uncomment to force English
    });

    return NextResponse.json({ text: resp.text || "" });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json({ error: err.message || "Transcription failed" }, { status: 500 });
  }
}
