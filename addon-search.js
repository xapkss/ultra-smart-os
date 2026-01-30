/* PATCH: UI UPGRADED + DRAG FIXED */

(function () {
    if (document.getElementById('os-search-widget')) return;

    /* =========================
       STYLES
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
        touch-action: none;
    }

    #os-search-widget:active { cursor: grabbing; }

    #os-search-widget:hover {
        box-shadow: 0 14px 55px rgba(0,0,0,.35), var(--glow);
    }

    .g-icon { width: 26px; height: 26px; }

    #os-search-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 18px;
    }

    #os-mic-btn {
        width: 26px;
        height: 26px;
        cursor: pointer;
        fill: var(--accent);
    }

    #os-suggestions {
        position: absolute;
        top: 70px;
        left: 0;
        width: 100%;
        background: white;
        border-radius: 22px;
        box-shadow: 0 18px 50px rgba(0,0,0,.35);
        display: none;
        flex-direction: column;
    }

    .s-item {
        padding: 14px 22px;
        cursor: pointer;
        display: flex;
        gap: 12px;
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
            <circle cx="12" cy="12" r="10" fill="#4285f4"/>
        </svg>

        <input id="os-search-input" placeholder="Search Google…" autocomplete="off">
        <svg id="os-mic-btn" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        </svg>

        <div id="os-suggestions"></div>
    `;
    document.body.appendChild(widget);

    /* =========================
       DRAG LOGIC (FIXED)
    ========================== */
    const input = widget.querySelector('#os-search-input');
    const mic = widget.querySelector('#os-mic-btn');

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        if (e.target === input || e.target === mic) return;

        isDragging = true;

        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;

        const rect = widget.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        widget.style.transform = 'none';
        widget.style.left = startLeft + 'px';
        widget.style.top = startTop + 'px';

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const point = e.touches ? e.touches[0] : e;
        widget.style.left = startLeft + (point.clientX - startX) + 'px';
        widget.style.top = startTop + (point.clientY - startY) + 'px';
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
    }

})();
