/* FILENAME: addon-gallery.js
   PURPOSE: Cloud Gallery connected to Google Drive (UI Enhanced)
*/

(function () {

    // ============================================================
    // URL WEB APP SCRIPT:
    const API_URL = "https://script.google.com/macros/s/AKfycbzlXpSODBBo4liswfv6N3KPRDN6W7eXjpjm1UrGNYOZ9TD-YXWtL8hToRZK5WExFx8F/exec";
    // ============================================================

    let isDataLoaded = false;
    let galFiles = [];
    let currentIndex = 0;

    // ============================================================
    // 1. DOCK ICON
    const dock = document.getElementById('os-app-dock');
    if (dock && !document.getElementById('icon-gallery')) {
        const icon = document.createElement('div');
        icon.id = 'icon-gallery';
        icon.className = 'app-icon';
        icon.innerHTML = '☁️';
        icon.title = "Cloud Gallery";
        icon.style.cursor = "pointer";
        dock.insertBefore(icon, dock.lastElementChild);
        icon.onclick = toggleGallery;
        icon.onmousedown = e => e.stopPropagation();
    }

    // ============================================================
    // 2. STYLES
    const style = document.createElement('style');
    style.innerHTML = `
#os-gallery-window{
position:fixed;top:50%;left:50%;
transform:translate(-50%,-50%) scale(.9);
width:80%;max-width:900px;height:70vh;
background:rgba(15,15,15,.95);
border-radius:20px;
backdrop-filter:blur(30px);
box-shadow:0 20px 60px rgba(0,0,0,.8);
display:none;flex-direction:column;
z-index:2000;opacity:0;transition:.3s;
overflow:hidden
}
#os-gallery-window.open{opacity:1;transform:translate(-50%,-50%) scale(1)}
.gal-header{padding:20px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center}
.gal-title{color:#fff;font-size:20px;font-weight:700}
.gal-close{font-size:24px;color:#ff4444;cursor:pointer}
.gal-content{flex:1;overflow:auto;padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:15px}
.gal-item{aspect-ratio:9/16;background:#222;border-radius:12px;overflow:hidden;cursor:pointer;transition:.2s}
.gal-item:hover{transform:translateY(-5px)}
.gal-thumb{width:100%;height:100%;object-fit:cover}
.gal-type{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:4px;font-size:10px;color:#fff}
.gal-actions{position:absolute;bottom:0;left:0;width:100%;padding:10px;display:flex;gap:6px;background:linear-gradient(transparent,rgba(0,0,0,.9));transform:translateY(100%);transition:.3s}
.gal-item:hover .gal-actions{transform:translateY(0)}
.g-btn{flex:1;border:none;border-radius:6px;font-size:11px;font-weight:700;padding:6px;cursor:pointer}
.btn-apply{background:#4285f4;color:#fff}
.btn-dl{background:rgba(255,255,255,.2);color:#fff}
.gal-loader{color:#fff;text-align:center;padding:40px}

/* PREVIEW */
#gal-preview{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);z-index:3000;display:none;align-items:center;justify-content:center}
#gal-preview.open{display:flex}
.gal-preview-box{width:90%;max-width:600px;max-height:85vh;background:#111;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;animation:zoom .25s ease}
@keyframes zoom{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.gal-preview-media{flex:1;display:flex;align-items:center;justify-content:center;background:#000}
.gal-preview-media img,.gal-preview-media video{max-width:100%;max-height:100%}
.gal-preview-actions{display:flex;gap:10px;padding:15px}
.gal-preview-actions button{flex:1;padding:10px;border:none;border-radius:10px;font-weight:700;cursor:pointer}
.btn-close{background:#ff4444;color:#fff}
`;
    document.head.appendChild(style);

    // ============================================================
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
</div>`;
    document.body.appendChild(win);

    const preview = document.createElement('div');
    preview.id = 'gal-preview';
    preview.innerHTML = `
<div class="gal-preview-box">
 <div class="gal-preview-media" id="gal-preview-media"></div>
 <div class="gal-preview-actions">
  <button class="btn-apply">APPLY</button>
  <button class="btn-dl">⬇ DOWNLOAD</button>
  <button class="btn-close">✖ CLOSE</button>
 </div>
</div>`;
    document.body.appendChild(preview);

    // ============================================================
    // 4. LOGIC
    function toggleGallery() {
        const el = win;
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
            galFiles = data;
            isDataLoaded = true;
            grid.innerHTML = '';

            data.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'gal-item';
                item.innerHTML = `
<img src="${file.url}" class="gal-thumb">
<span class="gal-type">${file.type === 'video' ? '🎥' : '🖼️'}</span>
<div class="gal-actions">
 <button class="g-btn btn-apply">APPLY</button>
 <button class="g-btn btn-dl">⬇</button>
</div>`;

                item.querySelector('.btn-apply').onclick = e => {
                    e.stopPropagation();
                    if (window.UltraOS) {
                        UltraOS.setWallpaper(file.url, file.type);
                        localStorage.setItem('os_wallpaper_mode', file.type);
                    }
                };

                item.querySelector('.btn-dl').onclick = e => {
                    e.stopPropagation();
                    window.open(file.downloadUrl, '_blank');
                };

                item.onclick = () => openPreview(file, index);
                grid.appendChild(item);
            });

        } catch (e) {
            grid.innerHTML = '<div class="gal-loader" style="color:#ff4444">Failed to load Drive</div>';
        }
    }

    // ============================================================
    // 5. PREVIEW + SWIPE
    function pauseCurrentVideo() {
        const v = document.querySelector('#gal-preview-media video');
        if (v) { v.pause(); v.currentTime = 0; }
    }

    function openPreview(file, index) {
        currentIndex = index;
        const media = document.getElementById('gal-preview-media');
        media.innerHTML = file.type === 'video'
            ? `<video src="${file.url}" autoplay controls></video>`
            : `<img src="${file.url}">`;

        preview.classList.add('open');

        preview.querySelector('.btn-apply').onclick = () => {
            if (window.UltraOS) UltraOS.setWallpaper(file.url, file.type);
        };
        preview.querySelector('.btn-dl').onclick = () => {
            window.open(file.downloadUrl, '_blank');
        };
        preview.querySelector('.btn-close').onclick = closePreview;
    }

    function closePreview() {
        pauseCurrentVideo();
        preview.classList.remove('open');
    }

    let startX = 0;
    preview.addEventListener('touchstart', e => startX = e.touches[0].screenX, { passive: true });
    preview.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) < 50) return;
        pauseCurrentVideo();
        if (diff > 0 && currentIndex < galFiles.length - 1)
            openPreview(galFiles[++currentIndex], currentIndex);
        if (diff < 0 && currentIndex > 0)
            openPreview(galFiles[--currentIndex], currentIndex);
    });

    document.addEventListener('keydown', e => e.key === 'Escape' && closePreview());

})();
