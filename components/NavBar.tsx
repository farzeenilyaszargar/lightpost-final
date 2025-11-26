'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


export interface NavItem
{
    name:string;
    link:string;
    icons:string;
    inactiveIcons:string;

};

export const navList:NavItem[] = 
[
    {name:'Latest', link:'/', icons:'/icons/recents.svg', inactiveIcons:'/icons/inactive-recents.svg'},
    {name:'Politics', link:'/news/politics', icons:'/icons/politics.svg', inactiveIcons:'/icons/inactive-politics.svg'},
    {name:'Markets', link:'/news/business', icons:'/icons/money.png', inactiveIcons:'/icons/inactive-money.png'},
    //{name:'Tech', link:'/tech', icons:'/icons/tech.svg', inactiveIcons:'/icons/inactive-tech.svg'},
    {name:'Science', link:'/news/science', icons:'/icons/science.svg', inactiveIcons:'/icons/inactive-science.svg'},
    {name:'Sports', link:'/news/sports', icons:'/icons/sports.svg', inactiveIcons:'/icons/inactive-sports.svg'},
    {name:'Culture', link:'/news/entertainment', icons:'/icons/culture.png', inactiveIcons:'/icons/inactive-culture.png'},
    {name:'Fun', link:'/fun', icons:'/icons/games.svg', inactiveIcons:'/icons/inactive-games.svg'},

]




function isRouteActive(href: string, path: string) {
  const norm = (s: string) => {
    const t = "/" + s.replace(/^\/+/, "");
    return t.length > 1 ? t.replace(/\/+$/, "") : "/";
  };

  const base = norm(href);
  const curr = norm(path);

  if (base === "/") return curr === "/";                            
  return curr === base || curr.startsWith(base + "/");              
}


export default function NavbarComp()
{
    const path = usePathname();
    return(
        <div className="w-screen  border-border border-b  justify-center hidden md:flex sticky top-0 bg-background z-100 ">
            <div className="w-5/6  flex justify-center items-center h-8 gap-5 border-l border-r border-border">
        {
            navList.map((item:NavItem) => {
                const isActive = isRouteActive(item.link, path);
                return (
                    <Link key={item.name} href={item.link} className={`flex font-bold font-menu items-center ${isActive?'':''}`}>
                        <Image src={`${isActive?`${item.icons}`:`${item.inactiveIcons}`}`} className="invert-[var(--reverse-invert)] mr-1" alt="icon" width={25} height={25}/>
                        <p className={` ${isActive?`text-string-primary font-black `:`text-string-secondary`}`}>{item.name}</p>
                    </Link>
                )}
            )
        }
        </div>
            
        </div>
    );
}