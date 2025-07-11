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





{/* <script> */}
// === JavaScript Logic ===

const API_KEY = '53eef5b337b36394bc6a53a5a33632b8 '; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM ელემენტების მიღება
const cityInput = document.getElementById('city-input');   
const searchButton = document.getElementById('search-button');
const locationButton = document.getElementById('location-button');

const cityNameElem = document.getElementById('city-name');
const currentDateElem = document.getElementById('current-date');
const currentTempElem = document.getElementById('current-temperature');
const feelsLikeElem = document.getElementById('feels-like');
const windSpeedElem = document.getElementById('wind-speed');
const humidityElem = document.getElementById('humidity');
const pressureElem = document.getElementById('pressure');
const sunriseElem = document.getElementById('sunrise');
const sunsetElem = document.getElementById('sunset');
const weatherDescriptionElem = document.getElementById('weather-description');
const cloudsElem = document.getElementById('clouds');
const visibilityElem = document.getElementById('visibility');
const uvIndexElem = document.getElementById('uv-index'); // UV ინდექსი OpenWeatherMap-ის ძირითად API-ში არ არის

const hourlyForecastList = document.getElementById('hourly-forecast-list');
const dailyForecastList = document.getElementById('daily-forecast-list');
const timeOptions = document.querySelectorAll('.time-options__item');

let lastForecastData = null; // API-დან მიღებული ბოლო პროგნოზის მონაცემების შესანახად

// თარიღის ფორმატირების დამხმარე ფუნქცია
function formatDate(timestamp, includeDayOfWeek = true) {
    const date = new Date(timestamp * 1000); // Unix timestamp-ის მილიწამებში გადაყვანა
    const options = {
        weekday: includeDayOfWeek ? 'short' : undefined,
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('ka-GE', options); // ქართული ლოკალი
}

// დროის ფორმატირების დამხმარე ფუნქცია (მაგ. მზის ამოსვლა/ჩასვლა)
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleTimeString('en-US', options); // AM/PM ფორმატისთვის en-US
}

// ამინდის მონაცემების მოძიების ფუნქცია
async function fetchWeatherData(queryType, queryValue) {
    let url;
    if (queryType === 'coords') {
        url = `${BASE_URL}/weather?lat=${queryValue.lat}&lon=${queryValue.lon}&appid=${API_KEY}&units=metric&lang=ka`;
    } else if (queryType === 'city') {
        url = `${BASE_URL}/weather?q=${queryValue}&appid=${API_KEY}&units=metric&lang=ka`;
    } else {
        console.error("არასწორი მოთხოვნის ტიპი");
        return;
    }

    try {
        console.log(`API ზარი მიმდინარე ამინდისთვის: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP შეცდომა! სტატუსი: ${response.status}, ტექსტი: ${await response.text()}`);
            throw new Error(`HTTP შეცდომა! სტატუსი: ${response.status}`);
        }
        const data = await response.json();
        console.log('მიმდინარე ამინდის მონაცემები:', data); // გამართვისთვის
        updateCurrentWeather(data);

        // 5-დღიანი / 3-საათიანი პროგნოზის მოძიება საათობრივი და დღიური პროგნოზისთვის
        const forecastUrl = `${BASE_URL}/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}&units=metric&lang=ka`;
        console.log(`API ზარი პროგნოზისთვის: ${forecastUrl}`);
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            console.error(`HTTP შეცდომა! სტატუსი: ${forecastResponse.status}, ტექსტი: ${await forecastResponse.text()}`);
            throw new Error(`HTTP შეცდომა! სტატუსი: ${forecastResponse.status}`);
        }
        const forecastData = await forecastResponse.json();
        console.log('პროგნოზის მონაცემები:', forecastData); // გამართვისთვის
        
        lastForecastData = forecastData; // შეინახეთ მონაცემები გლობალურ ცვლადში

        updateHourlyForecast(forecastData);
        updateDailyForecast(forecastData, 7); // ნაგულისხმევად 1 კვირა
    } catch (error) {
        console.error('ამინდის მონაცემების მოძიების შეცდომა:', error);
        alert('ამინდის მონაცემების მოძიება ვერ მოხერხდა. გთხოვთ, შეამოწმეთ ქალაქის სახელი, თქვენი API გასაღები ან ინტერნეტ კავშირი.');
    }
}

