import { NextRequest } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: NextRequest) {
  const symbols = ["AAPL", "MSFT", "GOOG"]; // your 5-10 stocks

  try {
    const promises = symbols.map(async (symbol) => {
      try {
        const item = await yahooFinance.quoteSummary(symbol, { modules: ["price"] });
        if (item?.price) {
          return {
            symbol,
            name: item.price.shortName || symbol,
            close: item.price.regularMarketPreviousClose ?? null,
            currency: item.price.currency ?? "USD",
          };
        }
      } catch (e) {
        console.error(`Failed to fetch ${symbol}:`, e);
      }
      // fallback if fetch fails
      return { symbol, name: symbol, close: null, currency: "USD" };
    });

    const data = await Promise.all(promises);

    // Always return JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API failed:", error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
