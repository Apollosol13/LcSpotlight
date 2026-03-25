import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const MAX_TITLE = 200;
const MAX_BODY = 8000;
const MAX_NAME = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const storyBody = typeof body.body === "string" ? body.body.trim() : "";

    if (!name || name.length > MAX_NAME) {
      return NextResponse.json(
        { error: "Please enter your name (max 120 characters)." },
        { status: 400 },
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (!title || title.length > MAX_TITLE) {
      return NextResponse.json(
        { error: "Please add a short headline for your story (max 200 characters)." },
        { status: 400 },
      );
    }
    if (!storyBody || storyBody.length > MAX_BODY) {
      return NextResponse.json(
        { error: "Please tell us about your story (up to 8,000 characters)." },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin.from("story_submissions").insert({
      name,
      email,
      title,
      body: storyBody,
      status: "pending",
      staff_notes: null,
    });

    if (error) {
      console.error("story_submissions insert:", error);
      return NextResponse.json(
        { error: "We couldn’t save your submission. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
