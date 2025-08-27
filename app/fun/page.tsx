import Link from "next/link";
import Header from "@/components/Header";

import Image from "next/image";
import NavbarComp from "@/components/NavBar";


export default function Home() {
    return (
        <div className="flex flex-col items-center h-screen">
            <Header />
            <NavbarComp />
            <div className=" flex justify-center items-center h-full w-5/6  pt-10 pb-10 flex-col border-l border-r border-border">
                <div className="md:grid grid-cols-3 grid-rows-2 gap-5 h-1/2 w-5/6 ">
                    <Link href={'/fun/crossword'} className="bg-[#FF073A] row-span-2 col-span-1 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/crossword.png')] bg-center bg-no-repeat relative">
                        <div className="absolute bg-[#FF073A] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-md shadow-black z-10 text-stroke ">Crossword</h1>

                    </Link>
                    <Link href={'/fun/sudoku'} className="bg-[#00FFFF] row-span-1 col-span-1 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/sudoku.png')] bg-cover bg-center bg-no-repeat relative">
                        <div className="absolute bg-[#00FFFF] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-lg shadow-black z-10 text-stroke">Sudoku</h1>

                    </Link>

                    <Link href={'/fun/math'} className="bg-[#39FF14] row-span-1 col-span-1 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/math.jpeg')] bg-center bg-no-repeat relative">
                        <div className="absolute bg-[#39FF14] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-md shadow-black z-10 text-stroke">Mental Math</h1>

                    </Link>

                    <Link href={'/fun/comic'} className="bg-[#FF4500] row-span-1 col-span-2 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/comic.jpeg')] bg-center bg-cover bg-no-repeat relative">
                        <div className="absolute bg-[#FF4500] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-md shadow-black z-10 text-stroke">Comics</h1>

                    </Link>
                    
                    

                </div>
                <div className="md:grid grid-cols-3 grid-rows-2 gap-5 h-1/2 w-5/6 pt-5">
                    
                    <Link href={'/fun/crossword'} className="bg-[#FFFF33] row-span-1 col-span-2 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/sudoku.png')] bg-center bg-cover bg-no-repeat relative">
                        <div className="absolute bg-[#FFFF33] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-md shadow-black z-10 text-stroke">Riddle Me A Riddle</h1>

                    </Link>
                    
                    <Link href={'/fun/sudoku'} className="bg-[#8A2BE2] row-span-2 col-span-1 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/chess.png')] bg-center bg-cover bg-no-repeat relative">
                        <div className="absolute bg-[#8A2BE2] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-md shadow-black z-10 text-stroke  ">Chess Puzzles</h1>

                    </Link>
                    
                
                    <Link href={'/fun/comic'} className="bg-[#FF00FF] row-span-1 col-span-1 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/comic.jpeg')] bg-center bg-cover bg-no-repeat relative">
                        <div className="absolute bg-[#FF00FF] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-3xl text-shadow-md shadow-black z-10 text-stroke">Sliding Boxes</h1>

                    </Link>
                    <Link href={'/fun/comic'} className="bg-[#00FA9A] row-span-1 col-span-1 border  
                    overflow-hidden rounded-2xl border-border flex justify-center items-center bg-[url('/images/comic.jpeg')] bg-center bg-cover bg-no-repeat relative">
                        <div className="absolute bg-[#00FA9A] w-full h-full opacity-80 hover:opacity-100 transition-all ease-in duration-150"></div>
                        <h1 className="font-black text-2xl text-shadow-md shadow-black z-10 text-stroke flex  ">Spot The Difference</h1>

                    </Link>

                </div>
            </div>
        </div>
    );
}
