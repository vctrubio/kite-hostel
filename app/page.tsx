import { UserWallet } from "@/components/users/UserWallet";
import { Navbar } from "@/components/supabase-init/navbar";
import { Footer } from "@/components/supabase-init/footer";
import { getTableData } from "@/actions/getters";

// Sub-component defined within the same file
async function TableDisplay({ tableName }: { tableName: string }) {
  const { data, len, error } = await getTableData(tableName);

  return (
    <div>
      <h2 className="text-xl font-semibold">Table: {tableName}</h2>
      {error && <p className="text-red-500">Error: {error}</p>}
      <p>Number of rows: {len}</p>
      <details className="mt-2">
        <summary>View Data</summary>
        <pre className="p-4 mt-2 bg-gray-100 rounded-md overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Navbar />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4 divide-y">
            <UserWallet />
            <TableDisplay tableName="testndev" />
            <div> three array dashboard passing stats as props</div>
            <div> access componetn</div>
          </main>
        </div>
        <Footer />
      </div>
    </main>
  );
}
