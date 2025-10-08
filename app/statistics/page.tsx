import StatisticsClient from "./StatisticsClient";
import { getStatisticsData } from "@/lib/statistics-service";

export default async function StatisticsPage() {
  const { data } = await getStatisticsData();

  return (
    <div className="container mx-auto py-8 px-4">
      <StatisticsClient initialData={data} />
    </div>
  );
}
