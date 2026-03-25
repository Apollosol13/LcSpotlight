import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const eventsData = [
  { day: "05", month: "Apr", category: "Music", bg: "#3C507D", name: "Hilton Head Jazz & Wine Festival", location: "Shelter Cove Marina", time: "6:00 PM", price: "From $45 · General Admission", cta: "Get Tickets", source: "manual" },
  { day: "12", month: "Apr", category: "Outdoors", bg: "#1A3A2A", name: "Coastal Discovery Museum Plein Air", location: "Sea Pines Forest", time: "9:00 AM", price: "Free Entry", cta: "Learn More", source: "manual" },
  { day: "19", month: "Apr", category: "Food & Drink", bg: "#3A1A2A", name: "Savannah Food & Wine Experience", location: "Forsyth Park, Savannah", time: "4:00 PM", price: "From $75 · Tasting Pass", cta: "Get Tickets", source: "manual" },
];

const newsData = [
  { title: "New Shoreline Restoration Project Launches Across Hilton Head's North End", category: "Environment", date: "March 22, 2026", description: "A coalition of local environmental groups and the Town of Hilton Head Island has begun a multi-year dune restoration initiative, planting sea oats and native grasses across 3.2 miles of shoreline to protect against seasonal erosion.", author: "Town of HHI", read_time: "4 min read", image_bg: "#14324A", featured: true, source: "manual" },
  { title: "Beaufort County Schools Expand Arts Program for Fall 2026", category: "Education", date: "March 21", source: "manual" },
  { title: "New Bike Lane Extension Approved from Coligny to Palmetto Dunes", category: "Infrastructure", date: "March 20", source: "manual" },
  { title: "Bluffton's Spring Garden Tour Returns with 18 Stops", category: "Community", date: "March 19", source: "manual" },
  { title: "Sea Turtle Nesting Season Begins — Beach Guidelines Updated", category: "Wildlife", date: "March 18", source: "manual" },
];

const openingsData = [
  { name: "The Marsh House Brasserie", type: "Restaurant · French-Southern", location: "Coligny Plaza, HHI", source: "manual" },
  { name: "Sweet Perks Ice Cream", type: "Dessert · Cafe", location: "Coligny Circle, HHI", source: "manual" },
  { name: "Tide & Grace Salon", type: "Beauty · Wellness", location: "Old Town Bluffton", source: "manual" },
  { name: "Lowcountry Strength Co.", type: "Gym · Fitness Studio", location: "Bluffton", source: "manual" },
];

const thingsToDoData = [
  { badge: "30% OFF", title: "Dolphin Kayak Tour", description: "2-hour guided kayak tour through the salt marshes with dolphin spotting.", venue: "Outside Hilton Head", expires: "Expires Apr 30", source: "manual" },
  { badge: "$20 OFF", title: "Round of Golf — Harbour Town", description: "Twilight round discount every day after 3 PM. Cart included.", venue: "Sea Pines Resort", expires: "Weekdays only", source: "manual" },
  { badge: "FREE", title: "Guided Nature Walk", description: "Saturday morning walks through the Pinckney Island Wildlife Refuge.", venue: "US Fish & Wildlife Service", expires: "Every Saturday 8 AM", source: "manual" },
  { badge: "BOGO", title: "Happy Hour at Skull Creek Dockside", description: "Buy one cocktail, get one free every day 3–6 PM on the waterfront deck.", venue: "Skull Creek Dockside", expires: "Daily 3–6 PM", source: "manual" },
  { badge: "15% OFF", title: "Art Classes at Morris Center", description: "Watercolor, pottery, and mixed media classes for all skill levels.", venue: "Arts Center of Coastal Carolina", expires: "Spring session", source: "manual" },
  { badge: "25% OFF", title: "Surf Lessons for Beginners", description: "Board rental + 90-min lesson at Folly Field Beach. Great for families.", venue: "Hilton Head Surf Co.", expires: "Expires May 15", source: "manual" },
];

export async function POST() {
  const results: Record<string, string> = {};

  const { error: eventsErr } = await supabaseAdmin.from("events").upsert(eventsData, { onConflict: "name" });
  results.events = eventsErr ? eventsErr.message : `${eventsData.length} rows`;

  const { error: newsErr } = await supabaseAdmin.from("news").upsert(newsData, { onConflict: "title" });
  results.news = newsErr ? newsErr.message : `${newsData.length} rows`;

  const { error: openingsErr } = await supabaseAdmin.from("openings").upsert(openingsData, { onConflict: "name" });
  results.openings = openingsErr ? openingsErr.message : `${openingsData.length} rows`;

  const { error: thingsErr } = await supabaseAdmin.from("things_to_do").upsert(thingsToDoData, { onConflict: "title" });
  results.things_to_do = thingsErr ? thingsErr.message : `${thingsToDoData.length} rows`;

  return NextResponse.json({ seeded: results });
}
