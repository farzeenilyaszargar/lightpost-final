import Link from "next/link";


export default function NotFound()
{
    return(
        <div className="h-screen w-screen flex flex-col justify-center items-center bg-background text-string-primary">
            <p className="font-black text-7xl">404</p>
            <p className="font-extralight  text-xl">Page Not Found 😬</p>
            <Link href={'/'} className="m-5 border rounded-2xl p-2 pl-4 pr-4 ">Go Back</Link>
        </div>
    );
}