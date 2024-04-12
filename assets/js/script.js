const APIKey = "55e9979f8b83e5317a8c2fb7b4ccbd86";
const metricUnits = 'metric';
const searchFormEl = document.querySelector('#search-form');
const searchHistoryEl = document.querySelector('#search-history');
const currentWeatherEl = document.querySelector('#current-weather');
const forecastWeatherEl = document.querySelector('#forecast-weather');

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

// Get and update search history from local storage
function getHistoryFromStorage(searchInput) {
    const history = JSON.parse(localStorage.getItem("history")) || {};
    const cityName = searchInput;

    history[cityName] = `./index.html?q=${cityName}`;

    const updatedHistory = JSON.stringify(history);

    localStorage.setItem('history', updatedHistory);

    renderSearchHistory();
}

// Get search history from local storage and create a button search button for each value with the corresponding link
function renderSearchHistory() {
    const historyObj = JSON.parse(localStorage.getItem("history"));
    for (let city in historyObj) {
        console.log(city);
        const searchColumnEl = document.createElement('div');
        searchColumnEl.classList.add('col-12', 'w-100');

        searchColumnEl.innerHTML += `<button onclick="window.location.href = '${historyObj[city]}';" class="btn btn-secondary bg-gradient shadow w-100 mt-3">${city}</button>`;

        searchHistoryEl.append(searchColumnEl);
    }
}

// Get parameters from local window address and split it to get the query
function getParam() {
    const query = document.location.search.split('=').pop();

    searchAPI(query);
}

// Convert a UNIX timestamp to a 'M/D/YYYY' format using dayjs
function convertDate(unixTimestamp) {
    const UnixDate = dayjs.unix(unixTimestamp);
    const formatDate = UnixDate.format('M/D/YYYY');
    return formatDate;
}

// Print the 5-day forecast information to the browser
function printForecast(forecastObj) {
    const list = forecastObj.list;
    let day = '';
    let count = 0;

    for (let item of list) {
        if (convertDate(item['dt']) !== convertDate(day) && count < 5) {
            day = item['dt'];
            count += 1;

            const forecastWeather = {
                date: item['dt'],
                cond: item['weather'][0]['main'],
                temp: item['main']['temp'],
                wind: item['wind']['speed'],
                humidity: item['main']['humidity']
            }
    
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('col', 'text-white', 'm-3', 'bg-dark', 'shadow');
    
            forecastCard.innerHTML += `<h4 class="my-3">${convertDate(forecastWeather.date)}</h4>`;
    
            for (let key in conditions) {
                if (key === forecastWeather.cond) {
                    forecastCard.innerHTML += `<p>${conditions[key]}</p>`;
                }
            }
    
            forecastCard.innerHTML += `<p>Temp: ${forecastWeather.temp}&#176;C</p>`;
            forecastCard.innerHTML += `<p>Wind: ${forecastWeather.wind} MPH</p>`;
            forecastCard.innerHTML += `<p>Humidity: ${forecastWeather.humidity}%</p>`;
    
            forecastWeatherEl.append(forecastCard);
        }
    }
}

// Print the current weather information to the browser
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

    const currentTitleEl = document.createElement('h2');
    currentTitleEl.classList.add('mt-3');
    currentTitleEl.textContent = `${currentWeather.city} (${convertDate(currentWeather.date)}) `;

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

// Search the API by fetching data from the URL
// Use a nested fetch: first end gets info by city and second end uses the 'lat' and 'lon' from the first set of data to fetch the forecast data
function searchAPI(query) {
    let weatherQueryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${metricUnits}&appid=${APIKey}`;
    let lon = '';
    let lat = '';

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
                lon += weatherResults.coord.lon;
                lat += weatherResults.coord.lat;
            }

            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${metricUnits}&appid=${APIKey}`);
        })
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (forecastResults) {
            console.log(forecastResults);

            if (!forecastResults) {
                console.log('No results found!');
                searchHistoryEl.innerHTML = '<h3>No results found, search again!</h3>';
            } else {
                printForecast(forecastResults);
            }
        })
        .catch(function (error) {
            console.error(error);
        });
}

// Handle submitted input from search for city form
function handleSearchFormSubmit(event) {
    event.preventDefault();

    const searchInputValue = document.querySelector('#search-input').value;
  
    if (!searchInputValue) {
      console.error('You need a search input value!');
      return;
    }

    const queryString = `./index.html?q=${searchInputValue}`;
    
    getHistoryFromStorage(searchInputValue);

    location.assign(queryString);

    getParam();
}

searchFormEl.addEventListener('submit', handleSearchFormSubmit);

getParam();

renderSearchHistory();