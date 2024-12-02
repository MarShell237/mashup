
const weatherApiKey = '098185580a031e38cba98336c09fb082';
const clientId = 'j2iM83a1d4LKCt6EHg7LB';
const clientSecret = 'T7VsTvbpQQauCfaoKyiRVQuU0PI0l5IlbxKtAan4';

// Variables pour limiter les appels API
let lastApiCall = 0;
const apiCooldown = 10000; // Délai de 10 secondes
let lastLocation = { lat: null, lng: null }; // Dernières coordonnées utilisées

function canMakeApiCall() {
    const now = Date.now();
    if (now - lastApiCall > apiCooldown) {
        lastApiCall = now;
        return true;
    }
    return false;
}

function fetchDataIfNewLocation(lat, lng) {
    if (lat !== lastLocation.lat || lng !== lastLocation.lng) {
        lastLocation = { lat, lng };

        if (canMakeApiCall()) {
            fetchAirQuality(lat, lng);
            fetchWeather(lat, lng);
        } else {
            alert("Trop de requêtes. Veuillez patienter avant de faire un nouvel appel.");
        }
    } else {
        alert("Coordonnées identiques, aucun appel API effectué.");
    }
}

function initMap() {
    const mapCenter = { lat: 45.1885, lng: 5.7245 }; // Grenoble

    // Initialiser la carte
    const map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 10,
    });

    // Ajouter un écouteur d'événement sur la carte
    map.addListener("click", (mapsMouseEvent) => {
        const lat = mapsMouseEvent.latLng.lat();
        const lng = mapsMouseEvent.latLng.lng();

        // Récupérer les données pour l'emplacement cliqué
        fetchDataIfNewLocation(lat, lng);
    });
}

function fetchAirQuality(lat, lng) {
    const apiUrl = `https://data.api.xweather.com/airquality/${lat},${lng}?format=json&fields=loc,place,periods,periods.dominant,periods.pollutants&client_id=${clientId}&client_secret=${clientSecret}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            return response.json();
        })
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
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric&lang=fr`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.main) { // Si les données sont disponibles
                const temperature = data.main.temp;
                const description = data.weather[0].description;
                const iconCode = data.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                const weatherInfo = `<p>Température: ${temperature}°C</p><p>${description}</p><img src="${iconUrl}" alt="${description}" style="width:50px;height:50px;">`;
                document.getElementById('weather-data').innerHTML = weatherInfo;
            } else {
                document.getElementById('weather-data').innerHTML = 'Données météo non disponibles.';
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            document.getElementById('weather-data').innerHTML = 'Erreur lors de la récupération des données météo.';
        });
}

// Initialisation de la carte au chargement de la page
window.onload = initMap;