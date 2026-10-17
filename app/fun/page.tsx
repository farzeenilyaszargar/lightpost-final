import Link from "next/link";
import Header from "@/components/Header";

import NavbarComp from "@/components/NavBar";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen ">
      <Header />
      <NavbarComp />
      <div
        id="main"
        className=" flex justify-center items-center h-full w-5/6  pt-10 pb-10 flex-col border-l border-r border-border font-main"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-5 h-full w-5/6 text-border">
          <Link
            href={"/fun/hangman"}
            className=" md:row-span-1 md:col-span-1 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102"
          >
            <div className="absolute w-full h-full  z-0"></div>
            <h1 className="font-black text-3xl p-5 z-10">Hangman</h1>
          </Link>

          <Link
            href={"/fun/sudoku"}
            className=" md:row-span-1 md:col-span-1 border overflow-hidden rounded-2xl border-border flex justify-center items-center  relative hover:scale-102"
          >
            <div className="absolute w-full h-full z-0"></div>
            <h1 className="font-black text-3xl p-5 z-10">Sudoku</h1>
          </Link>
          <Link
            href={"/fun/comic"}
            className=" md:row-span-2 md:col-span-2 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102"
          >
            <div className="absolute w-full h-full  z-0"></div>
            <h1 className="font-black text-3xl p-5 z-10">Comics</h1>
          </Link>

          <Link
            href={"/fun/math"}
            className="md:row-span-1 md:col-span-2 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102"
          >
            <div className="absolute w-full h-full  z-0"></div>
            <h1 className="font-black text-3xl p-5 z-10">Maths Puzzles</h1>
          </Link>

          <Link
            href={"/fun/chess"}
            className=" md:row-span-1 md:col-span-3 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102"
          >
            <div className="absolute w-full h-full  z-0"></div>
            <h1 className="font-black text-3xl p-5 z-10">
              Chess Puzzle Of The Day
            </h1>
          </Link>

          <Link
            href={"/fun/sliding"}
            className=" md:row-span-1 md:col-span-1 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102"
          >
            <div className="absolute w-full h-full z-0"></div>
            <h1 className="font-black text-3xl p-5 z-10">Sliding Boxes</h1>
          </Link>
        </div>
      </div>
    </div>
  );
}
