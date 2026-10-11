import React, { useState } from 'react';

const weatherDescriptions = {
  0: ['Clear sky', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Foggy', '🌫️'],
  48: ['Depositing rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Moderate drizzle', '🌦️'],
  55: ['Dense drizzle', '🌧️'],
  56: ['Light freezing drizzle', '🌧️'],
  57: ['Dense freezing drizzle', '🌧️'],
  61: ['Slight rain', '🌦️'],
  63: ['Moderate rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  66: ['Light freezing rain', '🌧️'],
  67: ['Heavy freezing rain', '🌧️'],
  71: ['Slight snow', '🌨️'],
  73: ['Moderate snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '❄️'],
  80: ['Slight rain showers', '🌦️'],
  81: ['Moderate rain showers', '🌧️'],
  82: ['Violent rain showers', '⛈️'],
  85: ['Slight snow showers', '🌨️'],
  86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm with hail', '⛈️'],
  99: ['Thunderstorm with heavy hail', '⛈️'],
};

const popularCities = ['London', 'Tokyo', 'New York'];

function getWeatherDescription(code) {
  return weatherDescriptions[code] || ['Weather unavailable', '🌡️'];
}

function App() {
  const [cityInput, setCityInput] = useState('');
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchCity(city) {
    const cityName = city.trim();
    if (!cityName) {
      setError('Enter a city name to get the weather.');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
      geocodingUrl.search = new URLSearchParams({
        name: cityName,
        count: '1',
        language: 'en',
        format: 'json',
      });
      const locationResponse = await fetch(geocodingUrl);
      if (!locationResponse.ok) {
        throw new Error('Could not look up that city. Please try again.');
      }

      const locationData = await locationResponse.json();
      const place = locationData.results && locationData.results[0];
      if (!place) {
        throw new Error(`We couldn't find "${cityName}". Check the spelling and try again.`);
      }

      const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
      forecastUrl.search = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        timezone: 'auto',
      });
      const weatherResponse = await fetch(forecastUrl);
      if (!weatherResponse.ok) {
        throw new Error('Could not get the weather right now. Please try again.');
      }

      const weatherData = await weatherResponse.json();
      if (!weatherData.current) {
        throw new Error('Weather data is unavailable for this city right now.');
      }

      setLocation(place);
      setWeather(weatherData.current);
      setCityInput(cityName);
    } catch (searchError) {
      setError(searchError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    searchCity(cityInput);
  }

  const [description, weatherIcon] = weather
    ? getWeatherDescription(weather.weather_code)
    : ['', ''];

  return (
    <main className="app-shell">
      <section className="weather-app" aria-labelledby="app-title">
        <header className="app-header">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">✳</span>
            <span>little forecast</span>
          </div>
          <span className="live-label"><span /> LIVE WEATHER</span>
        </header>

        <div className="intro">
          <p className="eyebrow">A little sunshine in your day</p>
          <h1 id="app-title">Weather, <em>where you are.</em></h1>
          <p className="intro-copy">Find the weather in any city around the world.</p>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="city-search">Search for a city</label>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            id="city-search"
            type="search"
            value={cityInput}
            onChange={(event) => setCityInput(event.target.value)}
            placeholder="Try a city, like Paris..."
            autoComplete="off"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
            {!loading && <span aria-hidden="true">↗</span>}
          </button>
        </form>

        {!weather && !loading && !error && (
          <div className="suggestions">
            <span>Not sure where to start?</span>
            {popularCities.map((city) => (
              <button className="city-chip" key={city} onClick={() => searchCity(city)} type="button">
                {city}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="message-card" role="status">
            <span className="loading-dot" />
            Finding the latest weather…
          </div>
        )}

        {error && !loading && (
          <div className="error-card" role="alert">
            <span aria-hidden="true">!</span>
            {error}
          </div>
        )}

        {weather && location && !loading && (
          <section className="weather-result" aria-live="polite" aria-label="Current weather">
            <div className="location-row">
              <div>
                <p className="eyebrow">CURRENT WEATHER</p>
                <h2>{location.name}</h2>
                <p className="region">
                  {[location.admin1, location.country].filter(Boolean).join(', ')}
                </p>
              </div>
              <span className="weather-illustration" role="img" aria-label={description}>
                {weatherIcon}
              </span>
            </div>

            <div className="temperature-row">
              <p className="temperature">
                {Math.round(weather.temperature_2m)}
                <span>°</span>
              </p>
              <p className="weather-description">{description}</p>
            </div>

            <div className="weather-details">
              <article className="detail-card">
                <span className="detail-icon humidity-icon" aria-hidden="true">≈</span>
                <p className="detail-label">Humidity</p>
                <p className="detail-value">{weather.relative_humidity_2m}<span>%</span></p>
              </article>
              <article className="detail-card">
                <span className="detail-icon feels-icon" aria-hidden="true">◉</span>
                <p className="detail-label">Feels like</p>
                <p className="detail-value">{Math.round(weather.apparent_temperature)}<span>°</span></p>
              </article>
              <article className="detail-card">
                <span className="detail-icon wind-icon" aria-hidden="true">↗</span>
                <p className="detail-label">Wind</p>
                <p className="detail-value">{Math.round(weather.wind_speed_10m)}<span> km/h</span></p>
              </article>
            </div>
            <p className="updated-time">Updated for local time · {weather.time}</p>
          </section>
        )}

        <footer className="app-footer">
          <span>Simple weather, wherever life takes you.</span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Weather data by Open-Meteo
          </a>
        </footer>
      </section>
    </main>
  );
}

export default App;
