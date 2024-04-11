const APIKey = "55e9979f8b83e5317a8c2fb7b4ccbd86";
const metricUnits = 'metric';
const searchFormEl = document.querySelector('#search-form');
const searchHistoryEl = document.querySelector('#search-history');
const currentWeatherEl = document.querySelector('#current-weather');

const conditions = {
    'Clear' : '&#9728;&#65039;',
    'Clouds' : '&#9729;&#65039;',
    'Rain' : '&#127783;&#65039;',
    'Drizzle' : '&#127783;&#65039;',
    'Thunderstorm' : '&#9928;&#65039;',
    'Snow' : '&#10052;&#65039;',
    'Atmosphere' : '&#127787;&#65039;',
    'Mist' : '&#127787;&#65039;',
    'Smoke' : '&#127787;&#65039;',
    'Haze' : '&#127787;&#65039;',
    'Dust' : '&#127787;&#65039;',
    'Fog' : '&#127787;&#65039;',
    'Sand' : '&#127787;&#65039;',
    'Ash' : '&#127787;&#65039;',
    'Squalls' : '&#127787;&#65039;',
    'Tornado' : '&#127744;&#65039;'
};

function getHistoryFromStorage() {
    return JSON.parse(localStorage.getItem("history")) || [];
}

function getParam() {
    const query = document.location.search.split('=').pop();

    searchAPI(query);
}

function printCurrentWeather(weatherObj) {
    console.log(weatherObj);

    const currentWeather = {
        city: weatherObj.name,
        date: weatherObj.dt,
        conditions: weatherObj.weather[0].main,
        temp: weatherObj.main.temp,
        wind: weatherObj.wind.speed,
        humidity: weatherObj.main.humidity
    };

    const UnixDate = dayjs.unix(currentWeather.date);
    const formatDate = UnixDate.format('M/D/YYYY');

    const currentTitleEl = document.createElement('h2');
    currentTitleEl.classList.add('mt-3');
    currentTitleEl.textContent = `${currentWeather.city} (${formatDate}) `;

    for (let key in conditions) {
        if (key === currentWeather.conditions) {
            currentTitleEl.innerHTML += `<span>${conditions[key]}</span>`;
        }
    }

    currentWeatherEl.append(currentTitleEl);
    currentWeatherEl.innerHTML += `<p>Temp: ${currentWeather.temp}&#176;C</p>`;
    currentWeatherEl.innerHTML += `<p>Wind: ${currentWeather.wind} MPH</p>`;
    currentWeatherEl.innerHTML += `<p>Humidity: ${currentWeather.humidity}%</p>`;
}

function searchAPI(query) {
    let weatherQueryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${metricUnits}&appid=${APIKey}`;

    fetch(weatherQueryUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (weatherResults) {
            console.log(weatherResults);

            if (!weatherResults) {
                console.log('No results found!');
                searchHistoryEl.innerHTML = '<h3>No results found, search again!</h3>';
            } else {
                printCurrentWeather(weatherResults);
            }
        })
        .catch(function (error) {
            console.error(error);
        });
}

function handleSearchFormSubmit(event) {
    event.preventDefault();

    const searchInputValue = document.querySelector('#search-input').value;
  
    if (!searchInputValue) {
      console.error('You need a search input value!');
      return;
    }

    const queryString = `./index.html?q=${searchInputValue}`;
  
    location.assign(queryString);

    getParam();
}

searchFormEl.addEventListener('submit', handleSearchFormSubmit);

getParam();