import cors from 'cors';
import express from 'express';

type CachedPrice = { price: number; timestamp: number };
type Provider = { name: string; getPrice: () => Promise<number> };

const app = express();
const cache = new Map<string, CachedPrice>();
const CACHE_TTL_MS = 30_000;

app.use(cors({ origin: 'http://localhost:5173' }));

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.json();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) throw new Error('Unexpected API response');
  return value as Record<string, unknown>;
}

function positivePrice(value: unknown): number {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) throw new Error('Provider returned an invalid price');
  return price;
}

const providers: Provider[] = [
  {
    name: 'Coinbase',
    getPrice: async () => {
      const payload = asRecord(await fetchJson('https://api.coinbase.com/v2/prices/BTC-USD/spot'));
      return positivePrice(asRecord(payload.data).amount);
    },
  },
  {
    name: 'Kraken',
    getPrice: async () => {
      const payload = asRecord(await fetchJson('https://api.kraken.com/0/public/Ticker?pair=XBTUSD'));
      const result = asRecord(payload.result);
      const ticker = asRecord(Object.values(result)[0]);
      return positivePrice((ticker.c as unknown[])[0]);
    },
  },
  {
    name: 'Bitfinex',
    getPrice: async () => {
      const payload = await fetchJson('https://api-pub.bitfinex.com/v2/ticker/tBTCUSD');
      if (!Array.isArray(payload)) {
        throw new Error('Unexpected Bitfinex response');
      }
      return positivePrice(payload[6]);
    },
  },
  {
    name: 'Gemini',
    getPrice: async () => {
      const payload = asRecord(await fetchJson('https://api.gemini.com/v1/pubticker/btcusd'));
      return positivePrice(payload.last);
    },
  },
];

async function getCachedPrice(provider: Provider): Promise<number> {
  const cached = cache.get(provider.name);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.price;

  const price = await provider.getPrice();
  cache.set(provider.name, { price, timestamp: Date.now() });
  return price;
}

app.get('/prices', async (req, res) => {
  const amount = Number(req.query.amount);
  if (req.query.amount === undefined || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'amount must be a positive number' });
  }

  const settled = await Promise.allSettled(
    providers.map(async (provider) => ({ provider: provider.name, price: await getCachedPrice(provider) })),
  );

  const prices = settled.flatMap((result, index) => {
    if (result.status === 'rejected') {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      console.error(`${providers[index].name} failed: ${reason}`);
      return [];
    }
    return [{ ...result.value, btc: amount / result.value.price }];
  });

  return res.json(prices.sort((a, b) => b.btc - a.btc));
});

app.listen(4000, () => console.log('Price API listening on http://localhost:4000'));
