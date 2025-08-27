"use client";

import { useState } from "react";
import Image from "next/image";
import { updateReaction } from "./UpdateLikes";

export default function ImpButtons({ idd, likes, dislikes, comments }: { idd:number, likes: number, dislikes: number, comments: number }) {
    const [likeCount, setLikeCount] = useState(likes);
    const [dislikeCount, setDislikeCount] = useState(dislikes);

    async function handleReaction(type: "like" | "dislike") {
        // optimistic UI update
        if (type === "like") setLikeCount((c) => c + 1);
        else setDislikeCount((c) => c + 1);

        const updated = await updateReaction(idd, type);

        // in case of error, roll back
        if (!updated) {
            if (type === "like") setLikeCount((c) => c - 1);
            else setDislikeCount((c) => c - 1);
        } else {
            // sync with DB in case other changes happened
            setLikeCount(updated.likes ?? 0);
            setDislikeCount(updated.dislikes ?? 0);
        }
    }


    return (
        <div className="w-full flex flex-row justify-around items-center font-numbers h-fit mt-2 ">
            <button className=" rounded-xl p-0.5  pl-2 pr-2 text-string-primary flex flex-row justify-center items-center text-base group 
                                hover:scale-110 border border-border  hover:bg-gray-400 hover:text-background   "
                                onClick={() => handleReaction("like")}>
                <Image src={'/icons/like.png'} alt="like" width={16} height={16} className="" />
                <p className="ml-1">{likes}</p>
            </button>
            <button className=" rounded-xl p-0.5  pl-2 pr-2 text-string-primary flex flex-row justify-center items-center text-base group 
                                hover:scale-110 border border-border  hover:bg-gray-400 hover:text-background   "
                                onClick={() => handleReaction("dislike")}>
                <Image src={'/icons/dislike.png'} alt="dislike" width={16} height={16} className="" />
                <p className="ml-1">{dislikes}</p>

            </button>
            <button className=" rounded-xl p-0.5  pl-2 pr-2 text-string-primary flex flex-row justify-center items-center text-base group 
                                hover:scale-110 border border-border  hover:bg-gray-400 hover:text-background   ">
                <Image src={'/icons/comment.png'} alt="comments" width={16} height={16} className="" />
                <p className="ml-1">{comments}</p>
            </button>
            <button className=" rounded-xl p-1  pl-2 pr-2 text-string-primary flex flex-row justify-center items-center text-base group 
                                hover:scale-110 border border-border  hover:bg-gray-400 hover:text-background  ">
                <Image src={'/icons/share.png'} alt="like" width={20} height={20} className="" />
            </button>
        </div>
    );
}