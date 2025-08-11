import { NextRequest, NextResponse } from 'next/server';
import { getWeatherInstance } from '@/backend/WeatherClass';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; maxAge: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.maxAge) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCachedResponse(key: string, data: any, maxAge: number = CACHE_DURATION) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    maxAge
  });
}

/**
 * Weather API Route
 * 
 * This route provides weather data for the whiteboard.
 * It uses the WeatherClass with caching to minimize API calls.
 * 
 * Usage:
 * GET /api/weather?date=2024-08-15&lat=40.7128&lon=-74.0060&location=New York
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const location = searchParams.get('location');
    const hourly = searchParams.get('hourly');
    
    // Generate cache key
    const cacheKey = `weather-${date}-${lat}-${lon}-${location}-${hourly}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log(`🌤️ API cache hit for ${cacheKey}`);
      return NextResponse.json({
        ...cachedResponse,
        cached: true,
        cacheHit: true
      });
    }

    // Validate required parameters
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Parse coordinates if provided
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lon ? parseFloat(lon) : undefined;

    // Validate coordinates if provided
    if (lat && (isNaN(latitude!) || latitude! < -90 || latitude! > 90)) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (lon && (isNaN(longitude!) || longitude! < -180 || longitude! > 180)) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180' },
        { status: 400 }
      );
    }

    console.log(`🌐 Weather API: Request for ${date} at ${location || 'default location'}`);

    // Get weather data using the WeatherClass
    const weatherService = getWeatherInstance();
    const result = await weatherService.getWeatherForDate(
      date,
      latitude,
      longitude,
      location || undefined
    );

    if (result.error && !result.data) {
      console.error(`❌ Weather API: Failed to fetch data for ${date}:`, result.error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch weather data',
          details: result.error.message,
          code: result.error.code
        },
        { status: 500 }
      );
    }

    // Cache and return weather data
    const response = {
      success: true,
      data: result.data,
      cached: result.error === null,
      timestamp: new Date().toISOString(),
      ...(result.error && { 
        warning: 'Using fallback data due to API error',
        error: result.error 
      })
    };
    
    // Cache successful responses
    if (result.data) {
      setCachedResponse(cacheKey, response);
      console.log(`💾 API response cached for ${cacheKey}`);
    }
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Weather API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Weather cache management endpoints
 * 
 * POST /api/weather - Clear cache
 * DELETE /api/weather - Clear all cache
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, date } = body;

    if (action === 'clear-cache') {
      const weatherService = getWeatherInstance();
      weatherService.clearCache(date);
      
      return NextResponse.json({
        success: true,
        message: date 
          ? `Cache cleared for ${date}`
          : 'All cache cleared'
      });
    }

    if (action === 'get-stats') {
      const weatherService = getWeatherInstance();
      const stats = weatherService.getCacheStats();
      
      return NextResponse.json({
        success: true,
        stats: {
          ...stats,
          configured: weatherService.isConfigured()
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: clear-cache, get-stats' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Weather API POST error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const weatherService = getWeatherInstance();
    weatherService.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'All weather cache cleared'
    });

  } catch (error) {
    console.error('Weather API DELETE error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
