/* FILENAME: addon-search.js
   PURPOSE: Draggable Google Search Bar with Mic & Suggestions
   FEATURES: Drag & Drop, Persistent Position, Voice Search, Auto-Complete
*/

(function() {
    // 1. Check if already exists
    if (document.getElementById('os-search-widget')) return;

    // 2. CSS Styles (Google Pill Design)
    const style = document.createElement('style');
    style.innerHTML = `
        #os-search-widget {
            position: fixed;
            top: 20%; left: 50%; /* Default Position */
            transform: translateX(-50%);
            width: 90%; max-width: 600px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 30px;
            box-shadow: 0 4px 25px rgba(0,0,0,0.3);
            display: flex; align-items: center;
            padding: 10px 20px;
            z-index: 999; /* Always on Top */
            backdrop-filter: blur(10px);
            transition: box-shadow 0.3s ease;
            cursor: grab; /* Drag Handle Cursor */
        }
        #os-search-widget:active { cursor: grabbing; }
        #os-search-widget:hover { box-shadow: 0 8px 35px rgba(0,0,0,0.4); }

        /* Google Icon */
        .g-icon { width: 24px; height: 24px; margin-right: 15px; user-select: none; }

        /* Input Field */
        #os-search-input {
            flex: 1; border: none; outline: none;
            background: transparent;
            font-size: 18px; color: #333;
            font-family: 'Segoe UI', sans-serif;
            height: 100%;
        }

        /* Mic Icon */
        #os-mic-btn {
            width: 24px; height: 24px; cursor: pointer;
            fill: #4285f4; margin-left: 15px;
            transition: transform 0.2s;
        }
        #os-mic-btn:hover { transform: scale(1.1); }
        #os-mic-btn.listening { animation: pulse 1.5s infinite; fill: #ea4335; }

        /* Suggestions Box */
        #os-suggestions {
            position: absolute; top: 60px; left: 0;
            width: 100%; background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden; display: none;
            flex-direction: column;
        }
        .s-item {
            padding: 12px 20px; cursor: pointer;
            font-size: 16px; color: #333;
            display: flex; align-items: center; gap: 10px;
            border-bottom: 1px solid #eee;
        }
        .s-item:hover { background: #f1f3f4; }
        .s-icon { font-size: 14px; opacity: 0.5; }

        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
    `;
    document.head.appendChild(style);

    // 3. HTML Injection
    const widget = document.createElement('div');
    widget.id = 'os-search-widget';
    widget.innerHTML = `
        <svg class="g-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        <input type="text" id="os-search-input" placeholder="Search Google..." autocomplete="off">
        <svg id="os-mic-btn" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        <div id="os-suggestions"></div>
    `;
    document.body.appendChild(widget);

    // 4. RESTORE POSITION (Memory)
    const savedPos = localStorage.getItem('os_search_pos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        widget.style.top = pos.top;
        widget.style.left = pos.left;
        widget.style.transform = 'none'; // Disable center transform if moved
    }

    // 5. DRAG & DROP LOGIC
    const input = document.getElementById('os-search-input');
    const mic = document.getElementById('os-mic-btn');
    let isDragging = false, startX, startY, initialLeft, initialTop;

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, {passive: false});

    function startDrag(e) {
        // Don't drag if clicking Input or Mic
        if (e.target === input || e.target === mic) return;
        
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        startX = clientX;
        startY = clientY;
        
        const rect = widget.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Reset transform to allow free movement
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
        e.preventDefault(); // Stop scrolling while dragging
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        widget.style.left = `${initialLeft + dx}px`;
        widget.style.top = `${initialTop + dy}px`;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        
        // Save Position
        const pos = { top: widget.style.top, left: widget.style.left };
        localStorage.setItem('os_search_pos', JSON.stringify(pos));
    }

    // 6. SEARCH LOGIC
    const suggestionsBox = document.getElementById('os-suggestions');

    // Handle Enter Key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(input.value);
    });

    // Handle Suggestions (JSONP approach due to CORS)
    input.addEventListener('input', () => {
        const query = input.value.trim();
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        // Using Google Suggest API
        const script = document.createElement('script');
        script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${query}&callback=handleSuggestions`;
        document.body.appendChild(script);
        script.onload = () => script.remove();
    });

    // Global Callback for JSONP
    window.handleSuggestions = (data) => {
        const results = data[1]; // Array of strings
        if (!results.length) {
            suggestionsBox.style.display = 'none';
            return;
        }

        suggestionsBox.innerHTML = '';
        results.slice(0, 5).forEach(text => { // Show top 5
            const div = document.createElement('div');
            div.className = 's-item';
            div.innerHTML = `<span class="s-icon">🔍</span> ${text}`;
            div.onclick = () => performSearch(text);
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'flex';
    };

    function performSearch(query) {
        if (!query) return;
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    // 7. VOICE SEARCH (Web Speech API)
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        mic.onclick = () => {
            mic.classList.add('listening');
            input.placeholder = "Listening...";
            recognition.start();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            mic.classList.remove('listening');
            performSearch(transcript); // Auto search
        };

        recognition.onerror = () => {
            mic.classList.remove('listening');
            input.placeholder = "Search Google...";
            if(window.UltraOS) UltraOS.notify("Mic Error / Permission Denied");
        };
    } else {
        mic.style.display = 'none'; // Hide if not supported
    }

    if(window.UltraOS) UltraOS.log("Search Widget Loaded");

})();
