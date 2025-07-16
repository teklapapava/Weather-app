// switch
const themeToggle = document.getElementById("themeToggle");
let isLight = true; 

themeToggle.addEventListener("click", () => {
  isLight = !isLight; 

  if (isLight) {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
    document.body.classList.add("dark-mode");
  }
});

// Weather search functionality
const apiKey = "53eef5b337b36394bc6a53a5a33632b8";
const cityInput = document.getElementById("cityInput");
const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");

// Main weather card elements
const cityNameEl = document.querySelector(".city-name");
const currentDateEl = document.querySelector(".current-date");
const currentTempEl = document.querySelector(".current-temperature");
const currentTempIcon = document.querySelector(".current-temp_icon");
const infoValues = document.querySelectorAll(".main-weather-block .info-value");
// infoValues order: Humidity, Wind, Pressure, Feels like, Sunrise, Sunset

const hourlyForecastList = document.querySelector('.hourly-forecast-list');
const dailyForecastList = document.querySelector('.daily-forecast-list');

const hourlyForecastSection = document.querySelector('.hourly-forecast');
const dailyForecastSection = document.querySelector('.forecast-section');

import { fetchWeather } from './weatherapi.js';

function showLoading(msg) {
  loadingMessage.textContent = msg;
  loadingMessage.style.display = "block";
  // Show loader spinner
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
  // Hide app content
  const appContent = document.getElementById('app-content');
  if (appContent) appContent.style.display = 'none';
  console.debug("Loading message shown:", msg);
}
function hideLoading() {
  loadingMessage.style.display = "none";
  // Hide loader spinner
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
  // Show app content
  const appContent = document.getElementById('app-content');
  if (appContent) appContent.style.display = 'block';
  console.debug("Loading message hidden");
}
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = "block";
  console.error("Error shown:", msg);
}
function hideError() {
  errorMessage.style.display = "none";
  console.debug("Error message hidden");
}

function showSection(section) {
  section.style.display = '';
  console.debug("Section shown:", section);
}
function hideSection(section) {
  section.style.display = 'none';
  console.debug("Section hidden:", section);
}

function showEmptyMessage(container, message) {
  container.innerHTML = `<div class="empty-message" style="color:#888; text-align:center; width:100%; padding:20px 0;">${message}</div>`;
  console.debug("Empty message shown in container:", message);
}

// Store last fetched forecast data for daily forecast
let lastDailyData = [];

function renderHourlyForecast(hourly) {
  hourlyForecastList.innerHTML = '';
  let hasData = false;
  for (let i = 0; i < Math.min(hourly.length, 8); i++) {
    const hour = hourly[i];
    if (!hour) break;
    hasData = true;
    // Use API icon directly
    const iconSrc = hour.icon;
    hourlyForecastList.innerHTML += `
      <div class="forecast-item">
        <time class="forecast-item-time">${hour.hour}</time>
        <img class="forecast-item-icon" src="${iconSrc}" alt="${hour.condition}" />
        <span class="forecast-item-temp">${hour.temp}°C</span>
      </div>
    `;
    console.debug("Rendered hourly forecast item:", hour);
  }
  if (!hasData) {
    showEmptyMessage(hourlyForecastList, 'No hourly forecast data available.');
    console.warn("No hourly forecast data available.");
  }
}

function renderDailyForecast(daily) {
  dailyForecastList.innerHTML = '';
  let hasData = false;
  for (let i = 0; i < Math.min(daily.length, 5); i++) {
    const day = daily[i];
    if (!day) break;
    hasData = true;
    // Use API icon directly
    const iconSrc = day.icon;
    dailyForecastList.innerHTML += `
      <div class="forecast-item">
        <time class="forecast-item-time">${day.day}</time>
        <img class="forecast-item-icon" src="${iconSrc}" alt="${day.condition}" />
        <span class="forecast-item-temp forecast-item__temp--day">${day.temp}°C</span>
      </div>
    `;
    console.debug("Rendered daily forecast item:", day);
  }
  if (!hasData) {
    showEmptyMessage(dailyForecastList, 'No daily forecast data available.');
    console.warn("No daily forecast data available.");
  }
}

