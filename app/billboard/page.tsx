import { getWhiteboardData } from '@/actions/whiteboard-actions';
import BillboardClient from './BillboardClient';

export default async function BillboardPage() {
  const { data: whiteboardData, error: whiteboardError } = await getWhiteboardData();

  if (whiteboardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error loading billboard</h1>
          <p className="text-muted-foreground">{whiteboardError}</p>
        </div>
      </div>
    );
  }

  if (!whiteboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No data available</h1>
          <p className="text-muted-foreground">Unable to load billboard data</p>
        </div>
      </div>
    );
  }

  return <BillboardClient data={whiteboardData} />;
}