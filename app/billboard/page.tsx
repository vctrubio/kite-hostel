import { getBillboardData } from '@/actions/billboard-actions';
import BillboardClient from './BillboardClient';

export default async function BillboardPage() {
  const { data: billboardData, error: billboardError } = await getBillboardData();

  if (billboardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error loading billboard</h1>
          <p className="text-muted-foreground">{billboardError}</p>
        </div>
      </div>
    );
  }

  if (!billboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No data available</h1>
          <p className="text-muted-foreground">Unable to load billboard data</p>
        </div>
      </div>
    );
  }

  return <BillboardClient data={billboardData} />;
}