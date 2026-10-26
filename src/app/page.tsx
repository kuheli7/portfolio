import { About } from "@/components/About";
import { ActiveCards } from "@/components/ActiveCards";
import { Contact } from "@/components/Contact";
import { DesignGallery } from "@/components/DesignGallery";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Hero } from "@/components/Hero";
import { JustForFun } from "@/components/JustForFun";
import { MoreProjects } from "@/components/MoreProjects";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <MoreProjects />
      <DesignGallery />
      <JustForFun />
      <About />
      <Contact />
      <ActiveCards />
    </>
  );
}
