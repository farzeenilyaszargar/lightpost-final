'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";


function Top() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0"); // 01–31
    const month = currentDate.toLocaleString("en-US", { month: "long" }); // January–December
    const year = currentDate.getFullYear();

    const dateTxt = `${day} ${month}, ${year}`;

    return (
        <div className="w-screen border-b flex justify-center --font-menu h-6 border-border">
            <div className="w-5/6 border-l border-r flex justify-end text-[10px] border-border relative items-center">
                <div className="  right-0 pr-5 text-string-secondary">
                    <p>{dateTxt}</p> {/*fetch todays date*/}

                </div>
            </div>
        </div>
    );
}




export default function Header() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {

        const storedMode = localStorage.getItem('darkMode');
        const isDark = storedMode === 'true';
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    })

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('darkMode', `${newMode}`);
            document.documentElement.classList.toggle('dark', newMode);
            return newMode;
        });
    };
    

    return (
        <div className="w-full  flex flex-col  items-center border-border border-b">
            <Top />

            <div className="flex  w-5/6 md:justify-around relative border-l border-r border-border  ">
                <Link href="/" className="md:text-5xl text-3xl  font-logo pt-3 pb-3 ">LIGHTPOST</Link>
                <div className="absolute right-0 h-full flex items-center ">
                    <button onClick={toggleDarkMode}>
                        {darkMode ? (
                            <Image src="/icons/sun.png" alt="sun" width={25} height={25} className="invert-[var(--my-invert)]" />
                        ) : (
                            <Image src="/icons/moon.png" alt="moon" width={25} height={25} className="invert-[var(--my-invert)]" />
                        )}
                    </button>
                    <Link href={'/'} className=" m-3">
                        <Image src={"/icons/profile.png"} alt="prof" width={35} height={35} className="invert-[var(--my-invert)]" />
                    </Link>

                </div>

            </div>
        </div>
    );
};
