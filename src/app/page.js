import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forground font-sans text-foreground">
      <ThemeToggle />

      
    </div>
  );
}