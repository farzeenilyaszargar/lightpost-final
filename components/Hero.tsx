'use client';

import Image from "next/image";
import { useState } from "react";

export default function Hero()
{
    const [ visible, setVis ] = useState(true);
    
        return(

            <div className={visible?`w-screen flex items-center justify-center`:`hidden`}>
                <div className=" w-5/6  text-black border-l border-r border-border">
                    <div className="m-5 h-30 bg-hero-bg text-hero-txt  rounded-4xl flex justify-around items-center overflow-hidden relative">
                        <div className="w-1/3 flex items-center justify-end">
                            <Image src={'/images/robo.png'} alt="robo" width={100} height={100} className=" w-15 md:w-25   "/>
                        </div>
                        <p className="md:text-2xl font-main font-black md:w-1/3 text-center ">get unbaised news curated by AI and react to news ☺️</p>
                        <button onClick={()=>setVis(!visible)} className=" flex justify-end items-center w-1/3 focus:outline-none">
                            <Image src={'/icons/cross.png'} alt="x" width={25} height={25} className="md:w-7 w-5 mr-10 invert-[var(--reverse-invert)]"/>
                        </button>
                    </div>
                </div>
            </div>

        );

}