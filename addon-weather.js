/* FILENAME: addon-weather.js
   PURPOSE: Live Weather Widget (Open-Meteo API)
   LOCATION: Top-Left (Opposite to Settings)
*/

(function() {
    // 1. Conflict Check
    if (document.getElementById('os-weather-widget')) return;

    // 2. CSS Injector (Glassmorphism Style)
    const style = document.createElement('style');
    style.innerHTML = `
        #os-weather-widget {
            position: absolute;
            top: 20px; left: 20px; /* Opposite to Settings */
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 10px 20px;
            border-radius: 50px;
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            display: flex; align-items: center; gap: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            cursor: default;
            z-index: 90; /* Settings Button se neeche, Wallpaper se upar */
            transition: all 0.3s ease;
            opacity: 0; animation: fadeIn 1s forwards 0.5s;
        }
        #os-weather-widget:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .w-icon { font-size: 24px; }
        .w-temp { font-size: 18px; font-weight: 600; }
        .w-loc { font-size: 14px; opacity: 0.8; font-weight: 400; border-left: 1px solid rgba(255,255,255,0.3); padding-left: 10px; margin-left: 5px;}
        
        @keyframes fadeIn { to { opacity: 1; } }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const widget = document.createElement('div');
    widget.id = 'os-weather-widget';
    widget.innerHTML = `
        <span class="w-icon" id="w-icon">🛰️</span>
        <span class="w-temp" id="w-temp">--°</span>
        <span class="w-loc" id="w-city">Locating...</span>
    `;
    document.body.appendChild(widget);

    // 4. LOGIC ENGINE (API)
    async function initWeather() {
        if (!navigator.geolocation) {
            updateUI("🚫", "--", "No GPS");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData(lat, lon);
            },
            (error) => {
                console.error("GPS Denied:", error);
                updateUI("🔒", "--", "Permission Denied");
                // User ko bolo click karke retry kare
                widget.onclick = () => initWeather();
            }
        );
    }

    async function fetchWeatherData(lat, lon) {
        try {
            // A. Get Weather (Open-Meteo - Free/No Key)
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            const wRes = await fetch(weatherUrl);
            const wData = await wRes.json();

            // B. Get City Name (BigDataCloud - Free Reverse Geocoding)
            const cityUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
            const cRes = await fetch(cityUrl);
            const cData = await cRes.json();

            // C. Process Data
            const temp = Math.round(wData.current_weather.temperature);
            const code = wData.current_weather.weathercode;
            const city = cData.city || cData.locality || "Unknown";

            // D. WMO Code to Emoji Converter
            const icon = getWeatherEmoji(code);

            updateUI(icon, `${temp}°C`, city);

        } catch (e) {
            console.error(e);
            updateUI("⚠️", "Error", "Offline");
        }
    }

    function getWeatherEmoji(code) {
        if (code === 0) return "☀️"; // Clear
        if (code >= 1 && code <= 3) return "⛅"; // Partly Cloudy
        if (code >= 45 && code <= 48) return "🌫️"; // Fog
        if (code >= 51 && code <= 67) return "🌧️"; // Rain
        if (code >= 71 && code <= 77) return "❄️"; // Snow
        if (code >= 95) return "⛈️"; // Thunderstorm
        return "🌤️";
    }

    function updateUI(icon, temp, loc) {
        document.getElementById('w-icon').innerText = icon;
        document.getElementById('w-temp').innerText = temp;
        document.getElementById('w-city').innerText = loc;
        
        if(window.UltraOS) UltraOS.notify(`Weather: ${temp} in ${loc}`);
    }

    // Start Engine
    initWeather();

    // Auto-Refresh every 30 mins
    setInterval(initWeather, 1800000);

})();
