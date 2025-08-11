'use client';

import { useState, useEffect, useMemo } from 'react';
import { getWeatherForDate, type WeatherActionResult } from '@/actions/weather-actions';
import { 
  formatTemperature, 
  formatWind, 
  getWeatherEmoji, 
  isKitingWeather,
  kmhToKnots,
  getTarifaWindDirection,
  formatWindKnots,
  getWindSpeedColor,
  type WeatherData,
  type HourlyWeatherData 
} from '@/backend/WeatherClass';
import { 
  Cloud, 
  Eye, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun, 
  AlertCircle,
  RefreshCw,
  Clock,
  MapPin,
  Zap,
  Navigation
} from 'lucide-react';
import { format } from 'date-fns';

interface WhiteboardWeatherProps {
  selectedDate: string;
  location?: string;
  lat?: number;
  lon?: number;
  className?: string;
}

export default function WhiteboardWeather({ 
  selectedDate, 
  location = "Kite Location",
  lat,
  lon,
  className = ""
}: WhiteboardWeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState<HourlyWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<'hourly' | 'summary'>('hourly');

  // Fetch weather data when date changes
  useEffect(() => {
    let isCancelled = false;

    const fetchWeather = async () => {
      if (!selectedDate) return;

      setLoading(true);
      setError(null);

      try {
        console.log(`🌤️ Fetching weather for ${selectedDate} at ${location}`);
        
        const result: WeatherActionResult = await getWeatherForDate(
          selectedDate,
          lat,
          lon,
          location
        );

        if (isCancelled) return;

        if (result.success && result.data) {
          setWeather(result.data);
          setLastUpdated(new Date());
          setError(null);
          
          console.log(`✅ Weather loaded for ${selectedDate}:`, {
            temp: result.data.temperature,
            wind: result.data.windSpeed,
            conditions: result.data.description,
            cached: result.cached
          });
        } else {
          setError(result.error || 'Failed to load weather data');
          console.error(`❌ Weather fetch failed for ${selectedDate}:`, result.error);
        }
        
        // Also fetch hourly data
        try {
          const weatherService = (await import('@/backend/WeatherClass')).getWeatherInstance();
          const hourlyResult = await weatherService.getHourlyWeatherForDate(
            selectedDate,
            lat,
            lon,
            location
          );
          
          if (hourlyResult.data) {
            setHourlyWeather(hourlyResult.data);
            console.log(`✅ Hourly weather loaded for ${selectedDate}`);
          }
        } catch (hourlyError) {
          console.error('Failed to load hourly weather:', hourlyError);
        }
      } catch (err) {
        if (isCancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Weather fetch error:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isCancelled = true;
    };
  }, [selectedDate, lat, lon, location]);

  // Analyze weather for kiting suitability
  const kitingAnalysis = useMemo(() => {
    if (!weather) return null;
    return isKitingWeather(weather);
  }, [weather]);

  // Format the selected date for display
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
      
      return format(date, 'MMM d, yyyy');
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Manual refresh handler
  const handleRefresh = () => {
    // Force a re-fetch by updating a dependency
    setLastUpdated(null);
    const event = new CustomEvent('weather-refresh', { detail: { date: selectedDate } });
    window.dispatchEvent(event);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            🌤️ Weather
            <span className="text-sm font-normal text-muted-foreground">at 3:00 PM</span>
          </h3>
          <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
        
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !weather) {
    return (
      <div className={`bg-card rounded-lg border border-destructive/20 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            🌤️ Weather
            <span className="text-sm font-normal text-muted-foreground">at 3:00 PM</span>
          </h3>
          <button 
            onClick={handleRefresh}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Retry loading weather"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Weather unavailable</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // No data state
  if (!weather) {
    return (
      <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            🌤️ Weather
            <span className="text-sm font-normal text-muted-foreground">at 3:00 PM</span>
          </h3>
        </div>
        
        <p className="text-muted-foreground">No weather data available</p>
      </div>
    );
  }

  // Component for wind-centric hourly display
  const HourlyWindChart = () => {
    if (!hourlyWeather || !hourlyWeather.hourlyForecasts.length) {
      return (
        <div className="text-center text-muted-foreground py-12">
          <Wind className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No wind data available</p>
          <p className="text-sm">Check your connection and try again</p>
        </div>
      );
    }

    const maxKnots = Math.round(Math.max(...hourlyWeather.hourlyForecasts.map(f => kmhToKnots(f.windSpeed))));
    const minKnots = Math.round(Math.min(...hourlyWeather.hourlyForecasts.map(f => kmhToKnots(f.windSpeed))));
    const avgKnots = Math.round(hourlyWeather.hourlyForecasts.reduce((sum, f) => sum + kmhToKnots(f.windSpeed), 0) / hourlyWeather.hourlyForecasts.length);

    return (
      <div className="space-y-6">
        {/* Wind Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Wind Forecast (9 AM - 9 PM)</h4>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">All speeds in knots</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
              <div className="text-2xl font-bold text-green-600">{maxKnots}</div>
              <div className="text-xs text-green-700 dark:text-green-400 font-medium">Peak Wind</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
              <div className="text-2xl font-bold text-blue-600">{avgKnots}</div>
              <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">Average</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2">
              <div className="text-2xl font-bold text-orange-600">{minKnots}</div>
              <div className="text-xs text-orange-700 dark:text-orange-400 font-medium">Minimum</div>
            </div>
          </div>
        </div>

        {/* Main Wind Chart - Prominent Display */}
        <div className="space-y-3">
          {/* Time headers - larger and more prominent */}
          <div className="grid grid-cols-13 gap-1">
            {hourlyWeather.hourlyForecasts.map((forecast) => (
              <div key={forecast.hour} className="text-center">
                <div className={`text-sm font-bold ${forecast.hour === 15 ? 'text-primary bg-primary/10 rounded px-1 py-1' : 'text-foreground'}`}>
                  {forecast.time}
                </div>
              </div>
            ))}
          </div>

          {/* Large Wind Speed Display - The Main Focus */}
          <div className="bg-card border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="grid grid-cols-13 gap-1 items-end" style={{ minHeight: '120px' }}>
              {hourlyWeather.hourlyForecasts.map((forecast) => {
                const knots = Math.round(kmhToKnots(forecast.windSpeed));
                const heightPercent = maxKnots > 0 ? (knots / maxKnots) * 100 : 0;
                const color = getWindSpeedColor(knots);
                const isHighlight = forecast.hour === 15;
                
                return (
                  <div key={forecast.hour} className="flex flex-col items-center group">
                    {/* Large wind speed number */}
                    <div 
                      className={`text-lg font-bold mb-2 transition-all duration-200 group-hover:scale-110 ${
                        isHighlight ? 'text-2xl' : ''
                      }`}
                      style={{ color }}
                    >
                      {knots}
                    </div>
                    
                    {/* Wind speed bar - prominent */}
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-90 shadow-sm ${
                        isHighlight ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ 
                        backgroundColor: color, 
                        height: `${Math.max(heightPercent, 15)}%`,
                        minHeight: '20px',
                        boxShadow: `0 -2px 8px ${color}40`
                      }}
                      title={`${knots} kts at ${forecast.time}\n${getTarifaWindDirection(forecast.windDirection)} (${forecast.windDirection}°)`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wind Direction - Secondary but clear */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Wind Direction</span>
            </div>
            <div className="grid grid-cols-13 gap-1">
              {hourlyWeather.hourlyForecasts.map((forecast) => {
                const tarifaDir = getTarifaWindDirection(forecast.windDirection);
                const color = tarifaDir === 'Levante' ? '#EF4444' : 
                            tarifaDir === 'Norte' ? '#3B82F6' : 
                            tarifaDir === 'Poniente' ? '#10B981' : '#6B7280';
                
                return (
                  <div key={forecast.hour} className="text-center">
                    <div 
                      className="text-xs font-bold px-2 py-1 rounded-full border"
                      style={{ 
                        color: color, 
                        backgroundColor: `${color}10`,
                        borderColor: `${color}30`
                      }}
                      title={`${tarifaDir} (${forecast.windDirection}°)`}
                    >
                      {tarifaDir.charAt(0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {forecast.windDirection}°
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Compact Secondary Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-75">
          {/* Temperature - Compact */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Temperature (°C)</span>
            </div>
            <div className="grid grid-cols-13 gap-1">
              {hourlyWeather.hourlyForecasts.map((forecast) => (
                <div key={forecast.hour} className="text-center">
                  <div className="text-xs py-1 px-1 bg-muted/30 rounded text-muted-foreground">
                    {forecast.temperature}°
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Precipitation - Compact */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Rain Probability</span>
            </div>
            <div className="grid grid-cols-13 gap-1">
              {hourlyWeather.hourlyForecasts.map((forecast) => (
                <div key={forecast.hour} className="text-center">
                  {forecast.precipitationProbability > 10 ? (
                    <div 
                      className="text-xs py-1 px-1 rounded"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${Math.min(forecast.precipitationProbability / 100 * 0.8, 0.6)})`,
                        color: forecast.precipitationProbability > 50 ? 'white' : '#1e40af'
                      }}
                    >
                      {forecast.precipitationProbability}%
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground/50 py-1">—</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wind Speed Legend */}
        <div className="bg-muted/20 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-muted-foreground mb-2">Wind Speed Guide (knots)</h5>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">
              <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: '#3B82F6' }}></div>
              <div className="text-muted-foreground font-medium">&lt; 20</div>
              <div className="text-muted-foreground text-xs">Light</div>
            </div>
            <div className="text-center">
              <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: '#10B981' }}></div>
              <div className="text-muted-foreground font-medium">20-25</div>
              <div className="text-muted-foreground text-xs">Good</div>
            </div>
            <div className="text-center">
              <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: '#F59E0B' }}></div>
              <div className="text-muted-foreground font-medium">26-30</div>
              <div className="text-muted-foreground text-xs">Strong</div>
            </div>
            <div className="text-center">
              <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: '#F97316' }}></div>
              <div className="text-muted-foreground font-medium">31-35</div>
              <div className="text-muted-foreground text-xs">V. Strong</div>
            </div>
            <div className="text-center">
              <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: '#8B5CF6' }}></div>
              <div className="text-muted-foreground font-medium">&gt; 35</div>
              <div className="text-muted-foreground text-xs">Extreme</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-600" />
            Tarifa Wind Forecast
          </h3>
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveView('hourly')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === 'hourly' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setActiveView('summary')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === 'summary' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              Summary
            </button>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-muted rounded transition-colors"
          title="Refresh weather data"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Date and Location */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          {weather && (
            <div className="flex items-center gap-1">
              <span className="text-lg">{getWeatherEmoji(weather.icon)}</span>
              <span>{weather.temperature}°C</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {activeView === 'hourly' ? (
          <HourlyWindChart />
        ) : (
          <div>
            {/* Main Weather Info */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {formatTemperature(weather.temperature)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Feels like {formatTemperature(weather.feelsLike)}
                </div>
                <div className="text-sm text-foreground font-medium mt-1">
                  {weather.description}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl mb-1">
                  {getWeatherEmoji(weather.icon)}
                </div>
                {kitingAnalysis && (
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    kitingAnalysis.suitable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {kitingAnalysis.suitable ? '✓ Good for kiting' : '✗ Poor conditions'}
                  </div>
                )}
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Wind className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">{formatWind(weather.windSpeed, weather.windDirection)}</div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Droplets className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium">{weather.humidity}%</div>
                  <div className="text-xs text-muted-foreground">Humidity</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Eye className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{weather.visibility} km</div>
                  <div className="text-xs text-muted-foreground">Visibility</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Sun className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-sm font-medium">UV {weather.uvIndex}</div>
                  <div className="text-xs text-muted-foreground">UV Index</div>
                </div>
              </div>
            </div>

            {/* Precipitation Info */}
            {(weather.precipitation > 0 || weather.precipitationProbability > 30) && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
                <Droplets className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {weather.precipitationProbability}% chance of rain
                  </div>
                  {weather.precipitation > 0 && (
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      Expected: {weather.precipitation.toFixed(1)}mm
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kiting Conditions Analysis */}
            {kitingAnalysis && (
              <div className={`p-3 rounded-lg border mb-4 ${
                kitingAnalysis.suitable
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className={`w-4 h-4 ${
                    kitingAnalysis.suitable ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    kitingAnalysis.suitable 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    Kiting Conditions (Score: {kitingAnalysis.score}/10)
                  </span>
                </div>
                <div className={`text-xs space-y-1 ${
                  kitingAnalysis.suitable 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {kitingAnalysis.reasons.map((reason, index) => (
                    <div key={index}>• {reason}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Wind Details for Kiting */}
            {weather.windGust && weather.windGust > weather.windSpeed && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                <Wind className="w-4 h-4 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Wind gusts up to {weather.windGust} km/h
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    Consider gusty conditions for lesson planning
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                Updated {format(lastUpdated, 'HH:mm')}
                {error && (
                  <span className="text-destructive ml-2">• Some data from cache</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
