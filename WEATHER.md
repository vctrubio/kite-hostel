# Weather System Documentation

The Kite Hostel weather system provides consistent 3 PM weather forecasts for the whiteboard with intelligent caching and kiting condition analysis.

## Architecture Overview

```
Frontend (Whiteboard)
    ↓
Weather Actions
    ↓
Weather Class (Backend)
    ↓
Mock/Real Weather API
```

## Key Features

- **Consistent Timing**: Always shows 3 PM weather forecast
- **In-Memory Caching**: 1-hour cache duration with LRU eviction
- **Kiting Analysis**: Automatically evaluates weather conditions for kiting suitability
- **Graceful Fallback**: Provides mock data when API is unavailable
- **Batch Processing**: Efficient handling of multiple date requests

## Components

### 1. WeatherClass (`/backend/WeatherClass.ts`)

The main weather service class that handles:
- Date-based caching with automatic cleanup
- API abstraction (currently using mock data)
- Weather data validation and formatting
- Kiting condition analysis

### 2. Weather Actions (`/actions/weather-actions.ts`)

Server actions that provide:
- `getWeatherForDate()` - Single date weather
- `getWeatherForDates()` - Multiple dates (batch)
- `getWeeklyWeather()` - 7-day forecast
- Cache management utilities

### 3. WhiteboardWeather Component (`/app/whiteboard/WhiteboardWeather.tsx`)

React component featuring:
- Real-time weather display
- Kiting condition analysis
- Loading/error states
- Manual refresh capability

### 4. API Route (`/app/api/weather/route.ts`)

RESTful endpoints for:
- `GET /api/weather` - Fetch weather data
- `POST /api/weather` - Cache management
- `DELETE /api/weather` - Clear all cache

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# For real API integration (optional - system works with mock data)
OPENWEATHER_API_KEY=your-api-key-here
```

### Location Settings

Update the default coordinates in `WeatherClass.ts`:

```typescript
private readonly DEFAULT_LAT = 40.7128;    // Your latitude
private readonly DEFAULT_LON = -74.0060;   // Your longitude
private readonly DEFAULT_LOCATION = "Your Location";
```

## Usage

### In Whiteboard

The weather section is automatically available in the whiteboard navigation. It shows:

1. **Main Weather Info**: Temperature, feels-like, conditions
2. **Weather Details**: Wind, humidity, visibility, UV index
3. **Kiting Analysis**: Automatic evaluation of conditions
4. **Precipitation Warnings**: Rain probability and expected amounts
5. **Wind Alerts**: Gust warnings for lesson planning

### Programmatic Usage

```typescript
import { getWeatherForDate } from '@/actions/weather-actions';

// Get weather for specific date
const result = await getWeatherForDate('2024-08-15', lat, lon, 'Location Name');

if (result.success && result.data) {
  console.log(`Temperature: ${result.data.temperature}°C`);
  console.log(`Wind: ${result.data.windSpeed} km/h`);
}
```

### API Usage

```bash
# Get weather for specific date
curl "http://localhost:3000/api/weather?date=2024-08-15&location=Kite Beach"

# Get cache statistics
curl -X POST http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"action": "get-stats"}'

# Clear cache for specific date
curl -X POST http://localhost:3000/api/weather \
  -H "Content-Type: application/json" \
  -d '{"action": "clear-cache", "date": "2024-08-15"}'
```

## Kiting Condition Analysis

The system automatically evaluates weather conditions for kiting:

### Scoring System (0-10 scale)

- **Wind Speed**: Ideal 12-25 km/h, light wind (-4), strong wind (-2)
- **Precipitation**: Heavy rain (-3), high probability (-1)
- **Visibility**: Poor visibility (-2)
- **Temperature**: Extreme temperatures (-1)

### Recommendations

- **Score 6-10**: ✓ Good for kiting
- **Score 0-5**: ✗ Poor conditions

## Customization

### Change Forecast Time

Update `FORECAST_HOUR` in `WeatherClass.ts`:

```typescript
private readonly FORECAST_HOUR = 15; // 3 PM (change to your preferred hour)
```

### Modify Cache Duration

Update `CACHE_DURATION_MS` in `WeatherClass.ts`:

```typescript
private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
```

### Add Real Weather API

Replace the `mockWeatherAPICall` method in `WeatherClass.ts` with actual API integration:

```typescript
private async fetchWeatherFromAPI(date: string, lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
  );
  
  // Process API response and return WeatherData format
  // ... implementation details
}
```

## Monitoring

### Cache Statistics

Access cache performance metrics:

```typescript
import { getWeatherCacheStats } from '@/actions/weather-actions';

const stats = await getWeatherCacheStats();
console.log('Cache size:', stats.stats?.size);
console.log('Hit rate:', stats.stats?.hitRate);
```

### Health Check

Monitor service health:

```typescript
import { getWeatherServiceHealth } from '@/actions/weather-actions';

const health = await getWeatherServiceHealth();
console.log('Service configured:', health.configured);
console.log('Cache size:', health.cacheSize);
```

## Best Practices

1. **Batch Requests**: Use `getWeatherForDates()` for multiple dates
2. **Error Handling**: Always check `result.success` before using data
3. **Cache Management**: Clear cache when needed, but rely on automatic cleanup
4. **Location Consistency**: Use the same coordinates for consistent caching
5. **API Limits**: Respect rate limits when implementing real weather APIs

## Troubleshooting

### Common Issues

1. **No Weather Data**: Check if API key is configured (for real API)
2. **Slow Loading**: Cache might be empty, subsequent requests will be faster
3. **Stale Data**: Cache duration is 1 hour, clear manually if needed

### Debugging

Enable detailed logging by checking browser console:

- `🌤️` - Cache hits
- `🌐` - API requests
- `💾` - Cache storage
- `🗑️` - Cache cleanup
- `❌` - Errors

## Future Enhancements

Potential improvements to consider:

1. **Multiple Time Forecasts**: Show hourly forecasts instead of just 3 PM
2. **Weather Alerts**: Push notifications for severe weather
3. **Historical Data**: Store and display past weather patterns
4. **Advanced Kiting Metrics**: Thermal conditions, air density, etc.
5. **Location Auto-detection**: Use device GPS for automatic location
6. **Weather Radar Integration**: Show precipitation maps

## Contributing

When modifying the weather system:

1. Update type definitions in `WeatherClass.ts`
2. Add tests for new functionality
3. Update this documentation
4. Consider backwards compatibility
5. Test with both mock and real API data
