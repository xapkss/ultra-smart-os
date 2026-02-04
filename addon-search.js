/* =========================================================
   ULTRA GLASS SEARCH HUD — REFINED (NO NEON, FIXED DRAG)
   ========================================================= */

(function () {
    // Prevent duplicate injection
    if (document.getElementById("os-search-widget")) return;

    /* ================= CSS ================= */
    const style = document.createElement("style");
    style.textContent = `
    /* --- Base Variables & Reset --- */
    #os-search-widget-wrapper * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* --- Main Widget (Glassmorphism) --- */
    #os-search-widget {
        position: fixed;
        top: 20%;
        left: 50%;
        /* Initial center transform */
        transform: translateX(-50%); 
        
        width: 90%;
        max-width: 650px; /* Default Medium */
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        z-index: 9999;

        /* GLASSMORPHISM STYLE (No Neon) */
        background: rgba(30, 30, 30, 0.65);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4), 
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        
        border-radius: 20px;
        transition: max-width 0.3s ease, transform 0.1s;
        color: #fff;
    }

    /* Drag Handle Cursor */
    #os-search-widget.draggable {
        cursor: grab;
    }
    #os-search-widget.dragging {
        cursor: grabbing;
        transform: scale(0.99) !important; /* Scale effect while dragging */
        user-select: none;
    }

    /* --- Input Field --- */
    #os-search-input {
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-size: 18px;
        color: rgba(255, 255, 255, 0.95);
        font-weight: 400;
        letter-spacing: 0.5px;
    }
    #os-search-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    /* --- Settings/Resize Icon --- */
    #os-settings-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0.6;
        transition: 0.2s;
        margin-left: 10px;
    }
    #os-settings-btn:hover {
        background: rgba(255,255,255,0.1);
        opacity: 1;
    }
    #os-settings-btn svg {
        fill: #fff;
        width: 18px;
        height: 18px;
    }

    /* --- Suggestions Dropdown --- */
    #os-suggestions {
        position: absolute;
        top: 72px;
        left: 0;
        width: 100%;
        display: none;
        flex-direction: column;
        
        background: rgba(25, 25, 25, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .s-item {
        padding: 14px 20px;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.8);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: background 0.2s;
    }
    .s-item:last-child { border-bottom: none; }
    .s-item:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
    }

    /* --- Resize Modal --- */
    #os-resize-panel {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(4px);
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    #os-resize-box {
        width: 300px;
        padding: 24px;
        border-radius: 20px;
        background: rgba(30, 30, 30, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        text-align: center;
    }
    #os-resize-box h3 {
        margin: 0 0 16px;
        color: #fff;
        font-size: 16px;
        font-weight: 500;
    }
    .os-size-btns {
        display: flex;
        gap: 10px;
    }
    .os-size-btns button {
        flex: 1;
        padding: 12px 0;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: #ddd;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
    }
    .os-size-btns button:hover {
        background: rgba(255,255,255,0.15);
        color: #fff;
        border-color: rgba(255,255,255,0.3);
    }
    `;
    document.head.appendChild(style);

    /* ================= HTML STRUCTURE ================= */
    const wrapper = document.createElement("div");
    wrapper.id = "os-search-widget-wrapper";
    
    // Main Widget HTML
    const widgetHTML = `
        <div id="os-search-widget" class="draggable">
            <input id="os-search-input" type="text" placeholder="Search..." autocomplete="off" />
            
            <div id="os-settings-btn" title="Resize Widget">
                <svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.49l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
            </div>

            <div id="os-suggestions"></div>
        </div>

        <div id="os-resize-panel">
            <div id="os-resize-box">
                <h3>Widget Size</h3>
                <div class="os-size-btns">
                    <button data-size="420px">Small</button>
                    <button data-size="650px">Medium</button>
                    <button data-size="900px">Large</button>
                </div>
            </div>
        </div>
    `;
    
    wrapper.innerHTML = widgetHTML;
    document.body.appendChild(wrapper);

    /* ================= ELEMENTS ================= */
    const widget = document.getElementById("os-search-widget");
    const input = document.getElementById("os-search-input");
    const suggestions = document.getElementById("os-suggestions");
    const settingsBtn = document.getElementById("os-settings-btn");
    const resizePanel = document.getElementById("os-resize-panel");

    /* ================= DRAG LOGIC (FIXED) ================= */
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    let hasMoved = false;

    // Helper: Prevent text selection while dragging
    const preventSelect = (e) => e.preventDefault();

    function startDrag(e) {
        // Ignore if clicking input or buttons
        if (e.target === input || e.target.closest('#os-settings-btn')) return;

        isDragging = true;
        hasMoved = false;
        widget.classList.add('dragging');
        
        // Calculate offset based on current position relative to mouse
        // Note: We must handle the initial 'translateX' if it still exists
        const rect = widget.getBoundingClientRect();
        
        // Mouse/Touch position
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        offset.x = clientX - rect.left;
        offset.y = clientY - rect.top;

        // If this is the first drag, we need to unset the CSS transform centering
        // and switch to absolute left/top positioning
        const computedStyle = window.getComputedStyle(widget);
        if (computedStyle.transform !== 'none') {
            widget.style.left = rect.left + 'px';
            widget.style.top = rect.top + 'px';
            widget.style.transform = 'none';
        }

        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        document.addEventListener('selectstart', preventSelect);
    }

    function moveDrag(e) {
        if (!isDragging) return;
        hasMoved = true;
        
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        // Update position
        widget.style.left = (clientX - offset.x) + 'px';
        widget.style.top = (clientY - offset.y) + 'px';
        
        // Prevent scrolling on touch devices while dragging
        if(e.preventDefault) e.preventDefault(); 
    }

    function endDrag() {
        isDragging = false;
        widget.classList.remove('dragging');
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('selectstart', preventSelect);
    }

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, { passive: false });

    /* ================= RESIZE LOGIC (NEW) ================= */
    // Open Panel
    settingsBtn.addEventListener('click', () => {
        if(!hasMoved) resizePanel.style.display = 'flex';
    });

    // Close Panel (Click Outside)
    resizePanel.addEventListener('click', (e) => {
        if (e.target === resizePanel) resizePanel.style.display = 'none';
    });

    // Handle Resize Buttons
    const sizeBtns = resizePanel.querySelectorAll('button');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const newSize = btn.getAttribute('data-size');
            widget.style.maxWidth = newSize;
            resizePanel.style.display = 'none';
        });
    });

    /* ================= SUGGESTIONS LOGIC (SAME AS BEFORE) ================= */
    const quotePools = {
        letters: {
            A: ["Aaj bas thoda better ban ja 💪"],
            B: ["Bas rukna mat 🐢"],
            C: ["Calm rehna bhi ek power hai 🧘‍♂️"]
        },
        numbers: {
            1: ["Ek din ya Day One 🔥"],
            5: ["5 minute ka break bhi magic hai ✨"]
        }
    };

    input.addEventListener("input", () => {
        const v = input.value.trim();
        if (!v) {
            suggestions.style.display = "none";
            return;
        }

        if (/^[a-zA-Z]$/.test(v) || /^[0-9]$/.test(v)) {
            const key = v.toUpperCase();
            const pool = isNaN(key) ? quotePools.letters[key] : quotePools.numbers[key];
            
            if (!pool) return;
            
            suggestions.innerHTML = "";
            pool.slice(0, 2).forEach(q => {
                const d = document.createElement("div");
                d.className = "s-item";
                d.textContent = "✨ " + q;
                d.onclick = () => {
                    input.value = q;
                    suggestions.style.display = "none";
                };
                suggestions.appendChild(d);
            });
            suggestions.style.display = "flex";
        } else {
            suggestions.style.display = "none";
        }
    });

})();
