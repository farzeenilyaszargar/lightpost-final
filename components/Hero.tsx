"use client";

import Image from "next/image";
import Icon from "./Icon";
import { useState } from "react";

export default function Hero() {
  const [visible, setVis] = useState(true);

  return (
    <div
      className={
        visible ? `w-screen flex items-center justify-center` : `hidden`
      }
    >
      <div className=" w-5/6 border-l border-r border-border">
        <div className="m-5 h-30 bg-hero-bg text-hero-txt  rounded-4xl flex justify-around items-center overflow-hidden relative">
          <div className="w-1/3 flex items-center justify-end">
            <Image
              src={"/images/robo.png"}
              alt="robo"
              width={100}
              height={100}
              className=" w-15 md:w-25   "
            />
          </div>
          <p className="md:text-2xl font-main font-black md:w-1/3 text-center ">
            get the latest news, straight from the source ☺️
          </p>
          <button
            aria-label="Dismiss introduction"
            onClick={() => setVis(!visible)}
            className=" flex justify-end items-center w-1/3 focus:outline-none"
          >
            <Icon name="close" size={24} className="shrink-0 mr-6 md:mr-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
