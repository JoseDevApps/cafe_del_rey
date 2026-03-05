import { GDHero } from "@/components/gd/sections/GDHero";
import { GDDownloads } from "@/components/gd/sections/GDDownloads";
import { GDContacts } from "@/components/gd/sections/GDContacts";

export default function GDHomePage() {
  return (
    <>
      <GDHero />
      <GDDownloads />
      <GDContacts />
    </>
  );
}