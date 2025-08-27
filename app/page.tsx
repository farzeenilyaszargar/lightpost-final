import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";
import LatestNews from "./news/latest/latestTry";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";



export default function Home() {
  return (
    <div className="flex flex-col items-center">
        <Header/>
        <NavbarComp/>
        <Hero/>
        <LatestNews/>
        <Footer/>

        

    </div>
  );
}
