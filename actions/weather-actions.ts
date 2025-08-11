'use server';

import { getWeatherInstance, type WeatherData, type WeatherError } from '@/backend/WeatherClass';

export interface WeatherActionResult {
  success: boolean;
  data?: WeatherData;
  error?: string;
  cached?: boolean;
}

export interface MultiWeatherActionResult {
  success: boolean;
  data?: Map<string, { data: WeatherData | null; error: WeatherError | null }>;
  error?: string;
  cacheHits?: number;
}

/**
 * Get weather for a specific date at 3 PM
 * This is the main action used by the whiteboard
 */
export async function getWeatherForDate(
  date: string,
  lat?: number,
  lon?: number,
  location?: string
): Promise<WeatherActionResult> {
  try {
    console.log(`🌤️ Weather action: fetching data for ${date}`);
    
    const weatherService = getWeatherInstance();
    const result = await weatherService.getWeatherForDate(date, lat, lon, location);
    
    if (result.error && !result.data) {
      console.error(`❌ Weather action failed for ${date}:`, result.error);
      return {
        success: false,
        error: result.error.message
      };
    }
    
    // Even if there's an error, we might have fallback data
    return {
      success: true,
      data: result.data!,
      cached: result.error === null // If no error, it was likely cached or fresh
    };
    
  } catch (error) {
    console.error('Weather action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown weather service error'
    };
  }
}

/**
 * Get weather for multiple dates efficiently
 * Used when loading weather for a week or month view
 */
export async function getWeatherForDates(
  dates: string[],
  lat?: number,
  lon?: number,
  location?: string
): Promise<MultiWeatherActionResult> {
  try {
    console.log(`🌤️ Weather action: fetching data for ${dates.length} dates`);
    
    const weatherService = getWeatherInstance();
    const results = await weatherService.getWeatherForDates(dates, lat, lon, location);
    
    // Count cache hits for monitoring
    let cacheHits = 0;
    for (const [, result] of results) {
      if (result.data && !result.error) {
        cacheHits++;
      }
    }
    
    return {
      success: true,
      data: results,
      cacheHits
    };
    
  } catch (error) {
    console.error('Multi-date weather action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown weather service error'
    };
  }
}

/**
 * Get weather for the upcoming week (7 days from today)
 * Convenience action for whiteboard weekly view
 */
export async function getWeeklyWeather(
  lat?: number,
  lon?: number,
  location?: string
): Promise<MultiWeatherActionResult> {
  try {
    const today = new Date();
    const dates: string[] = [];
    
    // Generate next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    console.log(`🗓️ Weather action: fetching weekly weather for dates: ${dates.join(', ')}`);
    
    return await getWeatherForDates(dates, lat, lon, location);
    
  } catch (error) {
    console.error('Weekly weather action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate weekly weather'
    };
  }
}

/**
 * Clear weather cache for a specific date or all cache
 * Admin action for cache management
 */
export async function clearWeatherCache(date?: string): Promise<{ success: boolean; message: string }> {
  try {
    const weatherService = getWeatherInstance();
    weatherService.clearCache(date);
    
    const message = date 
      ? `Weather cache cleared for ${date}`
      : 'All weather cache cleared';
      
    console.log(`🗑️ ${message}`);
    
    return {
      success: true,
      message
    };
    
  } catch (error) {
    const errorMessage = 'Failed to clear weather cache';
    console.error(errorMessage, error);
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Get weather cache statistics
 * Admin action for monitoring cache performance
 */
export async function getWeatherCacheStats(): Promise<{
  success: boolean;
  stats?: {
    size: number;
    maxSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    hitRate: number;
    configured: boolean;
  };
  error?: string;
}> {
  try {
    const weatherService = getWeatherInstance();
    const stats = weatherService.getCacheStats();
    
    return {
      success: true,
      stats: {
        ...stats,
        configured: weatherService.isConfigured()
      }
    };
    
  } catch (error) {
    console.error('Weather cache stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cache stats'
    };
  }
}

/**
 * Update weather API key at runtime
 * Admin action for configuration management
 */
export async function updateWeatherApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const weatherService = getWeatherInstance();
    weatherService.setApiKey(apiKey);
    
    return {
      success: true,
      message: 'Weather API key updated successfully'
    };
    
  } catch (error) {
    console.error('Weather API key update error:', error);
    return {
      success: false,
      message: 'Failed to update weather API key'
    };
  }
}

/**
 * Health check for weather service
 * Returns service status and basic configuration info
 */
export async function getWeatherServiceHealth(): Promise<{
  success: boolean;
  configured: boolean;
  message: string;
  cacheSize?: number;
}> {
  try {
    const weatherService = getWeatherInstance();
    const isConfigured = weatherService.isConfigured();
    const stats = weatherService.getCacheStats();
    
    return {
      success: true,
      configured: isConfigured,
      message: isConfigured 
        ? 'Weather service is properly configured and running'
        : 'Weather service is running but API key is not configured',
      cacheSize: stats.size
    };
    
  } catch (error) {
    console.error('Weather service health check error:', error);
    return {
      success: false,
      configured: false,
      message: 'Weather service health check failed'
    };
  }
}

/**
 * Get weather for today (convenience action)
 */
export async function getTodayWeather(
  lat?: number,
  lon?: number,
  location?: string
): Promise<WeatherActionResult> {
  const today = new Date().toISOString().split('T')[0];
  return await getWeatherForDate(today, lat, lon, location);
}

/**
 * Get weather for tomorrow (convenience action)
 */
export async function getTomorrowWeather(
  lat?: number,
  lon?: number,
  location?: string
): Promise<WeatherActionResult> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  return await getWeatherForDate(tomorrowDate, lat, lon, location);
}
