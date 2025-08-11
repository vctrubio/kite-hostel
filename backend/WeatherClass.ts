/**
 * WeatherClass - Weather Service for Kite Hostel Whiteboard
 * 
 * This class manages weather data fetching and caching for the whiteboard.
 * It provides consistent 3PM weather forecasts with intelligent caching
 * to avoid redundant API calls and improve performance.
 * 
 * Key Features:
 * - In-memory date-based caching
 * - Always returns 3PM forecast (configurable)
 * - Handles API rate limiting gracefully
 * - Provides fallback data on errors
 * - Automatic cache cleanup for old dates
 */

export interface WeatherData {
  date: string;
  time: string;
  temperature: number;
  feelsLike: number;
  humidity?: number; // Optional now
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  description: string;
  icon: string;
  cloudCover: number;
  visibility?: number; // Optional now
  pressure: number;
  uvIndex?: number; // Optional now
  precipitation: number;
  precipitationProbability: number;
  lastUpdated: Date;
}

export interface HourlyWeatherData {
  date: string;
  hourlyForecasts: Array<{
    hour: number;
    time: string;
    windSpeed: number;
    windDirection: number;
    windGust?: number;
    temperature: number;
    precipitation: number;
    precipitationProbability: number;
  }>;
  lastUpdated: Date;
}

export interface WeatherError {
  code: string;
  message: string;
  timestamp: Date;
}

interface CacheEntry {
  data: WeatherData;
  fetchedAt: Date;
  expiresAt: Date;
}

export class WeatherClass {
  private cache: Map<string, CacheEntry> = new Map();
  private apiKey: string | null = null;
  private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private readonly FORECAST_HOUR = 15; // 3 PM (15:00)
  private readonly API_TIMEOUT_MS = 10000; // 10 seconds
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached entries
  
  // Default coordinates for Tarifa, Spain
  private readonly DEFAULT_LAT = 36.0128;
  private readonly DEFAULT_LON = -5.6081;
  private readonly DEFAULT_LOCATION = "Tarifa, Spain";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY || null;
    
