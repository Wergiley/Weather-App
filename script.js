document.getElementById("submit").addEventListener("click", fetchWeather);

async function fetchWeather() {
  let searchInput = document.getElementById("search").value.trim();
  const weatherDataSection = document.getElementById("weather-data");

  if (!searchInput) {
    weatherDataSection.style.display = "block";
    weatherDataSection.innerHTML = `
      <div>
        <h2>Empty Input!</h2>
        <p>Please try again with a valid <u>city name</u>.</p>
      </div>
    `;
    return;
  }

  weatherDataSection.style.display = "none";

  // Função para fazer geocoding pelo Nominatim OpenStreetMap
  async function getLonAndLat(city) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar localização");
    }
    const data = await response.json();
    if (data.length === 0) {
      throw new Error("Cidade não encontrada");
    }
    return { lat: data[0].lat, lon: data[0].lon, display_name: data[0].display_name };
  }

  try {
    const location = await getLonAndLat(searchInput);

    // Chamando API do Open-Meteo
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`);
    if (!weatherResponse.ok) {
      throw new Error("Erro ao buscar clima");
    }
    const weatherData = await weatherResponse.json();

    weatherDataSection.style.display = "flex";
    weatherDataSection.innerHTML = `
      <h2>${location.display_name}</h2>
      <p><strong>Temperature:</strong> ${weatherData.current_weather.temperature} °C</p>
      <p><strong>Wind Speed:</strong> ${weatherData.current_weather.windspeed} km/h</p>
      <p><strong>Weather Code:</strong> ${weatherData.current_weather.weathercode}</p>
    `;
  } catch (error) {
    weatherDataSection.style.display = "block";
    weatherDataSection.innerHTML = `
      <div>
        <h2>Error</h2>
        <p>${error.message}</p>
      </div>
    `;
  }

  // Limpa o campo de busca após pesquisa
  document.getElementById("search").value = "";
}
