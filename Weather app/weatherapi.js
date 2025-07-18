  const API_KEY = '53eef5b337b36394bc6a53a5a33632b8';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  function degToCompass(num) {
    const val = Math.floor((num / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
  }

  export async function fetchWeather(city) {
    // Fetch current weather
    const currentRes = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!currentRes.ok) throw new Error('City not found');
    const current = await currentRes.json();

    // Fetch forecast (3-hour intervals, up to 5 days)
    const forecastRes = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!forecastRes.ok) throw new Error('Forecast not found');
    const forecast = await forecastRes.json();

    // Prepare hourly (next 8 intervals for 24 hours)
    const hourly = forecast.list.slice(0, 8).map(item => ({
      hour: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      condition: item.weather[0].main
    }));

    // Prepare daily (up to 5 days, pick closest to noon for each day)
    const daysMap = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString();
      const hour = date.getHours();
      if (!daysMap[dayKey]) daysMap[dayKey] = [];
      daysMap[dayKey].push({
        hour,
        temp: Math.round(item.main.temp),
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        condition: item.weather[0].main,
        day: date.toLocaleDateString([], { weekday: 'short' })
      });
    });
    const daily = Object.values(daysMap).slice(0, 5).map(dayArr => {
      // Pick the forecast closest to noon (12:00)
      let closest = dayArr.reduce((prev, curr) => Math.abs(curr.hour - 12) < Math.abs(prev.hour - 12) ? curr : prev);
      return {
        day: closest.day,
        temp: closest.temp,
        icon: closest.icon,
        condition: closest.condition
      };
    });

    // Format sunrise/sunset
    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      city: current.name,
      temperature: Math.round(current.main.temp),
      condition: current.weather[0].main,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed),
      windDirection: degToCompass(current.wind.deg),
      pressure: current.main.pressure, // hPa
      feelsLike: Math.round(current.main.feels_like),
      sunrise,
      sunset,
      icon: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
      hourly,
      daily
    };
  } 