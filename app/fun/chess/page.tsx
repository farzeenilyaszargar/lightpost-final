'use client';

import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import { useState, useEffect } from "react";

interface PuzzleData {
    Players: string;
    Site: string;
    Image: string;
    Link: string;
    Text: string;
}

export default function Chess() {
    const [chess, setChess] = useState<PuzzleData | null>(null);




    useEffect(() => {
        async function getPuzzle() {
            try {
                const res = await fetch("https://chesspuzzle.net/Daily/Api");
                if (!res.ok) throw new Error("Failed to fetch puzzle");
                const data = await res.json();
                setChess(data);
            } catch (err) {
                console.error("Error fetching puzzle:", err);
            }
        }

        getPuzzle();
    }, []);

    if (!chess) {
        return <p className="h-screen w-screen justify-center flex items-center">Loading daily puzzle...</p>;
    }
    return (
        <div className="w-screen h-screen flex flex-col items-center">
            <Header />
            <NavbarComp />
            <div className="border-border border-l border-r w-5/6 h-full flex flex-col justify-center items-center">
            <h1 className="font-black text-2xl mb-5">Daily Chess Puzzle</h1>
                <div className="border-border border rounded-2xl p-5 w-1/2 flex flex-col  items-center mb-10">
                    <p  className="font-semibold underline text-xl">{chess.Players.replace("-", " vs. ")}</p>
                    <span className="font-medium text-base mb-5">{chess.Site.replace(/<br\s*\/?>/gi, " ")}</span>

                    <a id="" href={chess.Link}>
                        <img id="" alt="Daily Chess Puzzle" src={chess.Image} className="w-90"/>
                    </a><br />
                    <h3 className="">{chess.Text} !</h3>
                </div>
            </div>
        </div>


    );
}