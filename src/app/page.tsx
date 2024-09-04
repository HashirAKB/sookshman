import Image from "next/image";
import { Navbar } from "@/components/NavBar";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh]">
    <Navbar/>
    <div>Hi</div>
    </main>
  );
}
