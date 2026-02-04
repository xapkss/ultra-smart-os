/* FILENAME: addon-apps.js
   PURPOSE: Master App Dock + Cloud Gallery (Merged & Refined)
   VERSION: 9.0 (4-Grid Layout + Infinity Scroll)
*/

(function() {

    // ============================================================
    // 1. ⚙️ CONFIGURATION
    // ============================================================
    const API_URL = "https://script.google.com/macros/s/AKfycbz01UOWLY2OPvc5-lYzFpRBLajkZ5gxli-yaGxJ4yINdedkc_EZ3-kK66KjO1pAoPWt/exec";

    // Global State
    let userApps = JSON.parse(localStorage.getItem('os_user_apps')) || [];
    let isGalleryLoaded = false;
    let galFiles = [];
    let currentIndex = 0;

    // Conflict Check
    if (document.getElementById('os-app-dock')) return;

    // ============================================================
    // 2. 🎨 MASTER STYLES (Dock + Gallery 4-Grid)
    // ============================================================
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- DOCK STYLES --- */
        #os-app-dock {
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 15px; padding: 12px 20px;
            background: rgba(20, 20, 20, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.4); z-index: 950; cursor: grab;
            transition: width 0.3s ease;
        }
        #os-app-dock:active { cursor: grabbing; scale: 0.98; }

        .app-icon {
            width: 50px; height: 50px; border-radius: 14px;
            background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;
            font-size: 24px; color: white; cursor: pointer; text-decoration: none;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);
            transition: 0.3s; position: relative;
        }
        .app-icon:hover { transform: translateY(-10px) scale(1.1); background: rgba(255,255,255,0.15); z-index: 10; }
        
        /* Tooltip */
        .app-icon::after {
            content: attr(data-name); position: absolute; top: -35px;
            background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 6px;
            font-size: 12px; opacity: 0; pointer-events: none; transition: 0.2s; white-space: nowrap;
        }
        .app-icon:hover::after { opacity: 1; top: -45px; }

        /* Control Button */
        .control-btn {
            width: 40px; height: 40px; border-radius: 50%;
            background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 18px; transition: 0.3s; border: 1px dashed rgba(255,255,255,0.3);
        }
        .control-btn:hover { background: white; color: black; rotate: 90deg; }
        .control-btn.remove-mode { border-color: #ff4444; color: #ff4444; }
        
        .app-svg { width: 28px; height: 28px; fill: currentColor; }
        .yt-color { color: #FF0000; } .ytm-color { color: #fff; } .cloud-color { color: #4285f4; }


        /* --- GALLERY WINDOW STYLES --- */
        #os-gallery-window {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.95);
            width: 95%; max-width: 1000px; height: 85vh;
            background: rgba(10, 10, 10, 0.98); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px; box-shadow: 0 50px 100px rgba(0,0,0,0.9);
            backdrop-filter: blur(40px); z-index: 2000;
            display: none; flex-direction: column; opacity: 0; transition: 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            overflow: hidden;
        }
        #os-gallery-window.open { opacity: 1; transform: translate(-50%, -50%) scale(1); }

        .gal-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
        .gal-title { font-size: 16px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
        .gal-close { cursor: pointer; font-size: 24px; color: #ff5f57; }

        /* --- 4-GRID INFINITY LAYOUT --- */
        .gal-content { 
            flex: 1; overflow-y: auto; padding: 10px; 
            display: grid; 
            /* Desktop: Auto fill */
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); 
            gap: 8px; align-content: start;
        }
        
        /* MOBILE SPECIFIC: FORCE 4 COLUMNS */
        @media (max-width: 600px) {
            .gal-content { 
                grid-template-columns: repeat(4, 1fr); /* 4 Columns Fixed */
                gap: 5px; padding: 8px;
            }
        }

        .gal-item { 
            position: relative; border-radius: 8px; overflow: hidden; 
            aspect-ratio: 9/16; background: #222; cursor: pointer; 
            border: 1px solid rgba(255,255,255,0.05); transition: 0.2s; 
        }
        .gal-item:hover { transform: scale(1.05); z-index: 2; border-color: #4285f4; }
        
        .gal-thumb { width: 100%; height: 100%; object-fit: cover; }
        
        .gal-type { 
            position: absolute; top: 4px; right: 4px; 
            background: rgba(0,0,0,0.6); padding: 2px 4px; border-radius: 3px; 
            font-size: 8px; color: white; font-weight: 700;
        }
        
        /* Actions (Hidden on tiny grid, show on hover/longpress) */
        .gal-actions { 
            position: absolute; bottom: 0; left: 0; width: 100%; 
            background: rgba(0,0,0,0.9); padding: 4px; 
            display: flex; gap: 2px; transform: translateY(100%); transition: 0.2s; 
        }
        .gal-item:hover .gal-actions { transform: translateY(0); }
        
        .g-btn { 
            flex: 1; border: none; padding: 4px; border-radius: 4px; 
            font-size: 9px; cursor: pointer; font-weight: 700; color: white;
        }
        .btn-apply { background: #4285f4; } 
        .btn-dl { background: rgba(255,255,255,0.2); }
        
        .gal-loader { grid-column: 1 / -1; text-align: center; color: #666; margin-top: 50px; font-size: 12px; }


        /* --- PREVIEW MODAL --- */
        #gal-preview {
            position: fixed; inset: 0; background: rgba(0,0,0,0.95);
            z-index: 3000; display: none; flex-direction: column;
            align-items: center; justify-content: center;
        }
        #gal-preview.open { display: flex; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }

        .gal-preview-media { width: 100%; height: 80%; display: flex; align-items: center; justify-content: center; }
        .gal-preview-media img, .gal-preview-media video { max-width: 100%; max-height: 100%; object-fit: contain; }
        
        .gal-preview-actions { margin-top: 20px; display: flex; gap: 15px; }
        .p-btn { padding: 8px 20px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; color: white; font-size: 13px; }
        .p-apply { background: #4285f4; } 
        .p-dl { background: rgba(255,255,255,0.2); }
        .p-close { background: #333; }
    `;
    document.head.appendChild(style);


    // ============================================================
    // 3. UI GENERATION (Dock + Gallery + Preview)
    // ============================================================
    
    // A. DOCK
    const dock = document.createElement('div');
    dock.id = 'os-app-dock';
    document.body.appendChild(dock);

    // B. GALLERY WINDOW
    const win = document.createElement('div');
    win.id = 'os-gallery-window';
    win.innerHTML = `
        <div class="gal-header"><div class="gal-title">☁️ Cloud Gallery</div><div class="gal-close" id="gal-close-btn">×</div></div>
        <div class="gal-content" id="gal-grid"><div class="gal-loader">Connecting...</div></div>
    `;
    document.body.appendChild(win);

    // C. PREVIEW MODAL
    const preview = document.createElement('div');
    preview.id = 'gal-preview';
    preview.innerHTML = `
        <div class="gal-preview-media" id="gal-preview-media"></div>
        <div class="gal-preview-actions">
            <button class="p-btn p-apply">APPLY</button>
            <button class="p-btn p-dl">⬇</button>
            <button class="p-btn p-close">CLOSE</button>
        </div>
    `;
    document.body.appendChild(preview);


    // ============================================================
    // 4. DOCK LOGIC
    // ============================================================
    const DEFAULT_APPS = [
        { name: 'YouTube', url: 'https://www.youtube.com', icon: '<svg class="app-svg yt-color" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
        { name: 'Music', url: 'https://music.youtube.com', icon: '<svg class="app-svg ytm-color" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>' }
    ];

    function renderDock() {
        dock.innerHTML = '';

        // 1. Default Apps
        DEFAULT_APPS.forEach(app => {
            const el = document.createElement('a');
            el.className = 'app-icon'; el.href = app.url; el.dataset.name = app.name; el.innerHTML = app.icon;
            el.onmousedown = (e) => e.stopPropagation();
            dock.appendChild(el);
        });

        // 2. CLOUD GALLERY ICON (Integrated)
        const galIcon = document.createElement('div');
        galIcon.className = 'app-icon';
        galIcon.innerHTML = '<svg class="app-svg cloud-color" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>';
        galIcon.dataset.name = "Cloud Gallery";
        galIcon.onclick = toggleGallery;
        galIcon.onmousedown = (e) => e.stopPropagation();
        // Insert Cloud Icon immediately after default apps
        dock.appendChild(galIcon);

        // 3. User Apps
        userApps.forEach(app => {
            const el = document.createElement('a');
            el.className = 'app-icon'; el.href = app.url; el.dataset.name = app.name;
            el.innerHTML = `<span style="font-weight:700; color:#fff;">${app.name[0].toUpperCase()}</span>`;
            el.onmousedown = (e) => e.stopPropagation();
            dock.appendChild(el);
        });

        // 4. Add/Remove Button
        const btn = document.createElement('div');
        btn.className = `control-btn ${userApps.length >= 4 ? 'remove-mode' : ''}`;
        btn.innerHTML = userApps.length >= 4 ? '🗑️' : '＋';
        btn.onclick = userApps.length >= 4 ? resetUserApps : addUserApp;
        btn.onmousedown = (e) => e.stopPropagation();
        dock.appendChild(btn);
    }

    function addUserApp() {
        const url = prompt("Website URL:"); if(!url) return;
        const name = prompt("Name:"); if(!name) return;
        userApps.push({ name: name, url: url.startsWith('http')?url:'https://'+url });
        localStorage.setItem('os_user_apps', JSON.stringify(userApps));
        renderDock();
    }

    function resetUserApps() {
        if(confirm("Clear custom shortcuts?")) {
            userApps = []; localStorage.setItem('os_user_apps', JSON.stringify(userApps)); renderDock();
        }
    }

    // ============================================================
    // 5. GALLERY LOGIC (API + 4-Grid)
    // ============================================================
    document.getElementById('gal-close-btn').onclick = toggleGallery;

    function toggleGallery() {
        if (win.style.display === 'flex') {
            win.classList.remove('open'); setTimeout(() => win.style.display = 'none', 300);
        } else {
            win.style.display = 'flex'; setTimeout(() => win.classList.add('open'), 10);
            if (!isDataLoaded) loadDriveData();
        }
    }

    async function loadDriveData() {
        const grid = document.getElementById('gal-grid');
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            galFiles = data; isDataLoaded = true; grid.innerHTML = '';

            data.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                
                // Thumbnail logic
                item.innerHTML = `
                    <img src="${file.url}" class="gal-thumb" loading="lazy">
                    <span class="gal-type">${file.type === 'video' ? 'VIDEO' : 'IMG'}</span>
                    <div class="gal-actions">
                        <button class="g-btn btn-apply">USE</button>
                        <button class="g-btn btn-dl">⬇</button>
                    </div>
                `;

                // Actions
                item.querySelector('.btn-apply').onclick = (e) => { e.stopPropagation(); applyWallpaper(file); };
                item.querySelector('.btn-dl').onclick = (e) => { e.stopPropagation(); window.open(file.downloadUrl, '_blank'); };
                item.onclick = () => openPreview(file, index);
                
                grid.appendChild(item);
            });
        } catch (e) {
            grid.innerHTML = '<div class="gal-loader">Check API or Internet.</div>';
        }
    }

    function applyWallpaper(file) {
        if (window.UltraOS) {
            UltraOS.setWallpaper(file.url, file.type);
            localStorage.setItem('os_wallpaper_mode', file.type);
            
            // Force Toast to Top
            const t = document.getElementById('toast');
            if(t) { t.style.bottom='auto'; t.style.top='30px'; t.style.background='rgba(66, 133, 244, 0.9)'; UltraOS.notify("✅ Applied!"); }
        }
    }

    // ============================================================
    // 6. PREVIEW LOGIC
    // ============================================================
    function openPreview(file, index) {
        currentIndex = index;
        const c = document.getElementById('gal-preview-media');
        c.innerHTML = (file.type === 'video') 
            ? `<video src="${file.url}" autoplay controls loop playsinline></video>` 
            : `<img src="${file.url}">`;
        
        preview.classList.add('open');
        
        preview.querySelector('.p-apply').onclick = () => { applyWallpaper(file); closePreview(); };
        preview.querySelector('.p-dl').onclick = () => window.open(file.downloadUrl, '_blank');
        preview.querySelector('.p-close').onclick = closePreview;
    }

    function closePreview() {
        const v = document.querySelector('#gal-preview-media video');
        if(v) { v.pause(); v.src = ""; }
        preview.classList.remove('open');
    }

    // ============================================================
    // 7. DRAG LOGIC (Dock)
    // ============================================================
    const savedPos = localStorage.getItem('os_dock_pos');
    if (savedPos) { const p = JSON.parse(savedPos); dock.style.left=p.l; dock.style.top=p.t; dock.style.bottom='auto'; dock.style.transform='none'; }
    
    let isDrag=false, startX, startY, initL, initT;
    dock.addEventListener('mousedown', start); dock.addEventListener('touchstart', start, {passive:false});
    
    function start(e) {
        if(e.target.closest('.app-icon') || e.target.closest('.control-btn')) return;
        isDrag=true; const c=e.touches?e.touches[0]:e; startX=c.clientX; startY=c.clientY;
        const r=dock.getBoundingClientRect(); initL=r.left; initT=r.top;
        dock.style.transform='none'; dock.style.bottom='auto'; dock.style.left=initL+'px'; dock.style.top=initT+'px';
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, {passive:false});
        document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    }
    function move(e) {
        if(!isDrag)return; e.preventDefault(); const c=e.touches?e.touches[0]:e;
        dock.style.left=(initL+(c.clientX-startX))+'px'; dock.style.top=(initT+(c.clientY-startY))+'px';
    }
    function end() {
        if(!isDrag)return; isDrag=false;
        document.removeEventListener('mousemove', move); document.removeEventListener('touchmove', move);
        localStorage.setItem('os_dock_pos', JSON.stringify({t:dock.style.top, l:dock.style.left}));
    }

    // INIT
    renderDock();

})();
