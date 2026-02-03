/* FILENAME: addon-menu.js
   PURPOSE: Custom Hacker Context Menu (Right-Click)
*/

(function() {
    // 1. DISABLE DEFAULT MENU
    document.addEventListener('contextmenu', event => event.preventDefault());

    // 2. STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        #os-context-menu {
            position: fixed; z-index: 10000;
            width: 220px;
            background: rgba(10, 10, 10, 0.9);
            border: 1px solid rgba(66, 133, 244, 0.3);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            backdrop-filter: blur(15px);
            display: none; flex-direction: column; padding: 6px;
            animation: menuFade 0.2s ease;
        }
        @keyframes menuFade { from {opacity:0; transform:scale(0.95);} to {opacity:1; transform:scale(1);} }
        
        .ctx-item {
            padding: 10px 15px;
            color: rgba(255,255,255,0.8);
            font-size: 14px; font-family: 'Segoe UI', sans-serif;
            cursor: pointer; border-radius: 8px;
            display: flex; align-items: center; gap: 12px;
            transition: 0.2s;
        }
        .ctx-item:hover { background: rgba(66, 133, 244, 0.2); color: white; padding-left: 20px; }
        .ctx-line { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }
        .ctx-icon { width: 16px; text-align: center; }
    `;
    document.head.appendChild(style);

    // 3. UI STRUCTURE
    const menu = document.createElement('div');
    menu.id = 'os-context-menu';
    menu.innerHTML = `
        <div class="ctx-item" id="ctx-refresh"><span class="ctx-icon">🔄</span> Refresh System</div>
        <div class="ctx-item" id="ctx-gallery"><span class="ctx-icon">☁️</span> Cloud Gallery</div>
        <div class="ctx-line"></div>
        <div class="ctx-item" id="ctx-full"><span class="ctx-icon">📺</span> Fullscreen Mode</div>
        <div class="ctx-item" id="ctx-info"><span class="ctx-icon">ℹ️</span> System Info</div>
        <div class="ctx-line"></div>
        <div class="ctx-item" id="ctx-code"><span class="ctx-icon">👨‍💻</span> Developer</div>
    `;
    document.body.appendChild(menu);

    // 4. LOGIC ENGINE
    // Show Menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        
        // Prevent overflow
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        menu.style.left = (x + 220 > winW) ? (x - 220) + 'px' : x + 'px';
        menu.style.top = (y + 200 > winH) ? (y - 200) + 'px' : y + 'px';
        
        menu.style.display = 'flex';
    });

    // Hide Menu (Click anywhere)
    document.addEventListener('click', () => menu.style.display = 'none');

    // ACTIONS
    document.getElementById('ctx-refresh').onclick = () => location.reload();
    
    document.getElementById('ctx-gallery').onclick = () => {
        const icon = document.getElementById('icon-gallery');
        if(icon) icon.click(); // Trigger existing gallery click
    };

    document.getElementById('ctx-full').onclick = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    };

    document.getElementById('ctx-info').onclick = () => {
        alert("ULTRA SMART OS v2.0\nRunning on: " + navigator.platform + "\nStatus: Online 🟢");
    };

    document.getElementById('ctx-code').onclick = () => {
        window.open('https://github.com/xapkss', '_blank');
    };

})();
