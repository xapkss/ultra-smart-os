/* =========================================================
   ULTRA GLASS CLOCK — PREMIER EDITION (SMART & REFINED)
   ========================================================= */

(function() {
    // 1. Conflict Check
    if (document.getElementById('os-clock-widget')) return;

    // 2. ULTRA CSS (Refined)
    const style = document.createElement('style');
    style.textContent = `
    /* Font Import (Optional: Google Sans/Roboto for premium feel) */
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600&display=swap');

    #os-clock-widget {
        position: fixed;
        top: 15%; left: 50%;
        transform: translateX(-50%); /* Default Center */
        
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 40px;
        min-width: 280px;

        /* GLASSMORPHISM (Matching Search Bar) */
        background: rgba(30, 30, 30, 0.60);
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        box-shadow: 
            0 15px 35px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.15);
        
        color: white;
        z-index: 50; /* Lower than search widget (9999) */
        cursor: grab;
        user-select: none;
        transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.3s;
    }

    #os-clock-widget:hover {
        background: rgba(40, 40, 40, 0.7);
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    #os-clock-widget:active {
        cursor: grabbing;
        transform: scale(0.98) !important;
    }

    /* --- Typography --- */
    
    /* Greeting Text */
    .clock-greet {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 4px;
    }

    /* Main Time */
    .clock-time-wrap {
        display: flex;
        align-items: baseline;
        justify-content: center;
        font-family: 'JetBrains Mono', 'Segoe UI Mono', monospace; /* Monospace prevents jitter */
        line-height: 1;
        filter: drop-shadow(0 0 15px rgba(255,255,255,0.15));
    }
    .clock-hour-min {
        font-size: 68px;
        font-weight: 700;
        color: #fff;
        letter-spacing: -2px;
    }
    .clock-sec {
        font-size: 24px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.7);
        margin-left: 8px;
    }

    /* Date */
    .clock-date {
        margin-top: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255,255,255,0.1);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.05);
    }

    /* Hint Tooltip (Double click hint) */
    .clock-hint {
        position: absolute;
        bottom: -25px;
        font-size: 10px;
        opacity: 0;
        transition: opacity 0.3s;
        color: rgba(255,255,255,0.4);
        pointer-events: none;
    }
    #os-clock-widget:hover .clock-hint { opacity: 1; }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const widget = document.createElement('div');
    widget.id = 'os-clock-widget';
    widget.innerHTML = `
        <div class="clock-greet" id="u-greet">Loading...</div>
        <div class="clock-time-wrap">
            <span class="clock-hour-min" id="u-time">00:00</span>
            <span class="clock-sec" id="u-sec">00</span>
        </div>
        <div class="clock-date" id="u-date">...</div>
    `;
    document.body.appendChild(widget);

    // 4. SETTINGS & STATE
    let is24Hour = localStorage.getItem('os_clock_format') === '24h'; // Default false (12h)

    // 5. CLOCK LOGIC
    function updateClock() {
        const now = new Date();
        
        // --- Greeting Logic ---
        const hrs = now.getHours();
        let greeting = "Hello";
        if (hrs < 12) greeting = "Shri Radhe ☀️";
        else if (hrs < 17) greeting = "Jai Shri Krishna 🌤️";
        else if (hrs < 21) greeting = " Om Namah Shivaay 🌆";
        else greeting = "Jai Shree Ram 🌙";
        
        document.getElementById('u-greet').textContent = greeting;

        // --- Time Logic ---
        let displayHours = hrs;
        let ampm = "";
        
        if (!is24Hour) {
            ampm = displayHours >= 12 ? "" : ""; // AM/PM symbol optional inside UI, keeping it clean
            displayHours = displayHours % 12;
            displayHours = displayHours ? displayHours : 12; // Handle 0 as 12
        }

        const hStr = String(displayHours).padStart(2, '0');
        const mStr = String(now.getMinutes()).padStart(2, '0');
        const sStr = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('u-time').textContent = `${hStr}:${mStr}`;
        document.getElementById('u-sec').textContent = sStr;

        // --- Date Logic ---
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        document.getElementById('u-date').textContent = now.toLocaleDateString('en-US', options);
    }

    // Toggle Format Listener
    widget.addEventListener('dblclick', () => {
        is24Hour = !is24Hour;
        localStorage.setItem('os_clock_format', is24Hour ? '24h' : '12h');
        updateClock();
        
        // Visual Feedback
        widget.style.transform = "scale(0.95)";
        setTimeout(() => widget.style.transform = "none", 100);
    });

    // Start Clock
    setInterval(updateClock, 1000);
    updateClock();


    // 6. DRAG LOGIC (Robust)
    // Restore Position
    const savedPos = localStorage.getItem('os_clock_pos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        widget.style.left = pos.left;
        widget.style.top = pos.top;
        widget.style.transform = 'none'; // Clear center align
    }

    let isDragging = false;
    let offset = { x: 0, y: 0 };

    function startDrag(e) {
        if(e.target.tagName === "INPUT") return; // Safety

        isDragging = true;
        widget.style.cursor = 'grabbing';
        
        // Get initial offset
        const rect = widget.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        offset.x = clientX - rect.left;
        offset.y = clientY - rect.top;

        // Convert to absolute positioning if centered
        const computed = window.getComputedStyle(widget);
        if(computed.transform !== 'none' && !savedPos) {
             widget.style.left = rect.left + 'px';
             widget.style.top = rect.top + 'px';
             widget.style.transform = 'none';
        }

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, {passive: false});
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault(); // Stop scrolling on touch
        
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        
        widget.style.left = (clientX - offset.x) + 'px';
        widget.style.top = (clientY - offset.y) + 'px';
    }

    function stopDrag() {
        if(!isDragging) return;
        isDragging = false;
        widget.style.cursor = 'grab';
        
        // Save
        localStorage.setItem('os_clock_pos', JSON.stringify({
            left: widget.style.left,
            top: widget.style.top
        }));

        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, {passive: false});

})();
