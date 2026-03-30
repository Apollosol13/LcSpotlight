import Link from "next/link";

const cards = [
  {
    href: "/business/events",
    title: "Events",
    body: "Add or edit events that appear on the public calendar.",
  },
  {
    href: "/business/things-to-do",
    title: "Things to do",
    body: "List your activity, venue, or experience in the directory.",
  },
  {
    href: "/business/discounts",
    title: "Discounts",
    body: "Publish offers and promotions for readers on the deals page.",
  },
] as const;

export default function BusinessDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Business dashboard</h1>
      <p className="mt-2 max-w-xl text-sm text-white/50">
        Manage your listings across LCSpotlight. Only items you create here are tied to your
        account.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block rounded-lg border border-white/10 bg-white/[0.03] p-5 no-underline transition hover:border-spotlight-gold/35 hover:bg-white/[0.05]"
            >
              <h2 className="text-base font-medium text-spotlight-gold">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/45">{c.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
