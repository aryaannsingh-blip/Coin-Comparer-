import { useEffect, useState } from "react";
import AmountInput from "./AmountInput";
import ResultRow from "./ResultRow";
import { useTheme } from "./useTheme";

const TITLE = "Find the BTC";

type PriceResult = {
  provider: string;
  price: number;
  btc: number;
};

type PriceData = {
  amount: string;
  results: PriceResult[];
  error: string | null;
};

function App() {
  const [amount, setAmount] = useState("100");
  const [data, setData] = useState<PriceData | null>(null);

  const key = amount.trim();
  const numericAmount = Number(key);
  const validAmount =
    key !== "" && Number.isFinite(numericAmount) && numericAmount > 0;

  // Derived from state, so the effect never has to reset anything
  const current = data && data.amount === key ? data : null;
  const loading = validAmount && !current;
  const results = validAmount && data ? data.results : [];
  const error = validAmount && current ? current.error : null;
  const best = results[0]?.btc;
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!validAmount) return;

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/prices?amount=${encodeURIComponent(key)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Price request failed.");
        const prices = (await response.json()) as PriceResult[];
        setData({ amount: key, results: prices, error: null });
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setData({
          amount: key,
          results: [],
          error: "Could not load prices. Check that the backend is running on port 4000.",
        });
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [key, validAmount]);

  return (
    <div className="min-h-screen bg-page text-fg transition-colors duration-150">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-8 pt-5 sm:pt-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-colors duration-150 hover:border-border-hover hover:bg-panel-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {theme === "dark" ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.6 8.6 0 1 0 20.5 15.2Z" />
              </svg>
            )}
          </button>
        </div>

        <h1 className="mt-4 text-center text-5xl leading-none sm:text-6xl">
          <span className="title-tricolor">{TITLE}</span>
        </h1>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-[240px]">
            <label htmlFor="amount" className="sr-only">Amount in USD</label>
            <AmountInput
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {error && !loading && (
          <p className="mt-4 text-center text-sm text-loss">{error}</p>
        )}
        {!validAmount && (
          <p className="mt-4 text-center text-sm text-muted">Enter a positive amount to see prices.</p>
        )}
        {validAmount && !loading && !error && results.length === 0 && (
          <p className="mt-4 text-center text-sm text-muted">No prices available right now.</p>
        )}

        <section aria-label="Exchange prices" className="mt-8 flex flex-col gap-3">
          {loading && results.length === 0 &&
            [0, 1, 2, 3].map((i) => <ResultRow key={i} loading />)}

          {results.map((r, i) => (
            <ResultRow
              key={r.provider}
              provider={r.provider}
              price={r.price}
              btc={r.btc}
              best={i === 0}
              diff={best ? (r.btc / best - 1) * 100 : 0}
              loading={loading}
            />
          ))}
        </section>

        <footer className="mt-auto pt-12 text-center text-xs text-muted">
          Not affiliated with the exchanges shown. Prices are indicative.
        </footer>
      </main>
    </div>
  );
}

export default App;
