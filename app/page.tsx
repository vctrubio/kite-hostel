import { UserWallet } from "@/components/users/UserWallet";
import { Navbar } from "@/components/supabase-init/navbar";
import { Footer } from "@/components/supabase-init/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4 divide-y">
            <UserWallet />
            <div> three array dashboard passing stats as props</div>
            <div> access componetn</div>
          </main>
        </div>
        <Footer />
      </div>
    </main>
  );
}
