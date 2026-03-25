import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://szyikljsyqafaokcqiim.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  { market_key: "hhi", badge: "30% OFF", title: "Dolphin Kayak Tour", description: "2-hour guided kayak tour through the salt marshes with dolphin spotting.", venue: "Outside Hilton Head", expires: "Expires Apr 30", source: "manual" },
  { market_key: "hhi", badge: "$20 OFF", title: "Round of Golf — Harbour Town", description: "Twilight round discount every day after 3 PM. Cart included.", venue: "Sea Pines Resort", expires: "Weekdays only", source: "manual" },
  { market_key: "hhi", badge: "FREE", title: "Guided Nature Walk — Pinckney Island", description: "Saturday morning walks through the Pinckney Island Wildlife Refuge.", venue: "US Fish & Wildlife Service", expires: "Every Saturday 8 AM", source: "manual" },
  { market_key: "hhi", badge: "BOGO", title: "Happy Hour at Skull Creek Dockside", description: "Buy one cocktail, get one free every day 3–6 PM on the waterfront deck.", venue: "Skull Creek Dockside", expires: "Daily 3–6 PM", source: "manual" },
  { market_key: "hhi", badge: "15% OFF", title: "Art Classes at Arts Center of Coastal Carolina", description: "Watercolor, pottery, and mixed media classes for all skill levels.", venue: "Hilton Head", expires: "Spring session", source: "manual" },
  { market_key: "hhi", badge: "25% OFF", title: "Surf Lessons for Beginners", description: "Board rental + 90-min lesson at Folly Field Beach. Great for families.", venue: "Hilton Head Surf Co.", expires: "Expires May 15", source: "manual" },
  { market_key: "hhi", badge: "FREE", title: "Coligny Beach Park & Plaza", description: "Boardwalks, showers, and summer music near Coligny Circle.", venue: "Coligny Beach, HHI", expires: "Year-round", source: "manual" },
  { market_key: "hhi", badge: "FROM $35", title: "Harbour Town Lighthouse Climb", description: "Iconic striped lighthouse with views of Calibogue Sound.", venue: "Sea Pines — Harbour Town", expires: "Hours vary", source: "manual" },
  { market_key: "hhi", badge: "FREE", title: "Shelter Cove Harbour Summer Fireworks", description: "Fireworks over the marina — arrive early for dinner.", venue: "Shelter Cove Towne Centre", expires: "Tuesdays in season", source: "manual" },
  { market_key: "hhi", badge: "10% OFF", title: "Bike Rental — Leisure Trails", description: "Explore 60+ miles of flat paths; helmets and maps included.", venue: "Island bike shops", expires: "Book ahead", source: "manual" },
  { market_key: "hhi", badge: "FREE", title: "Mitchelville Freedom Park", description: "Interpretive trails on a historic Freedmen’s community site.", venue: "Fish Haul Creek area, HHI", expires: "Dawn to dusk", source: "manual" },
  { market_key: "hhi", badge: "20% OFF", title: "Stand-Up Paddleboard Eco Tour", description: "Calm-water intro through Broad Creek marshes.", venue: "Broad Creek, HHI", expires: "Morning & sunset", source: "manual" },
  { market_key: "hhi", badge: "FREE", title: "Jarvis Creek Park Pier", description: "Quiet fishing pier and trails — great for families.", venue: "Jarvis Creek, HHI", expires: "Year-round", source: "manual" },
  { market_key: "hhi", badge: "KIDS FREE", title: "Coastal Discovery Museum", description: "Honey Horn campus: exhibits, butterfly enclosure, and trails.", venue: "Coastal Discovery Museum", expires: "See calendar", source: "manual" },
  { market_key: "bluffton", badge: "FREE", title: "Old Town Bluffton Art Walk", description: "Galleries open late; meet artists on the May River.", venue: "Calhoun Street, Bluffton", expires: "Second Thursdays", source: "manual" },
  { market_key: "bluffton", badge: "FARM", title: "Bluffton Farmers Market", description: "Produce, seafood, baked goods, and music under the oaks.", venue: "Martin Family Park", expires: "Thursdays 12–5 PM", source: "manual" },
  { market_key: "bluffton", badge: "LIVE", title: "Music on the May", description: "Outdoor concerts overlooking the river in the heart of Old Town.", venue: "Bluffton Waterfront", expires: "Seasonal Fridays", source: "manual" },
  { market_key: "bluffton", badge: "TOUR", title: "Heyward House Historic Center", description: "Antebellum home and walking maps of Old Town Bluffton.", venue: "Heyward House", expires: "Wed–Sat", source: "manual" },
  { market_key: "bluffton", badge: "FREE", title: "Oscar Frazier Park Splash Pad", description: "Family-friendly play and picnic space near Buckwalter.", venue: "Bluffton", expires: "Seasonal hours", source: "manual" },
  { market_key: "bluffton", badge: "15% OFF", title: "Kayak the May River", description: "Guided paddles from Bluffton landings at golden hour.", venue: "Bluffton outfitters", expires: "Book ahead", source: "manual" },
  { market_key: "beaufort", badge: "TOUR", title: "Historic Beaufort Walking Tour", description: "Antebellum homes, film locations, and Lowcountry stories.", venue: "Downtown Beaufort", expires: "Weekend departures", source: "manual" },
  { market_key: "beaufort", badge: "FREE", title: "Henry C. Chambers Waterfront Park", description: "Swing benches, playground, and views of the Beaufort River.", venue: "Bay Street, Beaufort", expires: "Daily", source: "manual" },
  { market_key: "beaufort", badge: "MUSEUM", title: "Parris Island Museum", description: "Marine Corps history exhibits (off-base visitor access rules apply).", venue: "Parris Island", expires: "Check hours", source: "manual" },
  { market_key: "beaufort", badge: "BOAT", title: "Hunting Island State Park Day Trip", description: "Lighthouse, beach, and maritime forest — short drive from Beaufort.", venue: "Hunting Island", expires: "Park hours", source: "manual" },
  { market_key: "beaufort", badge: "FREE", title: "Spanish Moss Trail", description: "Paved rail-trail for bikes and strollers through the Lowcountry.", venue: "Beaufort area", expires: "Dawn to dusk", source: "manual" },
  { market_key: "savannah", badge: "FROM $28", title: "Savannah Riverboat Sightseeing", description: "Narrated cruise on the Savannah River past the port and historic district.", venue: "River Street", expires: "Multiple daily", source: "manual" },
  { market_key: "savannah", badge: "FREE", title: "Forsyth Park Fountain Stroll", description: "Iconic fountain, farmer’s market Saturdays, and wide live oaks.", venue: "Forsyth Park", expires: "Year-round", source: "manual" },
  { market_key: "savannah", badge: "WALK", title: "Historic Squares Self-Guided Walk", description: "22 squares, each with its own story — start at Johnson Square.", venue: "Savannah Historic District", expires: "Anytime", source: "manual" },
  { market_key: "savannah", badge: "MUSEUM", title: "Telfair Museums Campus", description: "Jepson, Telfair Academy, and Owens-Thomas House — art and architecture.", venue: "Telfair Square area", expires: "Closed Mondays", source: "manual" },
  { market_key: "savannah", badge: "FOOD", title: "River Street Sweets & River Walk", description: "Pralines, candy kitchen views, and cobblestone riverfront.", venue: "River Street", expires: "Daily", source: "manual" },
];

async function seed() {
  console.log("Seeding events...");
  const { error: e1 } = await supabase.from("events").insert(eventsData);
  console.log(e1 ? `  Error: ${e1.message}` : `  OK: ${eventsData.length} events`);

  console.log("Seeding news...");
  const { error: e2 } = await supabase.from("news").insert(newsData);
  console.log(e2 ? `  Error: ${e2.message}` : `  OK: ${newsData.length} news articles`);

  console.log("Seeding openings...");
  const { error: e3 } = await supabase.from("openings").insert(openingsData);
  console.log(e3 ? `  Error: ${e3.message}` : `  OK: ${openingsData.length} openings`);

  console.log("Seeding things to do...");
  const { error: e4 } = await supabase.from("things_to_do").insert(thingsToDoData);
  console.log(e4 ? `  Error: ${e4.message}` : `  OK: ${thingsToDoData.length} things to do`);

  console.log("\nDone!");
}

seed();