// მიმდინარე ამინდის UI-ის განახლების ფუნქცია
function updateCurrentWeather(data) {
    cityNameElem.textContent = data.name || 'უცნობი ქალაქი';
    currentDateElem.textContent = formatDate(data.dt || Date.now() / 1000);
    currentTempElem.textContent = `${Math.round(data.main.temp)}°C`;
    feelsLikeElem.textContent = `${Math.round(data.main.feels_like)}°C`;
    windSpeedElem.textContent = `${data.wind.speed} კმ/სთ`;
    humidityElem.textContent = `${data.main.humidity}%`;
    pressureElem.textContent = `${data.main.pressure} მბარ`;
    sunriseElem.textContent = formatTime(data.sys.sunrise);
    sunsetElem.textContent = formatTime(data.sys.sunset);
    weatherDescriptionElem.textContent = data.weather[0].description || 'N/A';
    cloudsElem.textContent = `${data.clouds.all}%`;
    visibilityElem.textContent = `${(data.visibility / 1000).toFixed(1)} კმ`; // ხილვადობა მეტრებშია, დამრგვალება
    uvIndexElem.textContent = 'N/A'; // UV ინდექსი არ არის ძირითად API-ში
}

// საათობრივი პროგნოზის UI-ის განახლების ფუნქცია
function updateHourlyForecast(forecastData) {
    hourlyForecastList.innerHTML = ''; // წინა ელემენტების გასუფთავება

    // აჩვენეთ მაქსიმუმ 11 საათობრივი ელემენტი (დაახლოებით 24 საათი 3-საათიანი ნაბიჯებით)
    for (let i = 0; i < Math.min(forecastData.list.length, 11); i++) {
        const item = forecastData.list[i];
        const itemDate = new Date(item.dt * 1000);
        
        let timeText;
        if (i === 0) {
            // შეამოწმეთ, არის თუ არა ეს ნამდვილად მიმდინარე საათი
            const now = new Date();
            if (itemDate.getHours() === now.getHours()) {
                timeText = "ახლა";
            } else {
                timeText = itemDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            }
        } else {
            timeText = itemDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        }

        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // OpenWeatherMap ხატულები

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <time class="forecast-item-time" datetime="${itemDate.toISOString()}">${timeText}</time>
            <img class="forecast-item-icon" src="${iconUrl}" alt="${item.weather[0].description}" onerror="this.onerror=null;this.src='https://placehold.co/24x24/white/black?text=Icon';" />
            <span class="forecast-item-temp">${Math.round(item.main.temp)}°C</span>
        `;
        hourlyForecastList.appendChild(forecastItem);
    }
}

// დღიური პროგნოზის UI-ის განახლების ფუნქცია
function updateDailyForecast(forecastData, numDaysToShow) {
    dailyForecastList.innerHTML = ''; // წინა ელემენტების გასუფთავება
    const dailyForecasts = {};

    // პროგნოზის მონაცემების დღის მიხედვით დაჯგუფება
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        // გამოტოვეთ მიმდინარე დღის უკვე გასული საათები, თუ ეს პირველი დღეა
        const today = new Date();
        today.setHours(0,0,0,0); // Set to start of today
        const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // თუ ეს მიმდინარე დღეა და დრო უკვე გასულია, გამოტოვეთ
        if (itemDay.getTime() === today.getTime() && date.getTime() < Date.now()) {
            return;
        }


        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                temps: [],
                icons: [],
                description: item.weather[0].description,
                dt: item.dt // Use the timestamp for the first entry of the day
            };
        }
        dailyForecasts[dateKey].temps.push(item.main.temp);
        // აირჩიეთ ხატულა შუადღისთვის, თუ შესაძლებელია, ან პირველი ხელმისაწვდომი
        const hour = new Date(item.dt * 1000).getHours();
        if (hour >= 11 && hour <= 14 && !dailyForecasts[dateKey].middayIcon) {
            dailyForecasts[dateKey].middayIcon = item.weather[0].icon;
        }
        dailyForecasts[dateKey].icons.push(item.weather[0].icon); // Store all icons for fallback
    });

    let daysCount = 0;
    // დაალაგეთ დღეები ქრონოლოგიურად
    const sortedDateKeys = Object.keys(dailyForecasts).sort();

    for (const dateKey of sortedDateKeys) {
        if (daysCount >= numDaysToShow) break;

        const dayData = dailyForecasts[dateKey];
        
        // გამოტოვეთ დღევანდელი დღე, თუ უკვე ნაჩვენებია მიმდინარე ამინდის სექციაში
        const todayKey = new Date().toISOString().split('T')[0];
        if (dateKey === todayKey && daysCount === 0) {
            // თუ პირველი დღეა და ის დღევანდელია, გამოტოვეთ, რადგან მიმდინარე ამინდი უკვე ნაჩვენებია
            // ან შეგიძლიათ გადაწყვიტოთ, რომ პირველი დღე მაინც აჩვენოთ, როგორც "დღეს"
            // ამჟამად, გამოვტოვოთ, რათა არ მოხდეს დუბლირება
            // თუ გინდათ, რომ "დღეს" გამოჩნდეს, წაშალეთ ეს if ბლოკი
            // და დარწმუნდით, რომ updateCurrentWeather-ში არ არის იგივე დღის მონაცემები
            // ან დაამატეთ "დღეს" ტექსტი formatDate ფუნქციაში
        }


        const minTemp = Math.round(Math.min(...dayData.temps));
        const maxTemp = Math.round(Math.max(...dayData.temps));
        
        // აირჩიეთ წარმომადგენლობითი ხატულა (შუადღის, ან პირველი)
        const iconCode = dayData.middayIcon || dayData.icons[0];
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <time class="forecast-item__time" datetime="${dateKey}">${formatDate(dayData.dt, true)}</time>
            <img class="forecast-item__icon" src="${iconUrl}" alt="${dayData.description}" onerror="this.onerror=null;this.src='https://placehold.co/32x32/white/black?text=Icon';" />
            <span class="forecast-item__temp forecast-item__temp--day">${maxTemp}°C</span>
            <span class="forecast-item__temp forecast-item__temp--night">${minTemp}°C</span>
        `;
        dailyForecastList.appendChild(forecastItem);
        daysCount++;
    }
}