function setWeatherBackground(condition) {
  // You can customize these backgrounds as you like
  const backgrounds = {
    'Clear': 'linear-gradient(to top, #fceabb, #f8b500)', // sunny
    'Clouds': 'linear-gradient(to top, #d7d2cc, #304352)', // cloudy
    'Rain': 'linear-gradient(to top, #4e54c8, #8f94fb)', // rain
    'Drizzle': 'linear-gradient(to top, #4e54c8, #8f94fb)',
    'Thunderstorm': 'linear-gradient(to top, #232526, #414345)', // storm
    'Snow': 'linear-gradient(to top, #e0eafc, #cfdef3)', // snow
    'Mist': 'linear-gradient(to top, #cfd9df, #e2ebf0)', // mist
    'Fog': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
    'Haze': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
    'Smoke': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
    'Dust': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
    'Sand': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
    'Ash': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
    'Squall': 'linear-gradient(to top, #232526, #414345)',
    'Tornado': 'linear-gradient(to top, #232526, #414345)',
  };
  // document.body.style.background = backgrounds[condition] || backgrounds['Clear'];
  // console.debug("Weather background set for condition:", condition);
}

function updateWeatherCard(data) {
  cityNameEl.textContent = data.city;
  currentDateEl.textContent = new Date().toLocaleDateString();
  currentTempEl.innerHTML = `${data.temperature}°C`;
  currentTempIcon.src = `${data.icon}`
  // infoValues order: Humidity, Wind, Pressure, Feels like, Sunrise, Sunset
  infoValues[0].textContent = data.humidity + '%';
  infoValues[1].textContent = `${data.windSpeed} km/h, ${data.windDirection}`;
  infoValues[2].textContent = data.pressure + ' hPa';
  infoValues[3].textContent = data.feelsLike + '°C';
  infoValues[4].textContent = data.sunrise;
  infoValues[5].textContent = data.sunset;

  document.getElementById("wind-speed").textContent = data.windSpeed + " km/h";
  document.getElementById("pressure").textContent = data.pressure + " hPa";
  

  // Set icons for each info row
  const infoIcons = document.querySelectorAll('.weather-info .info-icon');
  const iconFiles = [
    './photo/Humidity.png',
    './photo/Wind.png',
    './photo/Pressure.png',
    './photo/Feels like.png',
    './photo/Sunrise.png',
    './photo/Sunset.png'
  ];
  infoIcons.forEach((img, i) => {
    if (iconFiles[i]) img.src = iconFiles[i];
  });
  setWeatherBackground(data.condition);
  console.debug("Weather card updated:", data);
}

function clearWeatherCard() {
  cityNameEl.textContent = '';
  currentDateEl.textContent = '';
  currentTempEl.innerHTML = '';
  infoValues.forEach(v => v.textContent = '');
  console.debug("Weather card cleared");
}

function clearForecastSections() {
  showEmptyMessage(hourlyForecastList, 'Search for a city to see the hourly forecast.');
  showEmptyMessage(dailyForecastList, 'Search for a city to see the daily forecast.');
  console.debug("Forecast sections cleared");
}

function searchCity(city) {
  if (city) {
    hideError();
    showLoading('Loading weather data...');
    console.debug("Searching for city:", city);
    fetchWeather(city)
      .then(data => {
        hideLoading();
        updateWeatherCard(data);
        lastDailyData = data.daily;
        renderHourlyForecast(data.hourly);
        renderDailyForecast(data.daily);
        console.debug("Weather data loaded for city:", city, data);
      })
      .catch(error => {
        hideLoading();
        showError(error.message || 'Error fetching weather data');
        clearWeatherCard();
        clearForecastSections();
        console.error("Error fetching weather data:", error);
      });
  } else {
    console.warn("searchCity called with empty city");
  }
}

cityInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      console.debug("Enter pressed, searching for city:", city);
      searchCity(city);
    } else {
      console.warn("Enter pressed but city input is empty");
    }
  }
});

// Auto-load default city (Kutaisi) on page load
window.addEventListener('DOMContentLoaded', function() {
  // Show loader immediately
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
  const defaultCity = 'Kutaisi';
  // cityInput.value = defaultCity;
  searchCity(defaultCity);
  console.debug("Loaded default city: Kutaisi");
});



