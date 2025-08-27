'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import placeholder from "../../../public/placeholder.png";
import React from "react";
import WordOfTheDay from "./WordDay";
import ImpButtons from "@/components/Buttons";



type NewsItem = {
    id: string;
    title: string;
    description: string;
    summary: string;
    published_at: string;
    image_url?: string | null;
    bias_score: number;
    bias_reason: string;
    topic: string;
    rating: number;
    likes: number;
    dislikes: number;
};

function renderBoldMarkdown(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}



export default function LatestNews() {
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        async function loadNews() {
            const res = await fetch('/api/news');
            const data = await res.json();
            setNews(data);
        }
        loadNews();


    }, []);



    const newsDa = news.map((item, index) => ({
        ...item,
        id: index // 0,1,2,...
    }));





    return (


        <div className=" mt-5 grid grid-cols-4  border">
           


            {

                news.map(item => (
                    <React.Fragment key={item.id}>
                        {/* {item.id === 1 && (
                            <div className="border p-4 text-center col-span-1  h-fit">
                                <h2>Word of the Day</h2>
                                <p>ai summary</p>
                            </div>
                        )}
                        {item.id === 0 && (
                            <div className="border p-4 text-center col-span-1 h-fit">
                                <h2>Summary of the Day</h2>
                                <p>ai summary of the day here lofkadsjdkdsjf lk sjdflk dj</p>
                            </div>
                        )} */}


                        <div key={item.id} className={`border p-3  h-fit `}>
                            {
                                item.image_url ?
                                    (
                                        <Image src={item.image_url} alt={item.title} width={200} height={100} className='w-full' />

                                    ) :
                                    (
                                        <Image src={placeholder} alt={"placeholder"} width={200} height={100} className='w-full' />

                                    )
                            }
                            <h2 className={`font-semibold text-xl mt-2 mb-2 font-title font-color `}>{item.title}</h2>
                            <p className="text-secondary font-para">{(item.description)}</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {new Date(item.published_at).toLocaleString()}
                            </p>
                            <div className="relative w-1/3 h-4 bg-gray-200 rounded-full">
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: "linear-gradient(to right, #1b3a57 0%, #555555 50%, #5c2f1f 100%)"
                                    }}
                                />

                                <div
                                    className="absolute top-0 h-full w-1 bg-white "
                                    style={{ left: `${item.bias_score * 10}%` }}
                                />
                            </div>

                            <p>{item.bias_reason}</p>
                            <p className="border w-fit rounded ">{item.topic}</p>
                            <p>{item.rating}</p>
                        </div>







                    </React.Fragment>


                ))}




        </div>



    //     <div className="flex md:flex-row flex-col w-5/6 border-border justify-between pt-5 border-l border-r gap-5 p-5 font-main">
    //         <div className=" md:w-1/4 space-y-5 ">
                
    //             <h1 className="text-xl p-3 mb-0 font-bold -mt-3 ">What Happening 🌏</h1>

    //             <div className="border border-border p-3 rounded-2xl ">
    //                 <p className="text-string-secondary text-sm">ai sumaajdh dsj hjd sah kdjsah kjdahkjas kjdsak jdahskdj ashkjd kjsah dkja kjshdkas kjahskjd asjdh jas jdas jsakdj asjdas hd gsja shjd asjdhjg asjdg jhsa dgjhsa dgjhsa jdgsah asdgh dgsh gdash kjashdkjashdkjk</p>
    //             </div>
    //             <div className="space-y-4">
    //                 <div className="p-3  border border-border rounded-2xl ">
    //                     <h1 className="text-xl mb-2">Trump Fucks Himselfs 😬</h1>
    //                     <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full blImg rounded-2xl opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>
    //                 </div>
    //                 <div className="p-3  border border-border rounded-2xl ">
    //                     <h1 className="text-xl">Trump Fucks Himselfs 😬</h1>
    //                     <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full rounded-2xl opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                 </div>
    //                 <div className="p-3  border border-border rounded-2xl ">
    //                     <h1 className="text-xl">Trump Fucks Himselfs 😬</h1>
    //                     <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full rounded-2xl opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                 </div>
    //             </div>
    //         </div>
    //         <div className="md:w-1/2  border-border ">
    //             <div className="mb-5">
    //                 <div className="p-3 border border-border rounded-2xl">
    //                     <h1 className="text-3xl mb-3 font-black">Trump Fucks Himself In The Ass 😬 Loly NGL</h1>
    //                     <Image src={"/images/ex1.png"} alt="ex1" width={2000} height={2000} className="w-full rounded-2xl opacity-[var(--my-opacity)] " />
    //                     <p className="font-para text-sm mt-2 text-string-secondary">dkjashkd asdkjas jkdh askjd hksajd kjash dkjaskdja kjshd sdanda kjhas kjdh dajksd jkas j
    //                         dkjashkd asdkjas jkdh askjd hksajd kjash dkjaskdja kjshd kjhas kjdh dajksd jkas j asdmasndm
    //                         dkjashkd asdkjas jkdh askjd hksajd kjash dkjaskdja kjshd kjhas kjdh dajksd jkas j </p>
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                 </div>
    //             </div>
    //             <div className="flex flex-row space-x-5">
    //                 <div className="w-1/2 space-y-5 ">
    //                     <div className="p-3 border border-border rounded-2xl">
    //                         <h1 className="text-xl">Indian Army Finishes Off USA</h1>
    //                         <Image src={"/images/ex3.avif"} alt="ex1" width={100} height={100} className="w-full opacity-[var(--my-opacity)]" />
    //                                                 <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                     </div>
    //                     <div className="p-3 border border-border rounded-2xl">
    //                         <h1 className="text-xl">Trump Fucks Himselfs</h1>
    //                         <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full opacity-[var(--my-opacity)]" />
    //                                                 <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                     </div>
    //                 </div>
    //                 <div className="w-1/2  border-border space-y-5 ">
    //                     <div className="p-3 border border-border rounded-2xl">
    //                         <h1 className="text-xl">Trump Fucks Himselfs</h1>
    //                         <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                     </div>
    //                     <div className="p-3 border border-border rounded-2xl">
    //                         <h1 className="text-xl">Trump Fucks Himselfs</h1>
    //                         <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                     </div>
    //                 </div>

    //             </div>

    //         </div>
    //         <div className="md:w-1/4 space-y-5">
    //             <div className="border p-5 border-border rounded-2xl">
    //                 <WordOfTheDay/>    
    //              </div>

    //             <div className="space-y-5">
    //                 <div className="p-3 border border-border rounded-2xl">
    //                     <h1 className="text-xl">Trump Fucks Himselfs</h1>
    //                     <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                 </div>
    //                 <div className="p-3 border border-border rounded-2xl">
    //                     <h1 className="text-xl">Trump Fucks Himselfs</h1>
    //                     <Image src={"/images/ex2.jpeg"} alt="ex1" width={100} height={100} className="w-full opacity-[var(--my-opacity)]" />
    //                     <ImpButtons comments={23} likes={21} dislikes={10}/>

    //                 </div>
    //             </div>
    //         </div>
    //     </div>


    // 
    );
}
