/* FILENAME: addon-search-ui-upgraded.js
   PURPOSE: Draggable Google Search Bar (UI + UX Enhanced)
   NOTE: Core logic SAME, only UI & search experience upgraded
*/

(function () {
    if (document.getElementById('os-search-widget')) return;

    /* =========================
       STYLES (UI UPGRADE)
    ========================== */
    const style = document.createElement('style');
    style.innerHTML = `
    :root {
        --glass-bg: rgba(255,255,255,0.88);
        --glass-border: rgba(255,255,255,0.4);
        --accent: #4285f4;
        --glow: 0 0 25px rgba(66,133,244,0.35);
    }

    #os-search-widget {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        width: 92%;
        max-width: 620px;
        padding: 12px 22px;
        display: flex;
        align-items: center;
        gap: 14px;
        border-radius: 32px;
        background: var(--glass-bg);
        backdrop-filter: blur(14px) saturate(1.3);
        border: 1px solid var(--glass-border);
        box-shadow: 0 10px 40px rgba(0,0,0,.25);
        z-index: 9999;
        transition: box-shadow .3s ease, transform .25s ease;
        cursor: grab;
    }

    #os-search-widget:hover {
        box-shadow: 0 14px 55px rgba(0,0,0,.35), var(--glow);
    }

    #os-search-widget:focus-within {
        box-shadow: 0 18px 60px rgba(0,0,0,.45), var(--glow);
        transform: translateX(-50%) scale(1.015);
    }

    .g-icon {
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        user-select: none;
    }

    #os-search-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 18px;
        color: #222;
        font-family: system-ui, -apple-system, Segoe UI, sans-serif;
        padding: 6px 0;
    }

    #os-search-input::placeholder {
        color: #777;
    }

    #os-mic-btn {
        width: 26px;
        height: 26px;
        cursor: pointer;
        fill: var(--accent);
        transition: transform .2s ease, filter .2s ease;
    }

    #os-mic-btn:hover {
        transform: scale(1.15);
        filter: drop-shadow(0 0 6px rgba(66,133,244,.6));
    }

    #os-mic-btn.listening {
        fill: #ea4335;
        animation: pulse 1.4s infinite;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.25); }
        100% { transform: scale(1); }
    }

    /* Suggestions */
    #os-suggestions {
        position: absolute;
        top: 70px;
        left: 0;
        width: 100%;
        background: rgba(255,255,255,.96);
        backdrop-filter: blur(12px);
        border-radius: 22px;
        box-shadow: 0 18px 50px rgba(0,0,0,.35);
        overflow: hidden;
        display: none;
        flex-direction: column;
        animation: fadeUp .25s ease;
    }

    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .s-item {
        padding: 14px 22px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        cursor: pointer;
        transition: background .15s ease;
    }

    .s-item:hover {
        background: #f1f3f4;
    }

    .s-icon {
        opacity: .55;
        font-size: 15px;
    }
    `;
    document.head.appendChild(style);

    /* =========================
       HTML
    ========================== */
    const widget = document.createElement('div');
    widget.id = 'os-search-widget';
    widget.innerHTML = `
        <svg class="g-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>

        <input id="os-search-input" type="text" placeholder="Search Google…" autocomplete="off">
        <svg id="os-mic-btn" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>

        <div id="os-suggestions"></div>
    `;
    document.body.appendChild(widget);

    /* =========================
       SEARCH LOGIC (SAME)
    ========================== */
    const input = widget.querySelector('#os-search-input');
    const suggestionsBox = widget.querySelector('#os-suggestions');

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') performSearch(input.value);
    });

    input.addEventListener('input', () => {
        const q = input.value.trim();

        /* 🔥 AUTO REMOVE suggestions when no text */
        if (!q) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
            return;
        }

        if (q.length < 2) return;

        const s = document.createElement('script');
        s.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${q}&callback=handleSuggestions`;
        document.body.appendChild(s);
        s.onload = () => s.remove();
    });

    window.handleSuggestions = data => {
        const results = data[1] || [];
        if (!results.length || !input.value.trim()) {
            suggestionsBox.style.display = 'none';
            return;
        }

        suggestionsBox.innerHTML = '';
        results.slice(0, 5).forEach(text => {
            const div = document.createElement('div');
            div.className = 's-item';
            div.innerHTML = `<span class="s-icon">🔍</span>${text}`;
            div.onclick = () => performSearch(text);
            suggestionsBox.appendChild(div);
        });

        suggestionsBox.style.display = 'flex';
    };

    function performSearch(q) {
        if (!q) return;
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    }
})();
