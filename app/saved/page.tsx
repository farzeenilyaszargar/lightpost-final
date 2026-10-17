import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SavedStories from "@/components/SavedStories";
export const metadata = { title: "Bookmarks" };
export default function Saved() {
  return (
    <>
      <Header />
      <NavBar />
      <SavedStories />
      <Footer />
    </>
  );
}
