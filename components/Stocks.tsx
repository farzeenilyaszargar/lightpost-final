'use client';

import { useEffect, useState } from "react";

interface Stock {
  symbol: string;
  name: string;
  close: number | null;
  currency: string;
}

export default function Stocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/api/stocks");
        const text = await res.text(); // read as text first
        if (!text) throw new Error("Empty response");
        const data: Stock[] = JSON.parse(text); // parse manually
        setStocks(data);
      } catch (err: any) {
        console.error("Failed to fetch stocks:", err);
        setError("Failed to fetch stock data. Try again later.");
      }
    };
    fetchStocks();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Stock Closing Prices</h1>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.name} ({stock.symbol}):{" "}
            {stock.close !== null ? stock.close : "N/A"} {stock.currency}
          </li>
        ))}
      </ul>
    </div>
  );
}
