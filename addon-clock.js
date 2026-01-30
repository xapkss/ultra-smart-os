/* FILENAME: addon-clock.js
   PURPOSE: Digital Clock Widget
   DEPENDENCY: None (Standalone)
*/

(function() {
    // 1. Conflict Check: Agar ghadi pehle se hai to dubara mat banao
    if (document.getElementById('os-clock-widget')) return;

    // 2. CSS Injector (Sirf is widget ka style)
    const style = document.createElement('style');
    style.innerHTML = `
        #os-clock-widget {
            position: fixed;
            top: 15%; left: 50%;
            transform: translateX(-50%);
            text-align: center;
            color: rgba(255, 255, 255, 0.9);
            z-index: 50;
            pointer-events: none; /* Click through */
            font-family: 'Segoe UI', sans-serif;
            text-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }
        .os-time { font-size: 72px; font-weight: 200; letter-spacing: -2px; margin: 0; line-height: 1; }
        .os-date { font-size: 18px; font-weight: 400; opacity: 0.8; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
    `;
    document.head.appendChild(style);

    // 3. HTML Injector
    const widget = document.createElement('div');
    widget.id = 'os-clock-widget';
    widget.innerHTML = `
        <h1 class="os-time" id="widget-time">00:00</h1>
        <p class="os-date" id="widget-date">Loading...</p>
    `;
    document.body.appendChild(widget);

    // 4. Logic Engine
    function tick() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        document.getElementById('widget-time').innerText = timeStr;
        document.getElementById('widget-date').innerText = dateStr;
    }

    // Start
    setInterval(tick, 1000);
    tick();

    // System Log
    if(window.UltraOS) UltraOS.log("Clock Widget Installed");

})();
