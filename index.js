const clientId = '5EB7U9eW4FRZK3Ey2lrQ0';
const clientSecret = 'DtCcu1gq5YBcGifS3ROCjOwAvo5lwdObFdNygAjJ';

function initMap() {
    const mapCenter = { lat: 45.1885, lng: 5.7245 }; // Grenoble

    // Initialize the map
    const map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 10,
    });

    // Add a click listener to the map
    map.addListener("click", (mapsMouseEvent) => {
        const lat = mapsMouseEvent.latLng.lat();
        const lng = mapsMouseEvent.latLng.lng();

        // Fetch air quality, weather, and restaurants for the clicked location
        fetchAirQuality(lat, lng);
        fetchWeather(lat, lng);
        fetchNearbyRestaurants(lat, lng);
    });
}

function fetchAirQuality(lat, lng) {
    const apiUrl = `https://data.api.xweather.com/airquality/${lat},${lng}?format=json&fields=loc,place,periods,periods.dominant,periods.pollutants&client_id=${clientId}&client_secret=${clientSecret}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const airData = data.response[0];
                const location = airData.place.name;
                const state = airData.place.state;
                const country = airData.place.country;
                const aqi = airData.periods[0].aqi;
                const pollutants = airData.periods[0].pollutants;

                document.getElementById('location').innerHTML = `<h2>${location}, ${state}, ${country}</h2>`;

                let aqiClass = '';
                let aqiText = '';
                if (aqi <= 50) {
                    aqiClass = 'good';
                    aqiText = 'Bonne qualité';
                } else if (aqi <= 100) {
                    aqiClass = 'moderate';
                    aqiText = 'Qualité modérée';
                } else {
                    aqiClass = 'unhealthy';
                    aqiText = 'Qualité insalubre';
                }
                document.getElementById('aqi').innerHTML = `<h3 class="${aqiClass}">AQI: ${aqi} (${aqiText})</h3>`;

                let pollutantsText = '<h4>Polluants :</h4>';
                pollutants.forEach(pollutant => {
                    pollutantsText += `<p><strong>${pollutant.name}:</strong> ${pollutant.valueUGM3} µg/m³ (AQI: ${pollutant.aqi})</p>`;
                });
                document.getElementById('pollutants').innerHTML = pollutantsText;
            } else {
                document.getElementById('location').innerHTML = 'Erreur de récupération des données de qualité de l\'air.';
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('location').innerHTML = 'Erreur lors de la récupération des données de qualité de l\'air.';
        });
}

function fetchWeather(lat, lng) {
    const weatherApiKey = 'YOUR_WEATHER_API_KEY';  // Replace with your OpenWeatherMap API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric&lang=fr`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const weatherInfo = `<p>Température: ${temperature}°C</p><p>${description}</p>`;
            document.getElementById('weather-data').innerHTML = weatherInfo;
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('weather-data').innerHTML = 'Erreur lors de la récupération des données météo.';
        });
}

function fetchNearbyRestaurants(lat, lng) {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 100000,  // 100 km
        type: ['restaurant']
    };

    service.nearbySearch(request, (results, status) => {
        const restaurantList = document.getElementById('restaurants-list');
        restaurantList.innerHTML = ''; // Clear previous results

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(result => {
                const restaurant = document.createElement('p');
                restaurant.textContent = result.name;
                restaurantList.appendChild(restaurant);
            });
        } else {
            restaurantList.innerHTML = 'Aucun restaurant trouvé à proximité.';
        }
    });
}

window.onload = initMap;