    // Clean up old cache entries every hour
    this.setupCacheCleanup();
  }

  /**
   * Get hourly weather forecast for a specific date (9am-9pm)
   * Uses cache-first strategy to minimize API calls
   */
  async getHourlyWeatherForDate(
    date: string,
    lat?: number,
    lon?: number,
    location?: string
  ): Promise<{ data: HourlyWeatherData | null; error: WeatherError | null }> {
    const cacheKey = this.generateCacheKey(date, lat, lon) + '-hourly';
    
    // Check cache first
    const cachedData = this.getCachedHourlyWeather(cacheKey);
    if (cachedData) {
      console.log(`🌤️ Hourly weather cache hit for ${date} at ${location || this.DEFAULT_LOCATION}`);
      return { data: cachedData, error: null };
    }

    // Cache miss - fetch from API
    console.log(`🌐 Fetching hourly weather data for ${date} at ${location || this.DEFAULT_LOCATION}`);
    
    try {
      const weatherData = await this.fetchHourlyWeatherFromAPI(date, lat, lon, location);
      
      // Cache the result
      this.cacheHourlyWeatherData(cacheKey, weatherData);
      
      return { data: weatherData, error: null };
    } catch (error) {
      const weatherError: WeatherError = {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };

      console.error(`❌ Hourly weather fetch failed for ${date}:`, weatherError);
      
      // Return fallback data if available
      const fallbackData = this.getFallbackHourlyWeather(date, location);
      return { 
        data: fallbackData, 
        error: weatherError 
      };
    }
  }

  /**
   * Get weather forecast for a specific date at 3 PM
   * Uses cache-first strategy to minimize API calls
   */
  async getWeatherForDate(
    date: string,
    lat?: number,
    lon?: number,
    location?: string
  ): Promise<{ data: WeatherData | null; error: WeatherError | null }> {
    const cacheKey = this.generateCacheKey(date, lat, lon);
    
    // Check cache first
    const cachedData = this.getCachedWeather(cacheKey);
    if (cachedData) {
      console.log(`🌤️ Weather cache hit for ${date} at ${location || this.DEFAULT_LOCATION}`);
      return { data: cachedData, error: null };
    }

    // Cache miss - fetch from API
    console.log(`🌐 Fetching weather data for ${date} at ${location || this.DEFAULT_LOCATION}`);
    
    try {
      const weatherData = await this.fetchWeatherFromAPI(date, lat, lon, location);
      
      // Cache the result
      this.cacheWeatherData(cacheKey, weatherData);
      
      return { data: weatherData, error: null };
    } catch (error) {
      const weatherError: WeatherError = {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };

      console.error(`❌ Weather fetch failed for ${date}:`, weatherError);
      
      // Return fallback data if available
      const fallbackData = this.getFallbackWeather(date, location);
      return { 
        data: fallbackData, 
        error: weatherError 
      };
    }
  }

  /**
   * Get weather for multiple dates efficiently
   * Batches requests to avoid overwhelming the API
   */
  async getWeatherForDates(
    dates: string[],
    lat?: number,
    lon?: number,
    location?: string
  ): Promise<Map<string, { data: WeatherData | null; error: WeatherError | null }>> {
    const results = new Map<string, { data: WeatherData | null; error: WeatherError | null }>();
    
    // Process dates in small batches to respect API limits
    const batchSize = 3;
    
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (date) => {
        const result = await this.getWeatherForDate(date, lat, lon, location);
        return { date, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const { date, result } of batchResults) {
        results.set(date, result);
      }
      
      // Small delay between batches to be API-friendly
      if (i + batchSize < dates.length) {
        await this.delay(500);
      }
    }
    
    return results;
  }

  /**
   * Clear cache for specific date or all cached data
   */
  clearCache(date?: string): void {
    if (date) {
      // Clear specific date
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(date));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`🗑️ Cleared weather cache for ${date}`);
    } else {
      // Clear all cache
      this.cache.clear();
      console.log('🗑️ Cleared all weather cache');
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    hitRate: number;
  } {
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      oldestEntry: entries.length > 0 
        ? new Date(Math.min(...entries.map(e => e.fetchedAt.getTime())))
        : null,
      newestEntry: entries.length > 0
        ? new Date(Math.max(...entries.map(e => e.fetchedAt.getTime())))
        : null,
      hitRate: 0 // This would need separate tracking to implement properly
    };
  }

  /**
   * Update API key at runtime
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('🔑 Weather API key updated');
  }

  /**
   * Check if weather service is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  // ================================
  // PRIVATE METHODS
  // ================================

  private async fetchWeatherFromAPI(
    date: string,
    lat?: number,
    lon?: number,
    location?: string
  ): Promise<WeatherData> {
    if (!this.apiKey) {
      console.warn('⚠️ Weather API key not configured, using mock data');
      const latitude = lat ?? this.DEFAULT_LAT;
      const longitude = lon ?? this.DEFAULT_LON;
      const locationName = location ?? this.DEFAULT_LOCATION;
      return await this.mockWeatherAPICall(date, latitude, longitude, locationName);
    }

    const latitude = lat ?? this.DEFAULT_LAT;
    const longitude = lon ?? this.DEFAULT_LON;
    const locationName = location ?? this.DEFAULT_LOCATION;

    try {
      // Use real OpenWeatherMap API
      const weatherData = await this.fetchFromOpenWeatherAPI(date, latitude, longitude, locationName);
      return weatherData;
    } catch (error) {
      console.error('🌐 OpenWeatherMap API failed, falling back to mock data:', error);
      // Fallback to mock data if real API fails
      return await this.mockWeatherAPICall(date, latitude, longitude, locationName);
    }
  }

  private async mockWeatherAPICall(
    date: string,
    lat: number,
    lon: number,
    location: string
  ): Promise<WeatherData> {
    // Simulate API delay
    await this.delay(Math.random() * 1000 + 500);

    // Generate realistic-looking weather data
    const baseTemp = 20 + Math.sin(new Date(date).getTime() / (1000 * 60 * 60 * 24 * 365) * 2 * Math.PI) * 15;
    const variation = (Math.random() - 0.5) * 10;
    const temperature = Math.round(baseTemp + variation);
    
    const conditions = [
      { description: 'Clear sky', icon: '01d', cloudCover: 0 },
      { description: 'Few clouds', icon: '02d', cloudCover: 25 },
      { description: 'Scattered clouds', icon: '03d', cloudCover: 50 },
      { description: 'Broken clouds', icon: '04d', cloudCover: 75 },
      { description: 'Overcast', icon: '04d', cloudCover: 100 },
      { description: 'Light rain', icon: '10d', cloudCover: 80 },
    ];

    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      date,
      time: `${this.FORECAST_HOUR.toString().padStart(2, '0')}:00`,
      temperature,
      feelsLike: temperature + Math.round((Math.random() - 0.5) * 4),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(Math.random() * 20),
      windDirection: Math.round(Math.random() * 360),
      windGust: Math.round(Math.random() * 30),
      description: condition.description,
      icon: condition.icon,
      cloudCover: condition.cloudCover,
      visibility: Math.round(5 + Math.random() * 15),
      pressure: Math.round(990 + Math.random() * 40),
      uvIndex: Math.max(0, Math.round(Math.random() * 10)),
      precipitation: condition.description.includes('rain') ? Math.random() * 5 : 0,
      precipitationProbability: condition.description.includes('rain') 
        ? Math.round(60 + Math.random() * 40) 
        : Math.round(Math.random() * 30),
      lastUpdated: new Date()
    };
  }

  private getCachedWeather(cacheKey: string): WeatherData | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache entry has expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      console.log(`🕒 Weather cache expired for ${cacheKey}`);
      return null;
    }
    
    return entry.data;
  }

  private cacheWeatherData(cacheKey: string, data: WeatherData): void {
    const now = new Date();
    const entry: CacheEntry = {
      data,
      fetchedAt: now,
      expiresAt: new Date(now.getTime() + this.CACHE_DURATION_MS)
    };

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntry();
    }

    this.cache.set(cacheKey, entry);
    console.log(`💾 Cached weather data for ${cacheKey} (expires: ${entry.expiresAt.toLocaleTimeString()})`);
  }

  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.fetchedAt.getTime() < oldestTime) {
        oldestTime = entry.fetchedAt.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  private generateCacheKey(date: string, lat?: number, lon?: number): string {
    const latitude = lat ?? this.DEFAULT_LAT;
    const longitude = lon ?? this.DEFAULT_LON;
    return `${date}-${latitude.toFixed(2)}-${longitude.toFixed(2)}-${this.FORECAST_HOUR}h`;
  }

  private getFallbackWeather(date: string, location?: string): WeatherData {
    const locationName = location ?? this.DEFAULT_LOCATION;
    
    console.log(`🔄 Using fallback weather data for ${date} at ${locationName}`);
    
    return {
      date,
      time: `${this.FORECAST_HOUR.toString().padStart(2, '0')}:00`,
      temperature: 22,
      feelsLike: 24,
      humidity: 65,
      windSpeed: 8,
      windDirection: 180,
      windGust: 12,
      description: 'Weather data unavailable',
      icon: '01d',
      cloudCover: 50,
      visibility: 10,
      pressure: 1013,
      uvIndex: 5,
      precipitation: 0,
      precipitationProbability: 0,
      lastUpdated: new Date()
    };
  }

  private setupCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.CACHE_DURATION_MS);
  }

  private cleanupExpiredEntries(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired weather cache entries`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Cache hourly weather data
   */
  private getCachedHourlyWeather(cacheKey: string): HourlyWeatherData | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache entry has expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      console.log(`🕒 Hourly weather cache expired for ${cacheKey}`);
      return null;
    }
    
    return entry.data as HourlyWeatherData;
  }
  
  private cacheHourlyWeatherData(cacheKey: string, data: HourlyWeatherData): void {
    const now = new Date();
    const entry = {
      data,
      fetchedAt: now,
      expiresAt: new Date(now.getTime() + this.CACHE_DURATION_MS)
    };

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntry();
    }

    this.cache.set(cacheKey, entry as any);
    console.log(`💾 Cached hourly weather data for ${cacheKey} (expires: ${entry.expiresAt.toLocaleTimeString()})`);
  }
  
  /**
   * Fetch hourly weather from API
   */
  private async fetchHourlyWeatherFromAPI(
    date: string,
    lat?: number,
    lon?: number,
    location?: string
  ): Promise<HourlyWeatherData> {
    if (!this.apiKey) {
      console.warn('⚠️ Weather API key not configured, using mock data');
      const latitude = lat ?? this.DEFAULT_LAT;
      const longitude = lon ?? this.DEFAULT_LON;
      const locationName = location ?? this.DEFAULT_LOCATION;
      return await this.mockHourlyWeatherAPICall(date, latitude, longitude, locationName);
    }

    const latitude = lat ?? this.DEFAULT_LAT;
    const longitude = lon ?? this.DEFAULT_LON;
    const locationName = location ?? this.DEFAULT_LOCATION;

    try {
      // Use real OpenWeatherMap API
      const weatherData = await this.fetchHourlyFromOpenWeatherAPI(date, latitude, longitude, locationName);
      return weatherData;
    } catch (error) {
      console.error('🌐 OpenWeatherMap API failed, falling back to mock data:', error);
      // Fallback to mock data if real API fails
      return await this.mockHourlyWeatherAPICall(date, latitude, longitude, locationName);
    }
  }
  
  /**
   * Mock hourly weather API call
   */
  private async mockHourlyWeatherAPICall(
    date: string,
    lat: number,
    lon: number,
    location: string
  ): Promise<HourlyWeatherData> {
    // Simulate API delay
    await this.delay(Math.random() * 1000 + 500);

    const hourlyForecasts = [];
    const baseDate = new Date(date);
    
    // Generate hourly forecasts from 9 AM to 9 PM (13 hours)
    for (let hour = 9; hour <= 21; hour++) {
      const windSpeed = Math.round(8 + Math.random() * 25 + Math.sin(hour / 24 * Math.PI * 2) * 8);
      const windDirection = Math.round(Math.random() * 360);
      const temperature = Math.round(18 + Math.sin((hour - 6) / 12 * Math.PI) * 8 + (Math.random() - 0.5) * 4);
      
      hourlyForecasts.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        windSpeed,
        windDirection,
        windGust: windSpeed > 15 ? Math.round(windSpeed * 1.3) : undefined,
        temperature,
        precipitation: Math.random() < 0.2 ? Math.random() * 2 : 0,
        precipitationProbability: Math.round(Math.random() * 30)
      });
    }

    return {
      date,
      hourlyForecasts,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Fetch hourly forecast from OpenWeatherMap
   */
  private async fetchHourlyFromOpenWeatherAPI(
    date: string,
    lat: number,
    lon: number,
    location: string
  ): Promise<HourlyWeatherData> {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // For dates beyond 5 days, use mock data
    if (diffDays > 5) {
      console.warn(`⚠️ Date ${date} is beyond 5-day forecast limit, using mock data`);
      return await this.mockHourlyWeatherAPICall(date, lat, lon, location);
    }
    
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    
    console.log(`🌐 Fetching hourly forecast from OpenWeatherMap for ${location} on ${date}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT_MS);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Kite-Hostel-Weather/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.parseHourlyForecastResponse(data, date);
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  /**
   * Parse hourly forecast API response
   */
  private parseHourlyForecastResponse(data: any, targetDate: string): HourlyWeatherData {
    const forecasts = data.list || [];
    if (forecasts.length === 0) {
      throw new Error('No forecast data available');
    }
    
    const hourlyForecasts = [];
    const targetDateTime = new Date(targetDate);
    
    // Filter forecasts for target date between 9 AM and 9 PM
    for (const forecast of forecasts) {
      const forecastDateTime = new Date(forecast.dt * 1000);
      
      // Check if forecast is on target date
      if (forecastDateTime.toDateString() === targetDateTime.toDateString()) {
        const hour = forecastDateTime.getHours();
        
        // Only include hours from 9 AM to 9 PM
        if (hour >= 9 && hour <= 21) {
          const wind = forecast.wind || {};
          const rain = forecast.rain || {};
          const snow = forecast.snow || {};
          
          hourlyForecasts.push({
            hour,
            time: `${hour.toString().padStart(2, '0')}:00`,
            windSpeed: Math.round((wind.speed || 0) * 3.6), // Convert m/s to km/h
            windDirection: Math.round(wind.deg || 0),
            windGust: wind.gust ? Math.round(wind.gust * 3.6) : undefined,
            temperature: Math.round(forecast.main?.temp || 20),
            precipitation: Math.round(((rain['3h'] || 0) + (snow['3h'] || 0)) * 10) / 10,
            precipitationProbability: Math.round((forecast.pop || 0) * 100)
          });
        }
      }
    }
    
    // If no hourly data found, use mock data
    if (hourlyForecasts.length === 0) {
      console.warn(`⚠️ No hourly forecast found for ${targetDate}, using mock data`);
      return this.mockHourlyWeatherAPICall(targetDate, this.DEFAULT_LAT, this.DEFAULT_LON, this.DEFAULT_LOCATION);
    }
    
    return {
      date: targetDate,
      hourlyForecasts: hourlyForecasts.sort((a, b) => a.hour - b.hour),
      lastUpdated: new Date()
    };
  }
  
  /**
   * Get fallback hourly weather data
   */
  private getFallbackHourlyWeather(date: string, location?: string): HourlyWeatherData {
    const locationName = location ?? this.DEFAULT_LOCATION;
    console.log(`🔄 Using fallback hourly weather data for ${date} at ${locationName}`);
    return this.mockHourlyWeatherAPICall(date, this.DEFAULT_LAT, this.DEFAULT_LON, locationName);
  }

  /**
   * Fetch weather data from OpenWeatherMap API
   */
  private async fetchFromOpenWeatherAPI(
    date: string,
    lat: number,
    lon: number,
    location: string
  ): Promise<WeatherData> {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // For current weather or past dates, use current weather API
    if (diffDays <= 0) {
      return await this.fetchCurrentWeather(lat, lon, location, date);
    }
    
    // For future dates (up to 5 days), use 5-day forecast API
    if (diffDays <= 5) {
      return await this.fetchForecastWeather(lat, lon, location, date);
    }
    
    // For dates beyond 5 days, use mock data
    console.warn(`⚠️ Date ${date} is beyond 5-day forecast limit, using mock data`);
    return await this.mockWeatherAPICall(date, lat, lon, location);
  }

  /**
   * Fetch current weather from OpenWeatherMap
   */
  private async fetchCurrentWeather(
    lat: number,
    lon: number,
    location: string,
    date: string
  ): Promise<WeatherData> {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    
    console.log(`🌐 Fetching current weather from OpenWeatherMap for ${location}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT_MS);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Kite-Hostel-Weather/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.parseCurrentWeatherResponse(data, date);
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fetch forecast weather from OpenWeatherMap
   */
  private async fetchForecastWeather(
    lat: number,
    lon: number,
    location: string,
    date: string
  ): Promise<WeatherData> {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    
    console.log(`🌐 Fetching forecast weather from OpenWeatherMap for ${location} on ${date}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT_MS);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Kite-Hostel-Weather/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.parseForecastWeatherResponse(data, date);
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse current weather API response
   */
  private parseCurrentWeatherResponse(data: any, date: string): WeatherData {
    const main = data.main || {};
    const weather = data.weather?.[0] || {};
    const wind = data.wind || {};
    const clouds = data.clouds || {};
    const sys = data.sys || {};
    
    return {
      date,
      time: `${this.FORECAST_HOUR.toString().padStart(2, '0')}:00`,
      temperature: Math.round(main.temp || 20),
      feelsLike: Math.round(main.feels_like || main.temp || 20),
      humidity: Math.round(main.humidity || 60),
      windSpeed: Math.round((wind.speed || 0) * 3.6), // Convert m/s to km/h
      windDirection: Math.round(wind.deg || 0),
      windGust: wind.gust ? Math.round(wind.gust * 3.6) : undefined,
      description: weather.description || 'Clear conditions',
      icon: weather.icon || '01d',
      cloudCover: clouds.all || 0,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert m to km
      pressure: Math.round(main.pressure || 1013),
      uvIndex: 5, // Current weather API doesn't provide UV, use default
      precipitation: 0, // Current weather API doesn't provide forecast precipitation
      precipitationProbability: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Parse forecast weather API response and find closest to 3 PM
   */
  private parseForecastWeatherResponse(data: any, targetDate: string): WeatherData {
    const forecasts = data.list || [];
    if (forecasts.length === 0) {
      throw new Error('No forecast data available');
    }
    
    // Find forecast closest to 3 PM on target date
    const targetDateTime = new Date(targetDate);
    targetDateTime.setHours(this.FORECAST_HOUR, 0, 0, 0);
    
    let closestForecast = null;
    let closestTimeDiff = Infinity;
    
    for (const forecast of forecasts) {
      const forecastDateTime = new Date(forecast.dt * 1000);
      const timeDiff = Math.abs(forecastDateTime.getTime() - targetDateTime.getTime());
      
      // Only consider forecasts on the target date
      if (forecastDateTime.toDateString() === targetDateTime.toDateString() && timeDiff < closestTimeDiff) {
        closestTimeDiff = timeDiff;
        closestForecast = forecast;
      }
    }
    
    // If no forecast found for exact date, use the first available forecast
    if (!closestForecast) {
      closestForecast = forecasts[0];
      console.warn(`⚠️ No forecast found for exact date ${targetDate}, using closest available`);
    }
    
    const main = closestForecast.main || {};
    const weather = closestForecast.weather?.[0] || {};
    const wind = closestForecast.wind || {};
    const clouds = closestForecast.clouds || {};
    const rain = closestForecast.rain || {};
    const snow = closestForecast.snow || {};
    
    // Calculate precipitation
    const precipitation = (rain['3h'] || 0) + (snow['3h'] || 0);
    const precipitationProbability = Math.round((closestForecast.pop || 0) * 100);
    
    return {
      date: targetDate,
      time: `${this.FORECAST_HOUR.toString().padStart(2, '0')}:00`,
      temperature: Math.round(main.temp || 20),
      feelsLike: Math.round(main.feels_like || main.temp || 20),
      humidity: Math.round(main.humidity || 60),
      windSpeed: Math.round((wind.speed || 0) * 3.6), // Convert m/s to km/h
      windDirection: Math.round(wind.deg || 0),
      windGust: wind.gust ? Math.round(wind.gust * 3.6) : undefined,
      description: weather.description || 'Clear conditions',
      icon: weather.icon || '01d',
      cloudCover: clouds.all || 0,
      visibility: closestForecast.visibility ? Math.round(closestForecast.visibility / 1000) : 10,
      pressure: Math.round(main.pressure || 1013),
      uvIndex: 5, // Forecast API doesn't provide UV, use estimated value
      precipitation: Math.round(precipitation * 10) / 10,
      precipitationProbability,
      lastUpdated: new Date()
    };
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Format temperature with appropriate unit
 */
export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${Math.round(temp * 9/5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

/**
 * Convert km/h to knots
 */
export function kmhToKnots(kmh: number): number {
  return Math.round(kmh * 0.539957 * 10) / 10;
}

/**
 * Get Tarifa-specific wind direction name
 */
export function getTarifaWindDirection(degrees: number): string {
  // Normalize degrees to 0-360 range
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  
  if (normalizedDegrees >= 0 && normalizedDegrees <= 100) {
    return 'Levante';
  } else if (normalizedDegrees > 100 && normalizedDegrees <= 150) {
    return 'Norte';
  } else if (normalizedDegrees > 150 && normalizedDegrees <= 360) {
    return 'Poniente';
  }
  
  return 'Variable';
}

/**
 * Format wind for Windguru-style display
 */
export function formatWindKnots(speedKmh: number, direction: number): string {
  const knots = kmhToKnots(speedKmh);
  const tarifaDirection = getTarifaWindDirection(direction);
  return `${knots} kts ${tarifaDirection}`;
}

/**
 * Format wind speed with direction
 */
export function formatWind(speed: number, direction: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dirIndex = Math.round(direction / 45) % 8;
  return `${speed} km/h ${directions[dirIndex]}`;
}

/**
 * Get wind speed color for Windguru-style visualization
 */
export function getWindSpeedColor(speedKnots: number): string {
  if (speedKnots < 20) {
    return '#3B82F6'; // Blue - light wind
  } else if (speedKnots >= 20 && speedKnots < 25) {
    return '#10B981'; // Green - good wind
  } else if (speedKnots >= 25 && speedKnots < 30) {
    return '#F59E0B'; // Orange - strong wind
  } else if (speedKnots >= 30 && speedKnots < 35) {
    return '#DC2626'; // Red - very strong wind
  } else {
    return '#7C3AED'; // Purple - extreme wind
  }
}

/**
 * Get weather condition emoji based on icon code
 */
export function getWeatherEmoji(icon: string): string {
  const emojiMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  
  return emojiMap[icon] || '🌤️';
}

/**
 * Determine if weather is suitable for kiting
 */
export function isKitingWeather(weatherData: WeatherData): {
  suitable: boolean;
  reasons: string[];
  score: number; // 0-10 scale
} {
  const reasons: string[] = [];
  let score = 10;

  // Wind speed check (ideal: 12-25 km/h)
  if (weatherData.windSpeed < 10) {
    reasons.push('Wind too light for kiting');
    score -= 4;
  } else if (weatherData.windSpeed > 30) {
    reasons.push('Wind too strong for beginners');
    score -= 2;
  } else if (weatherData.windSpeed >= 12 && weatherData.windSpeed <= 25) {
    reasons.push('Excellent wind conditions');
  }

  // Precipitation check
  if (weatherData.precipitation > 2) {
    reasons.push('Heavy rain expected');
    score -= 3;
  } else if (weatherData.precipitationProbability > 60) {
    reasons.push('High chance of rain');
    score -= 1;
  }

  // Visibility check
  if (weatherData.visibility < 5) {
    reasons.push('Poor visibility');
    score -= 2;
  }

  // Temperature comfort
  if (weatherData.temperature < 5) {
    reasons.push('Very cold conditions');
    score -= 1;
  } else if (weatherData.temperature > 35) {
    reasons.push('Very hot conditions');
    score -= 1;
  }

  score = Math.max(0, score);
  
  return {
    suitable: score >= 6,
    reasons: reasons.length > 0 ? reasons : ['Good conditions for kiting'],
    score
  };
}

/**
 * Create singleton instance for the application
 */
let weatherInstance: WeatherClass | null = null;

export function getWeatherInstance(): WeatherClass {
  if (!weatherInstance) {
    weatherInstance = new WeatherClass();
  }
  return weatherInstance;
}
