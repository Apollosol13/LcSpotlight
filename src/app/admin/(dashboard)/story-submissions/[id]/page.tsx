import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-auth-server";
import {
  StorySubmissionDetailClient,
  type StorySubmissionRow,
} from "../StorySubmissionDetailClient";

export const dynamic = "force-dynamic";

export default async function StorySubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("story_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const row = data as StorySubmissionRow;

  return (
    <div>
      <p className="mb-2 text-sm text-white/40">
        <Link href="/admin/story-submissions" className="text-spotlight-gold no-underline hover:underline">
          Story submissions
        </Link>
        <span className="text-white/30"> / </span>
        <span className="text-white/60">Detail</span>
      </p>
      <StorySubmissionDetailClient row={row} />
    </div>
  );
}
