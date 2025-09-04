import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import LatestNews from "./news/latest/latestTry";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import AnotherTry from "./news/latest/another";
import Stocks from "@/components/Stocks";



export default function Home() {
  return (
    <div className="">
        <Header/>
        <NavbarComp/>
        <Hero/>
        <AnotherTry/>
        <Footer/>

        

    </div>
  );
}
