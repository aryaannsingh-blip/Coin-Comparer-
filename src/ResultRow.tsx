import { useState } from "react";

type ResultRowProps = {
  provider?: string;
  price?: number;
  btc?: number;
  diff?: number;
  best?: boolean;
  loading?: boolean;
};

const INVERT_LOGOS = false;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ResultRow({
  provider,
  price,
  btc,
  diff = 0,
  best,
  loading,
}: ResultRowProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoPath = provider
    ? `/exchanges/${provider.toLowerCase().replace(/\s+/g, "")}.svg`
    : "";

  if (loading && btc === undefined) {
    return (
      <div className="flex h-[88px] w-full items-center justify-between rounded-xl border border-border bg-panel px-4 transition-colors duration-150 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-fg/5" />
          <div className="h-5 w-28 animate-pulse rounded bg-fg/5" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-32 animate-pulse rounded bg-fg/5" />
          <div className="h-3 w-20 animate-pulse rounded bg-fg/5" />
        </div>
      </div>
    );
  }

  return (
    <article
      className={`flex min-h-[88px] w-full items-center justify-between gap-3 rounded-xl border bg-panel px-4 text-fg transition-colors duration-150 hover:border-border-hover hover:bg-panel-hover sm:px-6 ${
        best ? "border-gain/40" : "border-border"
      } ${loading ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {provider && !logoFailed ? (
          <img
            src={logoPath}
            alt=""
            onError={() => setLogoFailed(true)}
            className={`h-8 w-auto max-w-12 shrink-0 object-contain ${
              INVERT_LOGOS ? "dark:invert" : ""
            }`}
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-hover text-sm font-semibold text-fg">
            {provider?.charAt(0).toUpperCase() ?? "?"}
          </span>
        )}
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-base font-semibold sm:text-lg">{provider ?? "Exchange"}</span>
          {best && (
            <span className="rounded-full border border-gain/30 bg-gain/10 px-2 py-0.5 text-[10px] font-medium text-gain sm:text-xs">
              Best price
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div
          className={`whitespace-nowrap font-mono text-xl tabular-nums sm:text-2xl ${
            best ? "text-gain" : "text-fg"
          }`}
        >
          {btc?.toFixed(8) ?? "0.00000000"}
          <span className="ml-1 text-sm text-muted sm:text-base">BTC</span>
        </div>
        <div className="mt-0.5 flex justify-end gap-2 text-xs font-mono tabular-nums text-muted">
          {price !== undefined && <span>{usd.format(price)}</span>}
          {!best && Math.abs(diff) < 0.01 && (
            <span>&lt;0.01% less</span>
          )}
          {!best && Math.abs(diff) >= 0.01 && (
            <span className="text-loss">-{Math.abs(diff).toFixed(2)}%</span>
          )}
        </div>
      </div>
    </article>
  );
}
