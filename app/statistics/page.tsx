import StatisticsClient from "./StatisticsClient";

async function getStatistics() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/statistics`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch statistics");
  }

  const data = await response.json();
  return data;
}

export default async function StatisticsPage() {
  const { data } = await getStatistics();

  return (
    <div className="container mx-auto py-8 px-4">
      <StatisticsClient initialData={data} />
    </div>
  );
}
