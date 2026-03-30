import { NextResponse } from "next/server";
import { isPublicEventSubmissionImageUrl } from "@/lib/event-submissions-storage";
import { supabaseAdmin } from "@/lib/supabase-server";

const MAX_ORG = 200;
const MAX_NAME = 200;
const MAX_CATEGORY = 80;
const MAX_DAY = 4;
const MAX_MONTH = 12;
const MAX_TIME = 80;
const MAX_LOCATION = 300;
const MAX_PRICE = 120;
const MAX_CTA = 80;
const MAX_BG = 32;
const MAX_DETAILS = 4000;
const MAX_IMAGE_URL = 2000;

const HEX_BG = /^#[0-9A-Fa-f]{6}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const org_name =
      typeof body.org_name === "string" ? body.org_name.trim() : "";
    const contact_email =
      typeof body.contact_email === "string"
        ? body.contact_email.trim().toLowerCase()
        : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const day = typeof body.day === "string" ? body.day.trim() : "";
    const month = typeof body.month === "string" ? body.month.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";
    const price = typeof body.price === "string" ? body.price.trim() : "";
    const cta =
      typeof body.cta === "string" && body.cta.trim()
        ? body.cta.trim()
        : "Learn More";
    const bg =
      typeof body.bg === "string" && body.bg.trim()
        ? body.bg.trim()
        : "#1E3A5F";
    const icon =
      typeof body.icon === "string" && body.icon.trim()
        ? body.icon.trim()
        : null;
    const details =
      typeof body.details === "string" ? body.details.trim() : "";
    const image_url =
      typeof body.image_url === "string" && body.image_url.trim()
        ? body.image_url.trim()
        : null;

    if (!org_name || org_name.length > MAX_ORG) {
      return NextResponse.json(
        { error: "Please enter your organization or venue name (max 200 characters)." },
        { status: 400 },
      );
    }
    if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json(
        { error: "Please enter a valid contact email." },
        { status: 400 },
      );
    }
    if (!name || name.length > MAX_NAME) {
      return NextResponse.json(
        { error: "Please enter the event name (max 200 characters)." },
        { status: 400 },
      );
    }
    if (category.length > MAX_CATEGORY) {
      return NextResponse.json(
        { error: "Category is too long." },
        { status: 400 },
      );
    }
    if (!day || day.length > MAX_DAY) {
      return NextResponse.json(
        { error: "Please enter the day (e.g. 05 or 15)." },
        { status: 400 },
      );
    }
    if (!month || month.length > MAX_MONTH) {
      return NextResponse.json(
        { error: "Please enter the month (e.g. Apr)." },
        { status: 400 },
      );
    }
    if (time.length > MAX_TIME) {
      return NextResponse.json({ error: "Time is too long." }, { status: 400 });
    }
    if (location.length > MAX_LOCATION) {
      return NextResponse.json(
        { error: "Location is too long." },
        { status: 400 },
      );
    }
    if (price.length > MAX_PRICE) {
      return NextResponse.json({ error: "Price is too long." }, { status: 400 });
    }
    if (cta.length > MAX_CTA) {
      return NextResponse.json(
        { error: "Button text is too long." },
        { status: 400 },
      );
    }
    if (!HEX_BG.test(bg) || bg.length > MAX_BG) {
      return NextResponse.json(
        { error: "Background must be a hex color like #1E3A5F." },
        { status: 400 },
      );
    }
    if (details.length > MAX_DETAILS) {
      return NextResponse.json(
        { error: "Details are too long (max 4,000 characters)." },
        { status: 400 },
      );
    }
    if (image_url) {
      if (image_url.length > MAX_IMAGE_URL || !isPublicEventSubmissionImageUrl(image_url)) {
        return NextResponse.json(
          { error: "Add an image by choosing a file on this form, or leave image empty." },
          { status: 400 },
        );
      }
    }

    const { error } = await supabaseAdmin.from("event_submissions").insert({
      org_name,
      contact_email,
      name,
      category: category || null,
      day,
      month,
      time: time || null,
      location: location || null,
      price: price || null,
      cta,
      bg,
      icon,
      image_url,
      details: details || null,
      status: "pending",
      staff_notes: null,
      published_event_id: null,
    });

    if (error) {
      console.error("event_submissions insert:", error);
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
