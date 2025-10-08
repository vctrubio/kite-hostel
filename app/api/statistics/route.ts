import { NextRequest, NextResponse } from 'next/server';
import { getStatisticsData } from '@/lib/statistics-service';

export type { TransactionData } from '@/lib/statistics-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const result = await getStatisticsData(startDate, endDate);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Error fetching statistics data' },
      { status: 500 }
    );
  }
}
