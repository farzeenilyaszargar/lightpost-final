"use client";

import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import React, { useState, useEffect } from "react";

const SIZE = 3; // 3x3 puzzle

// Generate shuffled puzzle
const shuffle = (arr: number[]) => {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export default function SlidingPuzzle() {
    const [tiles, setTiles] = useState<number[]>([]);
    const [moveCount, setMoveCount] = useState(0);

    useEffect(() => {
        const initialTiles = shuffle([...Array(SIZE * SIZE).keys()]);
        setTiles(initialTiles);
    }, []);

    const moveTile = (index: number) => {
        const emptyIndex = tiles.indexOf(0);
        const row = Math.floor(index / SIZE);
        const col = index % SIZE;
        const emptyRow = Math.floor(emptyIndex / SIZE);
        const emptyCol = emptyIndex % SIZE;

        const isAdjacent =
            (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
            (col === emptyCol && Math.abs(row - emptyRow) === 1);

        if (isAdjacent) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIndex]] = [
                newTiles[emptyIndex],
                newTiles[index],
            ];
            setTiles(newTiles);
            setMoveCount((prev) => prev + 1);
        }
    };

    const isSolved = () => {
        // Last tile must be empty (0)
        if (tiles[tiles.length - 1] !== 0) return false;

        // All others in increasing order
        for (let i = 0; i < tiles.length - 1; i++) {
            if (tiles[i] !== i + 1) return false;
        }
        return true;
    };

    return (
        <div className="w-screen h-screen flex flex-col items-center">
            <Header />
            <NavbarComp />
            <div className="flex flex-col items-center justify-center h-full w-5/6 border-l border-r border-border font-menu">
                <h1 className="text-2xl font-bold mb-4">Sliding Puzzle</h1>
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${SIZE}, 80px)` }}
                >
                    {tiles.map((tile, idx) => (
                        <button
                            key={idx}
                            className={`w-20 h-20 text-xl font-bold rounded ${tile === 0
                                ? "bg-gray-300"
                                : "bg-secondary-col text-white"
                                }`}
                            onClick={() => moveTile(idx)}
                        >
                            {tile !== 0 ? tile : ""}
                        </button>
                    ))}
                </div>
                <p className="mt-4">Moves: {moveCount}</p>
                {isSolved() && <p className="mt-2 text-green-600 font-bold">You solved it! 🎉</p>}
                <button
                    className="mt-4 px-4 py-2 bg-string-primary text-background rounded hover:opacity-85"
                    onClick={() => { setTiles(shuffle([...Array(SIZE * SIZE).keys()])); setMoveCount(0) }}
                >
                    Shuffle
                </button>
            </div>
        </div>
    );
};

