import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserWallet } from "@/components/users/UserWallet";
import { Footer } from "@/components/supabase-init/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center text-center animate-fadeIn">
        <Image
          src="/logo-tkh.png"
          alt="Tarifa Kite Hostel Logo"
          width={200}
          height={200}
          className="mb-8"
        />
        
        <UserWallet />
      </div>
      
    </main>
  );
}
