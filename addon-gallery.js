/* FILENAME: addon-gallery.js
   PURPOSE: Cloud Gallery connected to Google Drive
*/

(function() {
    // ============================================================
    // URL WEB APP SCRIPT:
    const API_URL = "https://script.google.com/macros/s/AKfycbzlXpSODBBo4liswfv6N3KPRDN6W7eXjpjm1UrGNYOZ9TD-YXWtL8hToRZK5WExFx8F/exec"; 
    // ============================================================

    // 1. DOCK INTEGRATION (Icon add karna)
    const dock = document.getElementById('os-app-dock');
    if (dock && !document.getElementById('icon-gallery')) {
        const icon = document.createElement('div');
        icon.id = 'icon-gallery';
        icon.className = 'app-icon';
        icon.innerHTML = '☁️'; // Cloud Icon
        icon.title = "Cloud Gallery";
        icon.style.cursor = "pointer";
        
        // Insert before the control button (last element)
        dock.insertBefore(icon, dock.lastElementChild);
        
        icon.onclick = () => toggleGallery();
        // Prevent drag interference
        icon.onmousedown = (e) => e.stopPropagation();
    }

    // 2. CSS STYLES (Glassmorphism Gallery)
    const style = document.createElement('style');
    style.innerHTML = `
        #os-gallery-window {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 80%; max-width: 900px; height: 70vh;
            background: rgba(15, 15, 15, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            backdrop-filter: blur(30px);
            z-index: 2000;
            display: none; flex-direction: column;
            opacity: 0; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }
        #os-gallery-window.open { opacity: 1; transform: translate(-50%, -50%) scale(1); }

        /* HEADER */
        .gal-header {
            padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex; justify-content: space-between; align-items: center;
        }
        .gal-title { font-size: 20px; font-weight: 700; color: white; display: flex; gap: 10px; align-items: center; }
        .gal-close { cursor: pointer; font-size: 24px; color: #ff4444; transition: 0.2s; }
        .gal-close:hover { transform: scale(1.1); }

        /* GRID CONTENT */
        .gal-content {
            flex: 1; overflow-y: auto; padding: 20px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        }
        
        /* CARDS */
        .gal-item {
            position: relative; border-radius: 12px; overflow: hidden;
            aspect-ratio: 9/16; background: #222;
            cursor: pointer; border: 1px solid transparent;
            transition: 0.2s;
        }
        .gal-item:hover { transform: translateY(-5px); border-color: #4285f4; }
        .gal-thumb { width: 100%; height: 100%; object-fit: cover; }
        .gal-type {
            position: absolute; top: 5px; right: 5px;
            background: rgba(0,0,0,0.6); padding: 2px 6px;
            border-radius: 4px; font-size: 10px; color: white;
        }
        
        /* ACTIONS (On Hover) */
        .gal-actions {
            position: absolute; bottom: 0; left: 0; width: 100%;
            background: linear-gradient(transparent, rgba(0,0,0,0.9));
            padding: 10px; display: flex; gap: 5px;
            transform: translateY(100%); transition: 0.3s;
        }
        .gal-item:hover .gal-actions { transform: translateY(0); }
        
        .g-btn {
            flex: 1; border: none; padding: 6px; border-radius: 6px;
            font-size: 11px; cursor: pointer; font-weight: 600;
        }
        .btn-apply { background: #4285f4; color: white; }
        .btn-dl { background: rgba(255,255,255,0.2); color: white; }

        /* LOADER */
        .gal-loader { text-align: center; color: white; padding: 50px; width: 100%; }
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
            <div class="gal-loader">Connecting to Drive...</div>
        </div>
    `;
    document.body.appendChild(win);

    // 4. LOGIC
    let isDataLoaded = false;

    function toggleGallery() {
        const el = document.getElementById('os-gallery-window');
        if (el.style.display === 'flex') {
            el.classList.remove('open');
            setTimeout(() => el.style.display = 'none', 300);
        } else {
            el.style.display = 'flex';
            setTimeout(() => el.classList.add('open'), 10);
            if (!isDataLoaded) loadDriveData();
        }
    }

    document.getElementById('gal-close-btn').onclick = toggleGallery;

    async function loadDriveData() {
        const grid = document.getElementById('gal-grid');
        
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            
            grid.innerHTML = ''; // Clear Loader
            isDataLoaded = true;

            if (data.length === 0) {
                grid.innerHTML = '<div class="gal-loader">No files found in Drive Folder.</div>';
                return;
            }

            data.forEach(file => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                
                // Show Thumbnail (Video or Image)
                // Note: Drive videos thumbnail requires Auth sometimes, trying standard thumb
                let thumbUrl = file.url; 
                
                item.innerHTML = `
                    <img src="${thumbUrl}" class="gal-thumb" loading="lazy">
                    <span class="gal-type">${file.type === 'video' ? '🎥' : '🖼️'}</span>
                    <div class="gal-actions">
                        <button class="g-btn btn-apply">APPLY</button>
                        <button class="g-btn btn-dl">⬇</button>
                    </div>
                `;

                // APPLY Logic
                item.querySelector('.btn-apply').onclick = (e) => {
                    e.stopPropagation();
                    if(window.UltraOS) {
                        UltraOS.setWallpaper(file.url, file.type);
                        
                        // Save to memory for persistence (using Panel Logic if available)
                        localStorage.setItem('os_wallpaper_mode', file.type);
                        // Hum direct DB me bhi save kar sakte hain agar chahein, 
                        // par abhi ke liye live apply kaafi hai.
                    }
                };

                // DOWNLOAD Logic
                item.querySelector('.btn-dl').onclick = (e) => {
                    e.stopPropagation();
                    window.open(file.downloadUrl, '_blank');
                };

                grid.appendChild(item);
            });

        } catch (e) {
            console.error(e);
            grid.innerHTML = '<div class="gal-loader" style="color:#ff4444">Failed to load Drive.<br>Check Web App Permissions (Anyone).</div>';
        }
    }

})();
