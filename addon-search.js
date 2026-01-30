/* FILENAME: addon-search.js
   PURPOSE: ULTRA Search Widget (Glassmorphism HUD)
   VERSION: 3.0 (Pro UI)
*/

(function() {
    // 1. Check Conflicts
    if (document.getElementById('os-search-widget')) return;

    // 2. ULTRA CSS (Cyber-Glass Design)
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- MAIN BAR --- */
        #os-search-widget {
            position: fixed;
            top: 20%; left: 50%;
            transform: translateX(-50%);
            width: 90%; max-width: 650px;
            height: 60px;
            background: rgba(15, 15, 15, 0.6); /* Dark Glass */
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            display: flex; align-items: center;
            padding: 0 20px;
            z-index: 999;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: grab;
        }
        
        /* Focus Glow Effect */
        #os-search-widget.focused {
            background: rgba(15, 15, 15, 0.8);
            border-color: rgba(66, 133, 244, 0.5); /* Google Blue Glow */
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        #os-search-widget:active { cursor: grabbing; scale: 0.98; }

        /* --- ICONS --- */
        .g-icon { width: 28px; height: 28px; margin-right: 15px; opacity: 0.8; transition: 0.3s; fill: #fff; }
        /* Colorize on Hover */
        #os-search-widget:hover .g-icon { fill: #4285F4; opacity: 1; }

        /* --- INPUT --- */
        #os-search-input {
            flex: 1; border: none; outline: none;
            background: transparent;
            font-size: 20px; color: #fff;
            font-weight: 300; letter-spacing: 0.5px;
            font-family: 'Segoe UI', sans-serif;
            height: 100%;
        }
        #os-search-input::placeholder { color: rgba(255,255,255,0.4); }

        /* --- MIC BUTTON --- */
        #os-mic-btn {
            width: 24px; height: 24px; cursor: pointer;
            fill: rgba(255,255,255,0.6); margin-left: 15px;
            transition: 0.3s;
        }
        #os-mic-btn:hover { fill: #fff; transform: scale(1.1); }
        #os-mic-btn.listening { animation: pulse 1.5s infinite; fill: #ea4335; }

        /* --- SUGGESTIONS (Floating HUD) --- */
        #os-suggestions {
            position: absolute; top: 70px; left: 0;
            width: 100%; 
            background: rgba(20, 20, 20, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(25px);
            overflow: hidden; display: none;
            flex-direction: column;
        }
        .s-item {
            padding: 14px 20px; cursor: pointer;
            font-size: 16px; color: rgba(255,255,255,0.9);
            display: flex; align-items: center; gap: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: background 0.2s;
        }
        .s-item:last-child { border-bottom: none; }
        .s-item:hover { background: rgba(255,255,255,0.1); padding-left: 25px; }
        .s-icon { font-size: 14px; opacity: 0.5; }

        @keyframes pulse { 0% { scale: 1; } 50% { scale: 1.2; } 100% { scale: 1; } }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const widget = document.createElement('div');
    widget.id = 'os-search-widget';
    widget.innerHTML = `
        <svg class="g-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        <input type="text" id="os-search-input" placeholder="Type to search..." autocomplete="off">
        <svg id="os-mic-btn" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        <div id="os-suggestions"></div>
    `;
    document.body.appendChild(widget);

    // 4. RESTORE & DRAG LOGIC (Same Logic, Better Performance)
    const savedPos = localStorage.getItem('os_search_pos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        widget.style.top = pos.top;
        widget.style.left = pos.left;
        widget.style.transform = 'none';
    }

    const input = document.getElementById('os-search-input');
    const mic = document.getElementById('os-mic-btn');
    const suggestionsBox = document.getElementById('os-suggestions');

    // Drag Logic
    let isDragging = false, startX, startY, initialLeft, initialTop;
    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, {passive: false});

    function startDrag(e) {
        if (e.target === input || e.target === mic) return;
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        startX = clientX; startY = clientY;
        const rect = widget.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;
        widget.style.transform = 'none';
        widget.style.left = initialLeft + 'px'; widget.style.top = initialTop + 'px';
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
        localStorage.setItem('os_search_pos', JSON.stringify({ top: widget.style.top, left: widget.style.left }));
    }

    // 5. SEARCH & GLOW LOGIC
    input.addEventListener('focus', () => widget.classList.add('focused'));
    input.addEventListener('blur', () => {
        widget.classList.remove('focused');
        // Delay hide to allow clicks on suggestions
        setTimeout(() => suggestionsBox.style.display = 'none', 200);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(input.value);
    });

    // 6. SMART SUGGESTIONS (Auto-Hide Fix)
    input.addEventListener('input', () => {
        const query = input.value.trim();
        
        // FIX: Agar text khali hai, to turant gayab karo
        if (!query) {
            suggestionsBox.style.display = 'none';
            return;
        }

        // Fetch Suggestions
        const script = document.createElement('script');
        script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${query}&callback=handleUltraSuggestions`;
        document.body.appendChild(script);
        script.onload = () => script.remove();
    });

    window.handleUltraSuggestions = (data) => {
        const results = data[1];
        if (!results.length || !input.value.trim()) {
            suggestionsBox.style.display = 'none';
            return;
        }

        suggestionsBox.innerHTML = '';
        results.slice(0, 5).forEach(text => {
            const div = document.createElement('div');
            div.className = 's-item';
            div.innerHTML = `<span class="s-icon">🔍</span> ${text}`;
            div.onmousedown = () => performSearch(text); // onmousedown fires before blur
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'flex';
    };

    function performSearch(query) {
        if (!query) return;
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    // 7. VOICE (Same logic)
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        mic.onclick = () => {
            mic.classList.add('listening');
            input.placeholder = "Listening...";
            recognition.start();
        };
        recognition.onresult = (e) => {
            const txt = e.results[0][0].transcript;
            input.value = txt;
            mic.classList.remove('listening');
            performSearch(txt);
        };
    } else { mic.style.display = 'none'; }

    if(window.UltraOS) UltraOS.log("Ultra Search HUD Loaded");

})();
