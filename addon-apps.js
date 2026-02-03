/* FILENAME: addon-apps.js
   PURPOSE: Floating App Dock (Draggable + Customizable)
   VERSION: 1.0 (Ultra Dock)
*/

(function() {
    // 1. Conflict Check
    if (document.getElementById('os-app-dock')) return;

    // 2. ULTRA DOCK CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #os-app-dock {
            position: fixed;
            bottom: 30px; left: 50%;
            transform: translateX(-50%);
            display: flex; align-items: center; gap: 15px;
            padding: 12px 20px;
            background: rgba(20, 20, 20, 0.4); /* Semi-transparent Dock */
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            z-index: 950; /* Search bar ke neeche */
            cursor: grab;
            transition: width 0.3s ease, transform 0.1s;
        }
        #os-app-dock:active { cursor: grabbing; scale: 0.98; }

        /* App Icons */
        .app-icon {
            width: 50px; height: 50px;
            border-radius: 14px;
            background: rgba(255,255,255,0.05);
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; color: white;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.05);
            text-decoration: none;
        }
        
        /* Hover Effect (Pop-up) */
        .app-icon:hover {
            transform: translateY(-10px) scale(1.1);
            background: rgba(255,255,255,0.15);
            box-shadow: 0 10px 20px rgba(0,0,0,0.4);
            border-color: rgba(255,255,255,0.3);
            z-index: 10;
        }

        /* App Label (Tooltip) */
        .app-icon::after {
            content: attr(data-name);
            position: absolute; top: -30px;
            background: rgba(0,0,0,0.8); color: white;
            padding: 4px 8px; border-radius: 6px;
            font-size: 12px; opacity: 0;
            pointer-events: none; transition: 0.2s;
            white-space: nowrap;
        }
        .app-icon:hover::after { opacity: 1; top: -40px; }

        /* Control Button (Add/Remove) */
        .control-btn {
            width: 40px; height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 18px;
            transition: 0.3s;
            border: 1px dashed rgba(255,255,255,0.3);
        }
        .control-btn:hover { background: white; color: black; border-color: white; rotate: 90deg; }
        .control-btn.remove-mode { border-color: #ff4444; color: #ff4444; }
        .control-btn.remove-mode:hover { background: #ff4444; color: white; rotate: 0deg; }

        /* SVGs */
        .app-svg { width: 28px; height: 28px; fill: currentColor; }
        .yt-color { color: #FF0000; }
        .ytm-color { color: #fff; }
    `;
    document.head.appendChild(style);

    // 3. DATA ENGINE
    const DEFAULT_APPS = [
        { name: 'YouTube', url: 'https://www.youtube.com', icon: '<svg class="app-svg yt-color" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
        { name: 'YT Music', url: 'https://music.youtube.com', icon: '<svg class="app-svg ytm-color" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>' }
    ];

    // Load User Apps from Storage
    let userApps = JSON.parse(localStorage.getItem('os_user_apps')) || [];

    // 4. RENDER ENGINE
    const dock = document.createElement('div');
    dock.id = 'os-app-dock';
    document.body.appendChild(dock);

    function renderDock() {
        dock.innerHTML = '';

        // A. Render Default Apps (Locked)
        DEFAULT_APPS.forEach(app => {
            const el = document.createElement('a');
            el.className = 'app-icon';
            el.href = app.url;
            el.dataset.name = app.name;
            el.innerHTML = app.icon;
            // Prevent drag when clicking link
            el.addEventListener('mousedown', (e) => e.stopPropagation()); 
            dock.appendChild(el);
        });

        // B. Render User Apps
        userApps.forEach(app => {
            const el = document.createElement('a');
            el.className = 'app-icon';
            el.href = app.url;
            el.dataset.name = app.name;
            // First letter as Icon
            el.innerHTML = `<span style="font-weight:700; color:#4285f4;">${app.name[0].toUpperCase()}</span>`;
            el.addEventListener('mousedown', (e) => e.stopPropagation());
            dock.appendChild(el);
        });

        // C. Render Control Button (The 5th Element)
        const totalApps = DEFAULT_APPS.length + userApps.length;
        const controlBtn = document.createElement('div');
        controlBtn.className = 'control-btn';

        if (totalApps < 4) {
            // Mode: ADD (+)
            controlBtn.innerHTML = '＋';
            controlBtn.onclick = addUserApp;
            controlBtn.title = "Add Shortcut";
        } else {
            // Mode: REMOVE/RESET (🗑️)
            controlBtn.innerHTML = '🗑️';
            controlBtn.className += ' remove-mode';
            controlBtn.onclick = resetUserApps;
            controlBtn.title = "Clear Custom Apps";
        }
        
        // Prevent drag on control button
        controlBtn.addEventListener('mousedown', (e) => e.stopPropagation());
        dock.appendChild(controlBtn);
    }

    // 5. LOGIC FUNCTIONS
    function addUserApp() {
        const url = prompt("Enter Website URL (e.g., instagram.com):");
        if (!url) return;
        
        let finalUrl = url.startsWith('http') ? url : `https://${url}`;
        let name = prompt("Enter Name (Short):", "App");
        if (!name) name = "App";

        userApps.push({ name: name, url: finalUrl });
        saveApps();
        renderDock();
    }

    function resetUserApps() {
        if(confirm("Remove all custom shortcuts?")) {
            userApps = [];
            saveApps();
            renderDock();
        }
    }

    function saveApps() {
        localStorage.setItem('os_user_apps', JSON.stringify(userApps));
    }

    // 6. DRAG & DROP LOGIC (Floating Dock)
    const savedPos = localStorage.getItem('os_dock_pos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        dock.style.bottom = 'auto'; // Disable default bottom
        dock.style.top = pos.top;
        dock.style.left = pos.left;
        dock.style.transform = 'none';
    }

    let isDragging = false, startX, startY, initialLeft, initialTop;

    dock.addEventListener('mousedown', startDrag);
    dock.addEventListener('touchstart', startDrag, {passive: false});

    function startDrag(e) {
        if(e.target.closest('.app-icon') || e.target.closest('.control-btn')) return;

        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        startX = clientX; startY = clientY;
        
        const rect = dock.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;

        dock.style.transform = 'none';
        dock.style.bottom = 'auto';
        dock.style.left = initialLeft + 'px';
        dock.style.top = initialTop + 'px';

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
        dock.style.left = `${initialLeft + (clientX - startX)}px`;
        dock.style.top = `${initialTop + (clientY - startY)}px`;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        localStorage.setItem('os_dock_pos', JSON.stringify({ top: dock.style.top, left: dock.style.left }));
    }

    // Initialize
    renderDock();
    if(window.UltraOS) UltraOS.log("Ultra Dock Loaded");

})();
