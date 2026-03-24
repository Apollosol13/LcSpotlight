export function Newsletter() {
  return (
    <section className="bg-spotlight-gold px-5 py-12 text-center min-[601px]:px-10">
      <div className="mx-auto max-w-[540px]">
        <h2 className="mb-2 font-serif text-[32px] font-normal text-spotlight-navy">
          Stay in the <em className="italic">loop</em>
        </h2>
        <p className="mb-6 text-sm font-light text-[rgba(12,27,51,0.65)]">
          The Spotlight weekly digest — events, openings, deals, and market
          news, delivered every Thursday morning.
        </p>
        <div className="mx-auto flex max-w-[400px]">
          <input
            type="email"
            placeholder="your@email.com"
            className="min-w-0 flex-1 rounded-l-[2px] border-0 bg-white px-4 py-3 text-sm text-spotlight-navy placeholder:text-spotlight-text-muted focus:outline-none"
          />
          <button
            type="button"
            className="rounded-r-[2px] bg-spotlight-navy px-5 py-3 text-[13px] font-medium uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-85"
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
