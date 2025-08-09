import { getWhiteboardData } from '@/actions/whiteboard-actions';
import WhiteboardClient from './WhiteboardClient';

export default async function WhiteboardPage() {
  const { data: whiteboardData, error: whiteboardError } = await getWhiteboardData();

  if (whiteboardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error loading whiteboard</h1>
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
          <p className="text-muted-foreground">Unable to load whiteboard data</p>
        </div>
      </div>
    );
  }

  return <WhiteboardClient data={whiteboardData} />;
}