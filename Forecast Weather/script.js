const api = "5d6f4cb216c84a618d280654253105";
let weatherOutput = document.querySelector("#weather-output");
let errorMessage = document.querySelector("#error-message");
let citySelect = document.querySelector("#city-select");
let btn = document.querySelector("#get-weather");



let btnForecast = document.querySelector("#get-forecast");
let amountSelect = document.querySelector("#amount-select");

let field = document.querySelector("#search");

const showError = (message) => {
    errorMessage.innerHTML = message;
}
const clearError = () => {
    errorMessage.innerHTML = "";
}

const getTemperatureColor = (temp) => {
    if (temp >= 25) {
        return 'rgb(255, 145, 73)'; 
    } else if (temp >= 15) {
        return 'rgb(254, 209, 106)'; 
    } else if (temp >= 5) {
        return 'rgb(175, 221, 255)'; 
    } else {
        return 'rgb(96, 181, 255)'; 
    }
}

function getWeather(location) {
    let url = `https://api.weatherapi.com/v1/current.json?key=${api}&q=${location}&aqi=yes`;
    fetch(url).then(async response => {
        if (response.status == 400){
            errorMessage.style.display = "block";
            weatherOutput.innerHTML = "";
            showError("City not found");
            return;
        }
        clearError();
        let data = await response.json();
        console.log(data);
        if (response.status == 200){
            errorMessage.style.display = "none";

            const favicon = document.querySelector("link[rel='icon']");
            favicon.href = `https:${data.current.condition.icon}?v=${Date.now()}`;

            const tempColor = getTemperatureColor(data.current.temp_c);
            
            weatherOutput.innerHTML = `
                <div class="city-header">
                    <span>
                        ${data.location.name},
                        ${data.location.region ? data.location.region + " , " : ""}
                        ${data.location.country}
                    </span>
                    <img class="weather-icon" src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
                </div>
                <div class="weather-grid">
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Temperature:</div>
                        <div class="weather-card-value">${data.current.temp_c}°C</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Feels like:</div>
                        <div class="weather-card-value">${data.current.feelslike_c}°C</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Wind speed:</div>
                        <div class="weather-card-value">${data.current.wind_kph} km/h</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Clouds:</div>
                        <div class="weather-card-value">${data.current.cloud}%</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Humidity:</div>
                        <div class="weather-card-value">${data.current.humidity}%</div>
                    </div>
                    <div class="weather-card" style="background: ${tempColor}">
                        <div class="weather-card-title">Pressure:</div>
                        <div class="weather-card-value">${data.current.pressure_mb} mbar</div>
                    </div>
                </div>
            `;
        }
    });
}

function getForecast(location, days) {
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${api}&q=${location}&days=${days}&aqi=no&alerts=no`;
    fetch(url).then(async response => {
        if (response.status == 400) {
            errorMessage.style.display = "block";
            document.querySelector("#forecast-output").innerHTML = "";
            showError("City not found");
            return;
        }
        clearError();
        let data = await response.json();
        if (response.status == 200) {
            errorMessage.style.display = "none";
            
            const favicon = document.querySelector("link[rel='icon']");
            favicon.href = `https:${data.current.condition.icon}?v=${Date.now()}`;

            let forecastHTML = `
                <div class="city-header">
                    <span>
                        ${data.location.name},
                        ${data.location.region ? data.location.region + " , " : ""}
                        ${data.location.country}
                    </span>
                    <img class="weather-icon" src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
                </div>
            `;

            data.forecast.forecastday.forEach(day => {
                const date = day.date;
                forecastHTML += `
                    <div class="forecast-day">
                        <div class="forecast-date">${date}</div>
                        <div class="forecast-hours-carousel">
                `;
                [...day.hour, ...day.hour].forEach(hour => {
                    const time = hour.time.split(' ')[1];
                    forecastHTML += `
                        <div class="forecast-hour">
                            <div class="forecast-hour-time">${time}</div>
                            <img class="forecast-hour-icon" src="https:${hour.condition.icon}" alt="${hour.condition.text}">
                            <div class="forecast-hour-temp">${hour.temp_c}°C</div>
                        </div>
                    `;
                });
                forecastHTML += `
                        </div>
                    </div>
                `;
            });
            document.querySelector("#forecast-output").innerHTML = forecastHTML;

            document.querySelectorAll('.forecast-hours-carousel').forEach(carousel => {
                let isScrolling = false;
                let startX;
                let scrollLeft;

                carousel.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    carousel.scrollLeft += e.deltaY;
                    
                    if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth) {
                        carousel.scrollLeft = 0;
                    }
                });

                carousel.addEventListener('mousedown', (e) => {
                    isScrolling = true;
                    startX = e.pageX - carousel.offsetLeft;
                    scrollLeft = carousel.scrollLeft;
                });

                carousel.addEventListener('mouseleave', () => {
                    isScrolling = false;
                });

                carousel.addEventListener('mouseup', () => {
                    isScrolling = false;
                });

                carousel.addEventListener('mousemove', (e) => {
                    if (!isScrolling) return;
                    e.preventDefault();
                    const x = e.pageX - carousel.offsetLeft;
                    const walk = (x - startX) * 2;
                    carousel.scrollLeft = scrollLeft - walk;
                });
            });
        }
    });
}

if (btn) {
    btn.addEventListener("click", () => {
        getWeather(field.value);
    });
}

citySelect.addEventListener("change", () => {
    if (document.querySelector("#weather-output")) {
        getWeather(citySelect.value);
    } else if (document.querySelector("#forecast-output")) {
        const days = amountSelect.value.split('-')[0];
        getForecast(citySelect.value, days);
    }
});

if (btnForecast && document.querySelector("#forecast-output")) {
    btnForecast.addEventListener("click", () => {
        const city = field.value.trim() ? field.value.trim() : citySelect.value;
        const days = amountSelect.value;
        getForecast(city, days);
    });
}

if (document.querySelector("#forecast-output")) {
    const city = citySelect.value;
    const days = amountSelect.value;
    getForecast(city, days);
}