// მოვლენის მსმენელები
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData('city', city);
    } else {
        alert('გთხოვთ, შეიყვანოთ ქალაქის სახელი.');
    }
});

locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData('coords', { lat, lon });
            },
            (error) => {
                console.error('გეოლოკაციის შეცდომა:', error);
                alert('ლოკაციის მიღება ვერ მოხერხდა. გთხოვთ, მიეცით ნებართვა ან სცადეთ ქალაქის ძებნა.');
            }
        );
    } else {
        alert('თქვენი ბრაუზერი არ უჭერს მხარს გეოლოკაციას.');
    }
});

// დღიური პროგნოზის დროის ოფციები
timeOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        // წაშალეთ აქტიური კლასი ყველა ოფციიდან
        timeOptions.forEach(opt => opt.classList.remove('time-options__item--active'));
        // დაამატეთ აქტიური კლასი დაწკაპუნებულ ოფციას
        event.target.classList.add('time-options__item--active');

        const numDays = parseInt(event.target.dataset.days);
        
        // ხელახლა რენდერირება უკვე მოძიებული მონაცემების საფუძველზე
        if (lastForecastData) {
            updateDailyForecast(lastForecastData, numDays);
        } else {
            alert('ჯერ ამინდის მონაცემები არ არის მოძიებული.');
        }
    });
});

// საწყისი ჩატვირთვა: ნაგულისხმევი ქალაქის (მაგ. თბილისი) ამინდის მოძიება
// ან მომხმარებლის ლოკაციის მიღება
window.addEventListener('load', () => {
    if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY' || !API_KEY) {
        alert('გთხოვთ, ჩასვათ თქვენი OpenWeatherMap API გასაღები JavaScript კოდში!');
        console.error('API გასაღები არ არის დაყენებული.');
        // შეგიძლიათ აქ დაამატოთ ნაგულისხმევი მონაცემების ჩვენება, თუ API არ მუშაობს
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData('coords', { lat, lon });
            },
            (error) => {
                console.warn('გეოლოკაცია უარყოფილია ან ვერ მოხერხდა, ნაგულისხმევად თბილისი.');
                fetchWeatherData('city', 'Tbilisi'); // ნაგულისხმევად თბილისი, თუ გეოლოკაცია ვერ მოხერხდა
            }
        );
    } else {
        console.warn('გეოლოკაცია არ არის მხარდაჭერილი, ნაგულისხმევად თბილისი.');
        fetchWeatherData('city', 'Tbilisi'); // ნაგულისხმევად თბილისი, თუ არ არის მხარდაჭერილი
    }
})
