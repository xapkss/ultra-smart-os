/* FILENAME: addon-apps.js
   PURPOSE: Floating App Dock + Cloud Gallery (Merged)
   VERSION: 2.0 (All-in-One)
*/

(function() {
    // ============================================================
    // ⚙️ CONFIGURATION
    // Agar Google Script ban gaya ho to URL yahan daalo, warna khali rehne do.
    const GALLERY_API_URL = "https://script.google.com/macros/s/AKfycbx2IG-pce6y4tL3jQCR4sCL77ovosDq_t7r0tRUr1v7hgVgr5P4W2V_OZaP_r2b5Qo/exec"; 
    // ============================================================

    // 1. CONFLICT CHECK
    if (document.getElementById('os-app-dock')) return;

    // 2. MERGED CSS (Dock + Gallery)
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- DOCK STYLES --- */
        #os-app-dock {
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            display: flex; align-items: center; gap: 15px; padding: 12px 20px;
            background: rgba(20, 20, 20, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);
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
        .app-icon::after {
            content: attr(data-name); position: absolute; top: -35px;
            background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 6px;
            font-size: 12px; opacity: 0; pointer-events: none; transition: 0.2s; white-space: nowrap;
        }
        .app-icon:hover::after { opacity: 1; top: -45px; }

        .control-btn {
            width: 40px; height: 40px; border-radius: 50%;
            background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 18px; transition: 0.3s; border: 1px dashed rgba(255,255,255,0.3);
        }
        .control-btn:hover { background: white; color: black; rotate: 90deg; }
        .control-btn.remove-mode { border-color: #ff4444; color: #ff4444; }
        .control-btn.remove-mode:hover { background: #ff4444; color: white; rotate: 0deg; }

        .app-svg { width: 28px; height: 28px; fill: currentColor; }
        .yt-color { color: #FF0000; } .ytm-color { color: #fff; } .cloud-color { color: #4285f4; }

        /* --- GALLERY WINDOW STYLES --- */
        #os-gallery-window {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9);
            width: 85%; max-width: 900px; height: 70vh;
            background: rgba(15, 15, 15, 0.95); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px; box-shadow: 0 50px 100px rgba(0,0,0,0.9);
            backdrop-filter: blur(30px); z-index: 2000;
            display: none; flex-direction: column; opacity: 0; transition: 0.3s;
        }
        #os-gallery-window.open { opacity: 1; transform: translate(-50%, -50%) scale(1); }

        .gal-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        .gal-title { font-size: 20px; font-weight: 700; color: white; }
        .gal-close { cursor: pointer; font-size: 24px; color: #ff4444; }
        
        .gal-content { flex: 1; overflow-y: auto; padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
        
        .gal-item { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 9/16; background: #222; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
        .gal-item:hover { transform: translateY(-5px); border-color: #4285f4; }
        .gal-thumb { width: 100%; height: 100%; object-fit: cover; }
        .gal-type { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: white; }
        
        .gal-actions { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.8); padding: 8px; display: flex; gap: 5px; transform: translateY(100%); transition: 0.3s; }
        .gal-item:hover .gal-actions { transform: translateY(0); }
        .g-btn { flex: 1; border: none; padding: 5px; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 700; }
        .btn-apply { background: #4285f4; color: white; } .btn-dl { background: rgba(255,255,255,0.2); color: white; }
        .gal-loader { grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.5); margin-top: 50px; }
    `;
    document.head.appendChild(style);

    // 3. CREATE ELEMENTS
    // Dock Container
    const dock = document.createElement('div');
    dock.id = 'os-app-dock';
    document.body.appendChild(dock);

    // Gallery Window Container
    const win = document.createElement('div');
    win.id = 'os-gallery-window';
    win.innerHTML = `
        <div class="gal-header"><div class="gal-title">☁️ Cloud Gallery</div><div class="gal-close">×</div></div>
        <div class="gal-content" id="gal-grid"><div class="gal-loader">Loading Cloud...</div></div>
    `;
    document.body.appendChild(win);

    // 4. DATA LOGIC (Apps & Dock)
    const DEFAULT_APPS = [
        { name: 'YouTube', url: 'https://www.youtube.com', icon: '<svg class="app-svg yt-color" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
        { name: 'Music', url: 'https://music.youtube.com', icon: '<svg class="app-svg ytm-color" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>' }
    ];

    let userApps = JSON.parse(localStorage.getItem('os_user_apps')) || [];

    // 5. RENDER DOCK
    function renderDock() {
        dock.innerHTML = '';
        
        // A. Default Apps
        DEFAULT_APPS.forEach(app => createIcon(app));

        // B. Cloud Gallery Icon (Special Fixed App)
        const galleryIcon = document.createElement('div');
        galleryIcon.className = 'app-icon';
        galleryIcon.innerHTML = '<svg class="app-svg cloud-color" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>';
        galleryIcon.dataset.name = "Cloud Gallery";
        galleryIcon.onclick = toggleGallery;
        galleryIcon.onmousedown = (e) => e.stopPropagation();
        dock.appendChild(galleryIcon);

        // C. User Apps
        userApps.forEach(app => {
            const el = document.createElement('a');
            el.className = 'app-icon';
            el.href = app.url;
            el.dataset.name = app.name;
            el.innerHTML = `<span style="font-weight:700; color:#fff;">${app.name[0].toUpperCase()}</span>`;
            el.onmousedown = (e) => e.stopPropagation();
            dock.appendChild(el);
        });

        // D. Control Button
        const btn = document.createElement('div');
        btn.className = `control-btn ${userApps.length >= 3 ? 'remove-mode' : ''}`;
        btn.innerHTML = userApps.length >= 3 ? '🗑️' : '＋';
        btn.title = userApps.length >= 3 ? 'Reset Shortcuts' : 'Add Shortcut';
        btn.onclick = userApps.length >= 3 ? resetApps : addApp;
        btn.onmousedown = (e) => e.stopPropagation();
        dock.appendChild(btn);
    }

    function createIcon(app) {
        const el = document.createElement('a');
        el.className = 'app-icon'; el.href = app.url; el.dataset.name = app.name; el.innerHTML = app.icon;
        el.onmousedown = (e) => e.stopPropagation();
        dock.appendChild(el);
    }

    // 6. DOCK ACTIONS
    function addApp() {
        const url = prompt("Website URL:"); if(!url) return;
        const name = prompt("Name:"); if(!name) return;
        userApps.push({name, url: url.startsWith('http')?url:'https://'+url});
        localStorage.setItem('os_user_apps', JSON.stringify(userApps));
        renderDock();
    }
    function resetApps() {
        if(confirm("Clear custom shortcuts?")) {
            userApps = []; localStorage.setItem('os_user_apps', JSON.stringify(userApps)); renderDock();
        }
    }

    // 7. GALLERY LOGIC
    let isGalleryLoaded = false;
    const closeBtn = win.querySelector('.gal-close');
    closeBtn.onclick = toggleGallery;

    function toggleGallery() {
        if (win.style.display === 'flex') {
            win.classList.remove('open'); setTimeout(() => win.style.display = 'none', 300);
        } else {
            win.style.display = 'flex'; setTimeout(() => win.classList.add('open'), 10);
            if (!isGalleryLoaded) loadCloudData();
        }
    }

    async function loadCloudData() {
        const grid = document.getElementById('gal-grid');
        
        if (!GALLERY_API_URL) {
            grid.innerHTML = '<div class="gal-loader">⚠️ API URL Missing.<br>Check addon-apps.js config.</div>';
            return;
        }

        try {
            const res = await fetch(GALLERY_API_URL);
            const data = await res.json();
            isGalleryLoaded = true; grid.innerHTML = '';

            data.forEach(file => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                item.innerHTML = `
                    <img src="${file.url}" class="gal-thumb" loading="lazy">
                    <span class="gal-type">${file.type === 'video' ? '🎥' : '🖼️'}</span>
                    <div class="gal-actions">
                        <button class="g-btn btn-apply">APPLY</button>
                        <button class="g-btn btn-dl">⬇</button>
                    </div>
                `;
                
                // Events
                item.querySelector('.btn-apply').onclick = (e) => {
                    e.stopPropagation();
                    if(window.UltraOS) {
                        UltraOS.setWallpaper(file.url, file.type);
                        localStorage.setItem('os_wallpaper_mode', file.type);
                    }
                };
                item.querySelector('.btn-dl').onclick = (e) => {
                    e.stopPropagation(); window.open(file.downloadUrl, '_blank');
                };
                
                grid.appendChild(item);
            });
        } catch (e) {
            grid.innerHTML = '<div class="gal-loader">❌ Cloud Error<br>Check Internet or API.</div>';
        }
    }

    // 8. DRAG SYSTEM (Dock)
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

    // START
    renderDock();
    if(window.UltraOS) UltraOS.log("Apps & Gallery Loaded");
})();
