/* FILENAME: addon-weather.js
   PURPOSE: Live Weather (GPS + IP Fallback)
   VERSION: 2.0 (Fixed)
*/

(function() {
    // 1. Conflict Check
    if (document.getElementById('os-weather-widget')) return;

    // 2. CSS Injector
    const style = document.createElement('style');
    style.innerHTML = `
        #os-weather-widget {
            position: absolute;
            top: 20px; left: 20px;
            background: rgba(0, 0, 0, 0.4); /* Darker for better visibility */
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 50px;
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            display: flex; align-items: center; gap: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 90;
            transition: all 0.3s ease;
            user-select: none;
        }
        #os-weather-widget:hover { background: rgba(0, 0, 0, 0.6); }
        .w-icon { font-size: 22px; }
        .w-temp { font-size: 16px; font-weight: 700; }
        .w-loc { 
            font-size: 13px; opacity: 0.9; font-weight: 500; 
            border-left: 1px solid rgba(255,255,255,0.3); 
            padding-left: 10px; margin-left: 5px;
            text-transform: capitalize;
        }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const widget = document.createElement('div');
    widget.id = 'os-weather-widget';
    widget.innerHTML = `
        <span class="w-icon" id="w-icon">⏳</span>
        <span class="w-temp" id="w-temp">--</span>
        <span class="w-loc" id="w-city">Loading...</span>
    `;
    // Click to refresh manually
    widget.onclick = () => initWeather();
    document.body.appendChild(widget);

    // 4. LOGIC ENGINE (Double-Layer Fetch)
    async function initWeather() {
        updateUI("📡", "--", "Locating...");

        try {
            // STEP 1: Try IP Location (Faster & No Permission needed)
            // Using ipapi.co (Free, No Key)
            const ipRes = await fetch('https://ipapi.co/json/');
            
            if (!ipRes.ok) throw new Error("IP Service Busy");
            
            const ipData = await ipRes.json();
            
            // Got Location from IP! Now fetch Weather
            fetchWeatherData(ipData.latitude, ipData.longitude, ipData.city);

        } catch (err) {
            console.warn("IP Location Failed, trying GPS...", err);
            
            // STEP 2: Fallback to GPS (Browser Permission)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    pos => fetchWeatherData(pos.coords.latitude, pos.coords.longitude, "GPS Loc"),
                    gpsErr => {
                        console.error(gpsErr);
                        updateUI("🚫", "--", "No Location");
                    }
                );
            } else {
                updateUI("❌", "--", "Not Supported");
            }
        }
    }

    async function fetchWeatherData(lat, lon, cityName) {
        try {
            // Open-Meteo API (Reliable & Free)
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
            
            const res = await fetch(url);
            const data = await res.json();

            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            const icon = getWeatherEmoji(code);

            // Update UI with City Name from IP data
            updateUI(icon, `${temp}°C`, cityName);

        } catch (e) {
            console.error("Weather API Error:", e);
            updateUI("⚠️", "Err", "API Down");
        }
    }

    function getWeatherEmoji(code) {
        if (code === 0) return "☀️";
        if (code >= 1 && code <= 3) return "⛅";
        if (code >= 45 && code <= 48) return "🌫️";
        if (code >= 51 && code <= 67) return "🌧️";
        if (code >= 71 && code <= 77) return "❄️";
        if (code >= 95) return "⛈️";
        return "🌤️";
    }

    function updateUI(icon, temp, loc) {
        document.getElementById('w-icon').innerText = icon;
        document.getElementById('w-temp').innerText = temp;
        document.getElementById('w-city').innerText = loc;
        
        if(window.UltraOS) UltraOS.log(`Weather Updated: ${loc} ${temp}`);
    }

    // Start
    initWeather();
    // Refresh every 1 hour
    setInterval(initWeather, 3600000);

})();
