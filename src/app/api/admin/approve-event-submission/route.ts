import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createSupabaseServer();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { data: sub, error: fetchErr } = await supabaseAdmin
      .from("event_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !sub) {
      return NextResponse.json(
        { error: "Submission not found." },
        { status: 404 },
      );
    }

    if (sub.published_event_id) {
      return NextResponse.json(
        { error: "This submission already has a published calendar event." },
        { status: 400 },
      );
    }

    const sourceLabel =
      typeof sub.org_name === "string" && sub.org_name
        ? `Submitted: ${sub.org_name}`
        : "Submitted event";

    const { data: ev, error: insertErr } = await supabaseAdmin
      .from("events")
      .insert({
        name: sub.name,
        category: sub.category,
        day: sub.day,
        month: sub.month,
        time: sub.time,
        location: sub.location,
        price: sub.price,
        cta: sub.cta ?? "Learn More",
        bg: sub.bg ?? "#1E3A5F",
        icon: sub.icon,
        image_url: sub.image_url ?? null,
        source: sourceLabel,
      })
      .select("id")
      .single();

    if (insertErr || !ev) {
      console.error("approve event insert:", insertErr);
      return NextResponse.json(
        { error: insertErr?.message ?? "Could not publish event." },
        { status: 500 },
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("event_submissions")
      .update({
        status: "approved",
        published_event_id: ev.id,
      })
      .eq("id", id);

    if (updateErr) {
      console.error("approve event_submissions update:", updateErr);
      return NextResponse.json(
        { error: "Event was created but updating the submission failed." },
        { status: 500 },
      );
    }

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json({ ok: true, event_id: ev.id });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
