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

const hourlyForecastList = document.querySelector('.hourly-forecast-list');
const dailyForecastList = document.querySelector('.daily-forecast-list');

const hourlyForecastSection = document.querySelector('.hourly-forecast');
const dailyForecastSection = document.querySelector('.forecast-section');

import { fetchWeather } from './weatherapi.js';

function showLoading(msg) {
  loadingMessage.textContent = msg;
  loadingMessage.style.display = "block";
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
  const appContent = document.getElementById('app-content');
  if (appContent) appContent.style.display = 'none';
}

function hideLoading() {
  loadingMessage.style.display = "none";
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
  const appContent = document.getElementById('app-content');
  if (appContent) appContent.style.display = 'block';
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = "block";
}

function hideError() {
  errorMessage.style.display = "none";
}

function showEmptyMessage(container, message) {
  container.innerHTML = `<div class="empty-message" style="color:#888; text-align:center; width:100%; padding:20px 0;">${message}</div>`;
}

let lastDailyData = [];

function renderHourlyForecast(hourly) {
  hourlyForecastList.innerHTML = '';
  let hasData = false;
  for (let i = 0; i < Math.min(hourly.length, 8); i++) {
    const hour = hourly[i];
    if (!hour) break;
    hasData = true;
    const iconSrc = hour.icon;
    hourlyForecastList.innerHTML += `
      <div class="forecast-item">
        <time class="forecast-item-time">${hour.hour}</time>
        <img class="forecast-item-icon" src="${iconSrc}" alt="${hour.condition}" />
        <span class="forecast-item-temp">${hour.temp}°C</span>
      </div>
    `;
  }
  if (!hasData) {
    showEmptyMessage(hourlyForecastList, 'No hourly forecast data available.');
  }
}

function renderDailyForecast(daily) {
  dailyForecastList.innerHTML = '';
  let hasData = false;
  for (let i = 0; i < Math.min(daily.length, 5); i++) {
    const day = daily[i];
    if (!day) break;
    hasData = true;
    const iconSrc = day.icon;
    dailyForecastList.innerHTML += `
      <div class="forecast-item">
        <time class="forecast-item-time">${day.day}</time>
        <img class="forecast-item-icon" src="${iconSrc}" alt="${day.condition}" />
        <span class="forecast-item-temp forecast-item__temp--day">${day.temp}°C</span>
      </div>
    `;
  }
  if (!hasData) {
    showEmptyMessage(dailyForecastList, 'No daily forecast data available.');
  }
}

// function setWeatherBackground(condition) {
//   const backgrounds = {
//     'Clear': 'linear-gradient(to top, #fceabb, #f8b500)', // sunny
//     'Clouds': 'linear-gradient(to top, #d7d2cc, #304352)', // cloudy
//     'Rain': 'linear-gradient(to top, #4e54c8, #8f94fb)', // rain
//     'Drizzle': 'linear-gradient(to top, #4e54c8, #8f94fb)',
//     'Thunderstorm': 'linear-gradient(to top, #232526, #414345)', // storm
//     'Snow': 'linear-gradient(to top, #e0eafc, #cfdef3)', // snow
//     'Mist': 'linear-gradient(to top, #cfd9df, #e2ebf0)', // mist
//     'Fog': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
//     'Haze': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
//     'Smoke': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
//     'Dust': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
//     'Sand': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
//     'Ash': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
//     'Squall': 'linear-gradient(to top, #232526, #414345)',
//     'Tornado': 'linear-gradient(to top, #232526, #414345)',
//   };
//   document.body.style.background = backgrounds[condition] || 'defaultColor';
// }


function updateWeatherCard(data) {
  cityNameEl.textContent = data.city;
  currentDateEl.textContent = new Date().toLocaleDateString();
  currentTempEl.innerHTML = `${data.temperature}°C`;
  currentTempIcon.src = `${data.icon}`;
  infoValues[0].textContent = data.humidity + '%';
  infoValues[1].textContent = `${data.windSpeed} km/h, ${data.windDirection}`;
  infoValues[2].textContent = data.pressure + ' hPa';
  infoValues[3].textContent = data.feelsLike + '°C';
  infoValues[4].textContent = data.sunrise;
  infoValues[5].textContent = data.sunset;

  document.getElementById("wind-speed").textContent = data.windSpeed + " km/h";
  document.getElementById("pressure").textContent = data.pressure + " hPa";

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
}

function clearWeatherCard() {
  cityNameEl.textContent = '';
  currentDateEl.textContent = '';
  currentTempEl.innerHTML = '';
  infoValues.forEach(v => v.textContent = '');
}

function clearForecastSections() {
  showEmptyMessage(hourlyForecastList, 'Search for a city to see the hourly forecast.');
  showEmptyMessage(dailyForecastList, 'Search for a city to see the daily forecast.');
}

function searchCity(city) {
  if (!city) return; // თუ city ცარიელია, არ გავაგრძელოთ

  hideError();
  showLoading('Loading weather data...');
  
  fetchWeather(city)
    .then(data => {
      hideLoading();
      updateWeatherCard(data);
      lastDailyData = data.daily;
      renderHourlyForecast(data.hourly);
      renderDailyForecast(data.daily);
    })
    .catch(error => {
      hideLoading();
      showError('City not found. Please try again.');
      clearWeatherCard();
      clearForecastSections();
    });
}

cityInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      searchCity(city);
    }
  }
});

window.addEventListener('DOMContentLoaded', function() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
  const defaultCity = 'Kutaisi';
  searchCity(defaultCity);
});
