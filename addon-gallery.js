/* FILENAME: addon-apps.js
   PURPOSE: Cloud Gallery (Thumbnails Restored + Pro Features)
   VERSION: 4.1 (Video Fix)
*/

(function () {

    // ============================================================
    // ⚙️ CONFIGURATION
    // (Aapka latest working URL yahan daal diya hai)
    const API_URL = "https://script.google.com/macros/s/AKfycbzlXpSODBBo4liswfv6N3KPRDN6W7eXjpjm1UrGNYOZ9TD-YXWtL8hToRZK5WExFx8F/exec";
    // ============================================================

    let isDataLoaded = false;
    let galFiles = [];
    let currentIndex = 0;

    // 1. DOCK ICON CHECK
    const dock = document.getElementById('os-app-dock');
    if (dock && !document.getElementById('icon-gallery')) {
        const icon = document.createElement('div');
        icon.id = 'icon-gallery';
        icon.className = 'app-icon';
        icon.innerHTML = '☁️';
        icon.title = "Cloud Gallery";
        icon.style.cursor = "pointer";
        if(dock.lastElementChild) dock.insertBefore(icon, dock.lastElementChild);
        else dock.appendChild(icon);
        
        icon.onclick = toggleGallery;
        icon.onmousedown = (e) => e.stopPropagation();
    }

    // 2. PRO CSS STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        /* WINDOW */
        #os-gallery-window {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
            width: 90%; max-width: 1000px; height: 80vh;
            background: rgba(18, 18, 18, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8);
            backdrop-filter: blur(40px);
            z-index: 2000; display: none; flex-direction: column;
            opacity: 0; transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            overflow: hidden;
        }
        #os-gallery-window.open { opacity: 1; transform: translate(-50%, -50%) scale(1); }

        /* HEADER */
        .gal-header {
            padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);
        }
        .gal-title { font-size: 18px; font-weight: 700; color: #fff; }
        .gal-close { font-size: 28px; color: #ff5f57; cursor: pointer; line-height: 1; }

        /* GRID (2 Columns on Mobile) */
        .gal-content {
            flex: 1; overflow-y: auto; padding: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px; align-content: start;
        }
        @media (max-width: 600px) {
            .gal-content { grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; }
        }

        /* ITEMS */
        .gal-item {
            position: relative; border-radius: 12px; overflow: hidden;
            aspect-ratio: 9/16; background: #2a2a2a;
            cursor: pointer; border: 1px solid rgba(255,255,255,0.05);
        }
        
        /* THUMBNAILS (Restored Logic) */
        .gal-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        
        /* VIDEO BADGE */
        .gal-type {
            position: absolute; top: 8px; right: 8px;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            padding: 3px 6px; border-radius: 4px; font-size: 9px; color: white; font-weight: 700;
        }

        /* ACTIONS */
        .gal-actions {
            position: absolute; bottom: 0; left: 0; width: 100%;
            padding: 8px; display: flex; gap: 6px;
            background: linear-gradient(transparent, rgba(0,0,0,0.95));
            transform: translateY(100%); transition: 0.2s;
        }
        .gal-item:hover .gal-actions { transform: translateY(0); }
        
        .g-btn {
            flex: 1; border: none; padding: 8px; border-radius: 6px;
            font-size: 10px; font-weight: 700; cursor: pointer; text-transform: uppercase;
        }
        .btn-apply { background: #4285f4; color: white; }
        .btn-dl { background: rgba(255,255,255,0.15); color: white; }

        /* PREVIEW */
        #gal-preview {
            position: fixed; inset: 0; background: rgba(0,0,0,0.95);
            z-index: 3000; display: none; flex-direction: column;
            align-items: center; justify-content: center;
        }
        #gal-preview.open { display: flex; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }

        .gal-preview-media {
            width: 100%; height: 80%; display: flex; align-items: center; justify-content: center;
        }
        .gal-preview-media img, .gal-preview-media video {
            max-width: 100%; max-height: 100%; object-fit: contain;
        }
        .gal-preview-actions { margin-top: 20px; display: flex; gap: 15px; }
        .p-btn { padding: 10px 20px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; color: white; }
        .p-apply { background: #4285f4; } .p-close { background: #333; }
        .gal-loader { color: #888; text-align: center; margin-top: 50px; grid-column: 1 / -1; }
    `;
    document.head.appendChild(style);

    // 3. HTML STRUCTURE
    const win = document.createElement('div');
    win.id = 'os-gallery-window';
    win.innerHTML = `
        <div class="gal-header"><div class="gal-title">☁️ Cloud Gallery</div><div class="gal-close" id="gal-close-btn">×</div></div>
        <div class="gal-content" id="gal-grid"><div class="gal-loader">Loading...</div></div>
    `;
    document.body.appendChild(win);

    const preview = document.createElement('div');
    preview.id = 'gal-preview';
    preview.innerHTML = `
        <div class="gal-preview-media" id="gal-preview-media"></div>
        <div class="gal-preview-actions">
            <button class="p-btn p-apply">✨ APPLY</button>
            <button class="p-btn p-close">CLOSE</button>
        </div>
    `;
    document.body.appendChild(preview);

    // 4. LOGIC ENGINE
    function toggleGallery() {
        if (win.style.display === 'flex') {
            win.classList.remove('open'); setTimeout(() => win.style.display = 'none', 300);
        } else {
            win.style.display = 'flex'; setTimeout(() => win.classList.add('open'), 10);
            if (!isDataLoaded) loadDriveData();
        }
    }
    document.getElementById('gal-close-btn').onclick = toggleGallery;

    async function loadDriveData() {
        const grid = document.getElementById('gal-grid');
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            galFiles = data; isDataLoaded = true; grid.innerHTML = '';

            data.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                
                // ✅ THUMBNAIL LOGIC RESTORED (Image Tag for Videos too)
                // Kyunki aapki API thumbnail URL bhej rahi hai
                item.innerHTML = `
                    <img src="${file.url}" class="gal-thumb" loading="lazy">
                    <span class="gal-type">${file.type === 'video' ? '🎥' : '🖼️'}</span>
                    <div class="gal-actions">
                        <button class="g-btn btn-apply">APPLY</button>
                        <button class="g-btn btn-dl">⬇</button>
                    </div>
                `;

                // ACTIONS
                item.querySelector('.btn-apply').onclick = (e) => {
                    e.stopPropagation(); applyWallpaper(file);
                };
                item.querySelector('.btn-dl').onclick = (e) => {
                    e.stopPropagation(); window.open(file.downloadUrl, '_blank');
                };
                item.onclick = () => openPreview(file, index);
                
                grid.appendChild(item);
            });
        } catch (e) {
            grid.innerHTML = '<div class="gal-loader">Check API URL or Internet</div>';
        }
    }

    // 5. APPLY WITH TOP TOAST
    function applyWallpaper(file) {
        if (window.UltraOS) {
            UltraOS.setWallpaper(file.url, file.type);
            localStorage.setItem('os_wallpaper_mode', file.type);
            
            // Force Toast to Top
            const t = document.getElementById('toast');
            if(t) {
                t.style.bottom='auto'; t.style.top='30px'; 
                t.style.background='rgba(66, 133, 244, 0.9)';
                UltraOS.notify("✅ Wallpaper Applied!");
            }
        }
    }

    // 6. PREVIEW ENGINE
    function openPreview(file, index) {
        currentIndex = index;
        const c = document.getElementById('gal-preview-media');
        
        if (file.type === 'video') {
            c.innerHTML = `<video src="${file.url}" autoplay controls loop playsinline></video>`;
        } else {
            c.innerHTML = `<img src="${file.url}">`;
        }
        preview.classList.add('open');
        preview.querySelector('.p-apply').onclick = () => { applyWallpaper(file); closePreview(); };
        preview.querySelector('.p-close').onclick = closePreview;
    }

    function closePreview() {
        const v = document.querySelector('#gal-preview-media video');
        if(v) { v.pause(); v.src = ""; }
        preview.classList.remove('open');
    }

})();
