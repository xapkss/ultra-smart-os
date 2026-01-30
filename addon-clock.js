/* FILENAME: addon-clock.js
   PURPOSE: ULTRA Clock Widget (Draggable + Glassmorphism)
   VERSION: 2.0 (Neon Glow)
*/

(function() {
    // 1. Conflict Check
    if (document.getElementById('os-clock-widget')) return;

    // 2. ULTRA CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #os-clock-widget {
            position: fixed;
            top: 15%; left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: rgba(15, 15, 15, 0.5); /* Dark Glass */
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            text-align: center;
            color: white;
            z-index: 40; /* Search bar ke neeche */
            cursor: grab;
            user-select: none;
            transition: box-shadow 0.3s ease, border-color 0.3s ease;
            min-width: 200px;
        }

        #os-clock-widget:hover {
            background: rgba(15, 15, 15, 0.7);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        }

        #os-clock-widget:active { cursor: grabbing; scale: 0.98; }

        /* Time Styling */
        .clock-time-wrap {
            display: flex; justify-content: center; align-items: baseline; gap: 5px;
        }
        .clock-time {
            font-size: 64px; font-weight: 200;
            line-height: 1; letter-spacing: -2px;
            font-family: 'Segoe UI', sans-serif;
            text-shadow: 0 0 20px rgba(255,255,255,0.1);
        }
        .clock-sec {
            font-size: 20px; font-weight: 400; opacity: 0.6;
        }

        /* Date Styling */
        .clock-date {
            font-size: 16px; font-weight: 500;
            text-transform: uppercase; letter-spacing: 3px;
            margin-top: 5px; opacity: 0.8;
            color: #4285f4; /* Accent Blue */
        }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const widget = document.createElement('div');
    widget.id = 'os-clock-widget';
    widget.innerHTML = `
        <div class="clock-time-wrap">
            <span class="clock-time" id="u-time">00:00</span>
            <span class="clock-sec" id="u-sec">00</span>
        </div>
        <div class="clock-date" id="u-date">Loading...</div>
    `;
    document.body.appendChild(widget);

    // 4. LOGIC: Restore Position & Dragging
    const savedPos = localStorage.getItem('os_clock_pos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        widget.style.top = pos.top;
        widget.style.left = pos.left;
        widget.style.transform = 'none';
    }

    let isDragging = false, startX, startY, initialLeft, initialTop;

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, {passive: false});

    function startDrag(e) {
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        startX = clientX; startY = clientY;
        
        const rect = widget.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;
        
        widget.style.transform = 'none';
        widget.style.left = initialLeft + 'px';
        widget.style.top = initialTop + 'px';
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, {passive: false});
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        widget.style.left = `${initialLeft + (clientX - startX)}px`;
        widget.style.top = `${initialTop + (clientY - startY)}px`;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        localStorage.setItem('os_clock_pos', JSON.stringify({ top: widget.style.top, left: widget.style.left }));
    }

    // 5. CLOCK ENGINE
    function tick() {
        const now = new Date();
        
        // Time 24h format (HH:MM)
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const secStr = now.toLocaleTimeString('en-US', { second: '2-digit' }); // Just seconds? No, messy logic.
        
        // Manual Seconds
        const sec = String(now.getSeconds()).padStart(2, '0');

        // Date
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        document.getElementById('u-time').innerText = timeStr;
        document.getElementById('u-sec').innerText = sec;
        document.getElementById('u-date').innerText = dateStr;
    }

    setInterval(tick, 1000);
    tick();

    if(window.UltraOS) UltraOS.log("Ultra Clock Widget Loaded");

})();
