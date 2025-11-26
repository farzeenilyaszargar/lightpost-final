import Link from "next/link";
import Header from "@/components/Header";

import Image from "next/image";
import NavbarComp from "@/components/NavBar";


export default function Home() {
    return (
        <div className="flex flex-col items-center h-screen ">
            <Header />
            <NavbarComp />
            <div className=" flex justify-center items-center h-full w-5/6  pt-10 pb-10 flex-col border-l border-r border-border font-main">
                <div className="md:grid grid-cols-4 grid-rows-3 gap-5 h-full w-5/6 text-border">

                    <Link href={'/fun/hangman'} className=" row-span-1 col-span-1 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102">
                        <div className="absolute w-full h-full  z-0"></div>
                        <h1 className="font-black text-3xl z-10">Hangman</h1>
                    </Link>

                    <Link href={'/fun/sudoku'} className=" row-span-1 col-span-1 border overflow-hidden rounded-2xl border-border flex justify-center items-center  relative hover:scale-102">
                        <div className="absolute w-full h-full z-0"></div>
                        <h1 className="font-black text-3xl z-10">Sudoku</h1>
                    </Link>
                    <Link href={'/fun/comic'} className=" row-span-2 col-span-2 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102">
                        <div className="absolute w-full h-full  z-0"></div>
                        <h1 className="font-black text-3xl z-10">Comics</h1>
                    </Link>

                    <Link href={'/fun/math'} className="row-span-1 col-span-2 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102">
                        <div className="absolute w-full h-full  z-0"></div>
                        <h1 className="font-black text-3xl z-10">Maths Puzzles</h1>
                    </Link>

                    <Link href={'/fun/chess'} className=" row-span-1 col-span-3 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102">
                        <div className="absolute w-full h-full  z-0"></div>
                        <h1 className="font-black text-3xl z-10">Chess Puzzle Of The Day</h1>

                    </Link>


                    <Link href={'/fun/sliding'} className=" row-span-1 col-span-1 border overflow-hidden rounded-2xl border-border flex justify-center items-center relative hover:scale-102">
                        <div className="absolute w-full h-full z-0"></div>
                        <h1 className="font-black text-3xl z-10">Sliding Boxes</h1>

                    </Link>

                </div>
            </div>
        </div>
    );
}
