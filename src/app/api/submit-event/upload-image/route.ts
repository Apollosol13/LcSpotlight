import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { EVENT_SUBMISSIONS_BUCKET } from "@/lib/event-submissions-storage";
import { supabaseAdmin } from "@/lib/supabase-server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
    }
    const mime = file.type;
    if (!ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, WebP, or GIF image." },
        { status: 400 },
      );
    }
    const ext = MIME_EXT[mime];
    if (!ext) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const path = `public/${randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage.from(EVENT_SUBMISSIONS_BUCKET).upload(path, buf, {
      contentType: mime,
      upsert: false,
    });

    if (error) {
      console.error("event-submissions storage upload:", error);
      return NextResponse.json(
        { error: "Could not store image. Is the storage bucket configured?" },
        { status: 500 },
      );
    }

    const { data } = supabaseAdmin.storage.from(EVENT_SUBMISSIONS_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
