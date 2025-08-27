import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NavbarComp from "@/components/NavBar";

type Props = {
  params: { sections: string };
};

export default function BlogPost({ params }: Props) {
  return (
    <div className="flex flex-col items-center">
        <Header/>
        <NavbarComp/>
        <div className="w-5/6 border-border border-l border-r h-screen">
      <h1>Sections Name: {params.sections}</h1>

        </div>
        <Footer/>
    </div>
  );
}