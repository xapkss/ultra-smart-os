/* FILENAME: addon-gallery.js
   PURPOSE: Cloud Gallery (Pro Grid, Fast Video, Top Toast)
   VERSION: 4.0 (Final Stable)
*/

(function () {

    // ============================================================
    // ⚙️ CONFIGURATION
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
        // Insert before the last control button
        if(dock.lastElementChild) dock.insertBefore(icon, dock.lastElementChild);
        else dock.appendChild(icon);
        
        icon.onclick = toggleGallery;
        icon.onmousedown = (e) => e.stopPropagation();
    }

    // 2. PRO CSS STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        /* WINDOW CONTAINER */
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
        .gal-title { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
        .gal-close { font-size: 28px; color: #ff5f57; cursor: pointer; line-height: 1; transition: 0.2s; }
        .gal-close:hover { color: #fff; transform: rotate(90deg); }

        /* GRID (FORCE 2 COLUMNS ON MOBILE) */
        .gal-content {
            flex: 1; overflow-y: auto; padding: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            align-content: start;
        }
        @media (max-width: 600px) {
            .gal-content {
                grid-template-columns: 1fr 1fr; /* Force 2 Columns */
                gap: 8px; padding: 10px;
            }
        }

        /* ITEMS */
        .gal-item {
            position: relative; border-radius: 12px; overflow: hidden;
            aspect-ratio: 9/16; background: #2a2a2a;
            cursor: pointer; border: 1px solid rgba(255,255,255,0.05);
            transition: transform 0.2s;
        }
        .gal-item:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.3); }

        /* THUMBNAILS */
        .gal-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
        
        /* VIDEO PLACEHOLDER (Better than broken video tag) */
        .gal-vid-card {
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: #555;
        }
        .vid-icon { font-size: 30px; margin-bottom: 5px; color: #fff; opacity: 0.8; }
        .vid-label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }

        /* BADGES */
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

        /* PREVIEW MODAL */
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
            max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }

        .gal-preview-actions {
            margin-top: 20px; display: flex; gap: 15px;
        }
        .p-btn {
            padding: 10px 20px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer;
            display: flex; align-items: center; gap: 8px; font-size: 14px;
        }
        .p-apply { background: #4285f4; color: white; }
        .p-close { background: #333; color: white; }
        
        .gal-loader { color: #888; text-align: center; margin-top: 50px; grid-column: 1 / -1; }
    `;
    document.head.appendChild(style);

    // 3. HTML STRUCTURE
    const win = document.createElement('div');
    win.id = 'os-gallery-window';
    win.innerHTML = `
        <div class="gal-header">
            <div class="gal-title">☁️ Cloud Gallery</div>
            <div class="gal-close" id="gal-close-btn">×</div>
        </div>
        <div class="gal-content" id="gal-grid">
            <div class="gal-loader">Connecting to Drive...</div>
        </div>
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

            data.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                
                // --- SMART THUMBNAIL LOGIC ---
                // Video ke liye Image load mat karo, usse black screen aati hai.
                // Uske liye ek "Card" banao.
                let thumbHtml = '';
                if(file.type === 'video') {
                    thumbHtml = `
                        <div class="gal-vid-card">
                            <div class="vid-icon">▶</div>
                            <div class="vid-label">Live Wallpaper</div>
                        </div>
                    `;
                } else {
                    thumbHtml = `<img src="${file.url}" class="gal-thumb" loading="lazy">`;
                }

                item.innerHTML = `
                    ${thumbHtml}
                    <span class="gal-type">${file.type === 'video' ? 'VIDEO' : 'IMG'}</span>
                    <div class="gal-actions">
                        <button class="g-btn btn-apply">APPLY</button>
                        <button class="g-btn btn-dl">⬇</button>
                    </div>
                `;

                // APPLY Logic
                item.querySelector('.btn-apply').onclick = (e) => {
                    e.stopPropagation();
                    applyWallpaper(file);
                };
                
                // DOWNLOAD Logic
                item.querySelector('.btn-dl').onclick = (e) => {
                    e.stopPropagation();
                    window.open(file.downloadUrl, '_blank');
                };

                // PREVIEW Logic
                item.onclick = () => openPreview(file, index);

                grid.appendChild(item);
            });

        } catch (e) {
            grid.innerHTML = '<div class="gal-loader" style="color:#ff5f57">Failed to load.<br>Check internet.</div>';
        }
    }

    // 5. TOAST & APPLY LOGIC (FIXED POSITION)
    function applyWallpaper(file) {
        if (window.UltraOS) {
            UltraOS.setWallpaper(file.url, file.type);
            localStorage.setItem('os_wallpaper_mode', file.type);

            // 🚀 FORCE TOAST TO TOP
            const toast = document.getElementById('toast');
            if(toast) {
                // Style Override
                toast.style.bottom = 'auto'; // Disable bottom
                toast.style.top = '30px';    // Set to Top
                toast.style.transform = 'translateX(-50%)'; 
                toast.style.background = 'rgba(66, 133, 244, 0.9)'; // Blue bg for success
                
                // Show Message
                UltraOS.notify("✅ Wallpaper Applied Successfully!");
            }
        }
    }

    // 6. PREVIEW ENGINE (Fixed Video)
    function openPreview(file, index) {
        currentIndex = index;
        const container = document.getElementById('gal-preview-media');
        
        // Agar Video hai to Controls ke sath play karo
        if (file.type === 'video') {
            container.innerHTML = `<video src="${file.url}" autoplay controls loop playsinline></video>`;
        } else {
            container.innerHTML = `<img src="${file.url}">`;
        }

        preview.classList.add('open');

        // Buttons
        preview.querySelector('.p-apply').onclick = () => { applyWallpaper(file); closePreview(); };
        preview.querySelector('.p-close').onclick = closePreview;
    }

    function closePreview() {
        const v = document.querySelector('#gal-preview-media video');
        if(v) { v.pause(); v.src = ""; } // Memory cleaning
        preview.classList.remove('open');
    }

})();
