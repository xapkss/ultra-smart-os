/* FILENAME: addon-gallery.js
   PURPOSE: Cloud Gallery connected to Google Drive (Pro Grid + Video Fix)
   VERSION: 3.0 (Pro Remake)
*/

(function () {

    // ============================================================
    // ⚙️ CONFIGURATION
    const API_URL = "https://script.google.com/macros/s/AKfycbzlXpSODBBo4liswfv6N3KPRDN6W7eXjpjm1UrGNYOZ9TD-YXWtL8hToRZK5WExFx8F/exec";
    // ============================================================

    let isDataLoaded = false;
    let galFiles = [];
    let currentIndex = 0;

    // 1. DOCK ICON (Safe Check)
    const dock = document.getElementById('os-app-dock');
    if (dock && !document.getElementById('icon-gallery')) {
        const icon = document.createElement('div');
        icon.id = 'icon-gallery';
        icon.className = 'app-icon';
        icon.innerHTML = '☁️';
        icon.title = "Cloud Gallery";
        icon.style.cursor = "pointer";
        // Insert before the last element (usually the add/remove button)
        if(dock.lastElementChild) dock.insertBefore(icon, dock.lastElementChild);
        else dock.appendChild(icon);
        
        icon.onclick = toggleGallery;
        icon.onmousedown = (e) => e.stopPropagation();
    }

    // 2. PRO STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        /* WINDOW */
        #os-gallery-window {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
            width: 90%; max-width: 1000px; height: 80vh;
            background: rgba(18, 18, 18, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            box-shadow: 0 40px 80px rgba(0,0,0,0.8);
            backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
            z-index: 2000; display: none; flex-direction: column;
            opacity: 0; transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            overflow: hidden;
        }
        #os-gallery-window.open { opacity: 1; transform: translate(-50%, -50%) scale(1); }

        /* HEADER */
        .gal-header {
            padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex; justify-content: space-between; align-items: center;
        }
        .gal-title { font-size: 20px; font-weight: 700; color: white; display: flex; gap: 10px; align-items: center; }
        .gal-close { font-size: 26px; color: #ff5f57; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 95, 87, 0.1); }
        .gal-close:hover { background: #ff5f57; color: white; }

        /* PRO GRID (Double Set) */
        .gal-content {
            flex: 1; overflow-y: auto; padding: 20px;
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
            gap: 12px;
            align-content: start;
        }
        /* Mobile adjustment for grid */
        @media (max-width: 600px) {
            .gal-content { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 15px; }
        }

        /* ITEMS */
        .gal-item {
            position: relative; border-radius: 16px; overflow: hidden;
            aspect-ratio: 9/16; background: #1a1a1a;
            cursor: pointer; transition: transform 0.2s;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .gal-item:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.2); }
        .gal-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        
        .gal-type {
            position: absolute; top: 8px; right: 8px;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
            padding: 4px 8px; border-radius: 6px; font-size: 10px; color: white; font-weight: 600; letter-spacing: 0.5px;
        }

        /* HOVER ACTIONS */
        .gal-actions {
            position: absolute; bottom: 0; left: 0; width: 100%;
            padding: 12px; display: flex; gap: 8px;
            background: linear-gradient(transparent, rgba(0,0,0,0.9));
            transform: translateY(100%); transition: 0.25s ease;
        }
        .gal-item:hover .gal-actions { transform: translateY(0); }
        /* Always show actions on touch devices if needed, but tap opens preview usually */
        
        .g-btn {
            flex: 1; border: none; padding: 8px; border-radius: 8px;
            font-size: 11px; font-weight: 700; cursor: pointer;
            transition: 0.2s; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .btn-apply { background: #4285f4; color: white; }
        .btn-apply:hover { background: #5294ff; }
        .btn-dl { background: rgba(255,255,255,0.15); color: white; backdrop-filter: blur(5px); }
        .btn-dl:hover { background: rgba(255,255,255,0.25); }

        .gal-loader { color: rgba(255,255,255,0.5); text-align: center; padding: 50px; font-size: 14px; grid-column: 1 / -1; }

        /* PREVIEW MODAL */
        #gal-preview {
            position: fixed; inset: 0; background: rgba(0,0,0,0.9);
            backdrop-filter: blur(25px); z-index: 3000;
            display: none; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s;
        }
        #gal-preview.open { display: flex; opacity: 1; }
        
        .gal-preview-box {
            width: 95%; max-width: 500px; height: 85vh;
            background: #000; border-radius: 20px; overflow: hidden;
            display: flex; flex-direction: column;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.1);
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn { from { transform: scale(0.9); } to { transform: scale(1); } }

        .gal-preview-media {
            flex: 1; display: flex; align-items: center; justify-content: center;
            background: #000; position: relative;
        }
        .gal-preview-media img, .gal-preview-media video {
            max-width: 100%; max-height: 100%; object-fit: contain;
        }
        
        .gal-preview-actions {
            padding: 15px 20px; background: #121212; border-top: 1px solid rgba(255,255,255,0.05);
            display: flex; gap: 10px;
        }
        .gal-preview-actions button {
            flex: 1; padding: 12px; border: none; border-radius: 12px;
            font-weight: 700; cursor: pointer; font-size: 13px;
        }
        .p-apply { background: #4285f4; color: white; }
        .p-dl { background: #333; color: white; }
        .p-close { background: #ff4444; color: white; max-width: 50px; }
    `;
    document.head.appendChild(style);

    // 3. UI STRUCTURE
    const win = document.createElement('div');
    win.id = 'os-gallery-window';
    win.innerHTML = `
        <div class="gal-header">
            <div class="gal-title">☁️ Cloud Gallery</div>
            <div class="gal-close" id="gal-close-btn">×</div>
        </div>
        <div class="gal-content" id="gal-grid">
            <div class="gal-loader">Connecting to Google Drive...</div>
        </div>
    `;
    document.body.appendChild(win);

    const preview = document.createElement('div');
    preview.id = 'gal-preview';
    preview.innerHTML = `
        <div class="gal-preview-box">
            <div class="gal-preview-media" id="gal-preview-media"></div>
            <div class="gal-preview-actions">
                <button class="p-apply">APPLY WALLPAPER</button>
                <button class="p-dl">⬇</button>
                <button class="p-close">×</button>
            </div>
        </div>
    `;
    document.body.appendChild(preview);

    // 4. LOGIC ENGINE
    function toggleGallery() {
        if (win.style.display === 'flex') {
            win.classList.remove('open');
            setTimeout(() => win.style.display = 'none', 300);
        } else {
            win.style.display = 'flex';
            setTimeout(() => win.classList.add('open'), 10);
            if (!isDataLoaded) loadDriveData();
        }
    }
    document.getElementById('gal-close-btn').onclick = toggleGallery;

    async function loadDriveData() {
        const grid = document.getElementById('gal-grid');
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            
            galFiles = data;
            isDataLoaded = true;
            grid.innerHTML = '';

            if(data.length === 0) {
                grid.innerHTML = '<div class="gal-loader">Folder is empty.</div>';
                return;
            }

            data.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                
                // For video thumbnail, we just use the url (browser tries to fetch frame) 
                // or a generic icon if that fails. Here relying on img tag for simple files.
                // If it's a video, the img tag might not work well for Drive links without Auth.
                // Pro Fix: Use video tag for thumbnail if video, but muted and paused.
                let mediaHtml = '';
                if(file.type === 'video') {
                    mediaHtml = `<video src="${file.url}#t=1" class="gal-thumb" preload="metadata" muted></video>`;
                } else {
                    mediaHtml = `<img src="${file.url}" class="gal-thumb" loading="lazy">`;
                }

                item.innerHTML = `
                    ${mediaHtml}
                    <span class="gal-type">${file.type === 'video' ? 'VIDEO' : 'IMG'}</span>
                    <div class="gal-actions">
                        <button class="g-btn btn-apply">APPLY</button>
                        <button class="g-btn btn-dl">⬇</button>
                    </div>
                `;

                // QUICK ACTIONS
                item.querySelector('.btn-apply').onclick = (e) => {
                    e.stopPropagation();
                    applyWallpaper(file);
                };
                item.querySelector('.btn-dl').onclick = (e) => {
                    e.stopPropagation();
                    window.open(file.downloadUrl, '_blank');
                };

                // OPEN PREVIEW
                item.onclick = () => openPreview(file, index);
                
                grid.appendChild(item);
            });

        } catch (e) {
            console.error(e);
            grid.innerHTML = '<div class="gal-loader" style="color:#ff5f57">Failed to connect.<br>Check internet or API URL.</div>';
        }
    }

    // 5. WALLPAPER APPLY LOGIC (With Toast)
    function applyWallpaper(file) {
        if (window.UltraOS) {
            UltraOS.setWallpaper(file.url, file.type);
            // Save to LocalStorage for persistence
            localStorage.setItem('os_wallpaper_mode', file.type);
            
            // Show Notification
            // Check if notify exists, else standard alert
            if(UltraOS.notify) {
                UltraOS.notify("Wallpaper Applied Successfully! 🎨");
            } else {
                alert("Wallpaper Applied!");
            }
        }
    }

    // 6. PREVIEW ENGINE
    function openPreview(file, index) {
        currentIndex = index;
        const container = document.getElementById('gal-preview-media');
        
        // Video Logic Fix: Autoplay with Controls
        if (file.type === 'video') {
            container.innerHTML = `<video src="${file.url}" autoplay controls loop style="width:100%; height:100%;"></video>`;
        } else {
            container.innerHTML = `<img src="${file.url}">`;
        }

        preview.classList.add('open');

        // Buttons
        preview.querySelector('.p-apply').onclick = () => applyWallpaper(file);
        preview.querySelector('.p-dl').onclick = () => window.open(file.downloadUrl, '_blank');
        preview.querySelector('.p-close').onclick = closePreview;
    }

    function closePreview() {
        const v = document.querySelector('#gal-preview-media video');
        if(v) { v.pause(); v.src = ""; } // Stop video/save bandwidth
        preview.classList.remove('open');
    }

    // 7. SWIPE LOGIC (Mobile)
    let touchStartX = 0;
    preview.addEventListener('touchstart', e => touchStartX = e.touches[0].screenX, {passive: true});
    preview.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        handleSwipe(touchStartX, touchEndX);
    });

    function handleSwipe(start, end) {
        const diff = start - end;
        if (Math.abs(diff) < 50) return; // Ignore small swipes

        // Swipe Left (Next)
        if (diff > 0 && currentIndex < galFiles.length - 1) {
            openPreview(galFiles[currentIndex + 1], currentIndex + 1);
        }
        // Swipe Right (Prev)
        else if (diff < 0 && currentIndex > 0) {
            openPreview(galFiles[currentIndex - 1], currentIndex - 1);
        }
    }

    // Key Listener
    document.addEventListener('keydown', (e) => {
        if(preview.classList.contains('open') && e.key === 'Escape') closePreview();
    });

})();
