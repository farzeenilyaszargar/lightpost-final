"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import NavbarComp from "@/components/NavBar";

type Comic = {
  num: number;
  title: string;
  img: string;
  alt: string;
};

export default function ComicStrip() {
  const [comic, setComic] = useState<Comic | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLatestComic = async () => {
    try {
      setLoading(true);
      // Fetch the latest comic using the official JSON interface
      const randomId = Math.floor(Math.random() * 3100) + 1;
      const res = await fetch(`https://xkcd.now.sh/?comic=${randomId}`);
      const data: Comic = await res.json();

      setComic(data);
    } catch (err) {
      console.error("Failed to fetch comic:", err);
      setComic(null);
      alert("Unable to fetch comic. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestComic();
  }, []);



  return (
    <div className="flex flex-col items-center">
      <Header />
      <NavbarComp />
      {
        (!comic) ? (
          <div className=" flex flex-col items-center pt-10 pb-10  border-l border-r w-5/6 border-border min-h-screen">
            <p>No Comic Availible Currently 😔</p>
          </div>
        ) :

          <div className="flex flex-col items-center pt-10 pb-10  border-l border-r w-5/6 border-border min-h-screen">
            <div className="md:w-1/2  border p-5 border-border rounded-2xl flex flex-col  items-center">
            <div className="flex flex-row justify-between w-full items-center pb-3 pt-2">
              <h2 className="text-xl font-bold  border-b border-border">{comic.title}</h2>

              <button onClick={async () => (await fetchLatestComic())} className="border p-1  font-bold rounded-2xl pl-3 pr-3 border-border bg-string-primary text-background hover:bg-background hover:text-string-primary duration-250 transition-all">Next 👉</button>

            </div>
              <button onClick={() => { }}>
                <Image
                  src={`${comic.img}`}
                  alt={comic.alt}
                  width={1000}
                  height={500}
                  className=" min-w-full h-auto "
                />

              </button>

              <p className="text-gray-400 italic mt-3">{comic.alt}</p>


            </div>

          </div>
      }


    </div>

  );
}


