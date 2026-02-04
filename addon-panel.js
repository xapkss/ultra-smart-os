/* FILENAME: addon-panel.js
   PURPOSE: The Master Controller (Merged Wallpaper + Settings + Security)
   VERSION: 8.0 (All-in-One)
*/

(function() {
    // 1. CONFIGURATION
    const CONFIG = {
        defaultVideo: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/my.mp4",
        defaultImage: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/pic.png", // Backup Image
        aboutTitle: "Ultra OS Pro",
        aboutText: "System Active. Manage Wallpapers & Security.",
        devName: "DRx Shishupal"
    };

    if (document.getElementById('os-ctrl-btn')) return;

    // 2. STYLES (Z-Index Fixed & Animation Added)
    const style = document.createElement('style');
    style.innerHTML = `
        /* GEAR BUTTON (Top Right Fixed) */
        #os-ctrl-btn {
            position: fixed; top: 20px; right: 20px; /* Fixed Position */
            width: 45px; height: 45px;
            background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 50%; cursor: pointer; backdrop-filter: blur(10px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: #fff; font-size: 20px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* CLICK ANIMATION */
        #os-ctrl-btn:active { transform: scale(0.9) rotate(180deg); }
        #os-ctrl-btn.active { transform: rotate(90deg); background: rgba(66, 133, 244, 0.8); }
        #os-ctrl-btn:hover { background: rgba(255,255,255,0.2); }

        /* PANEL STYLE */
        #os-panel {
            position: fixed; top: 80px; right: 20px; width: 280px;
            background: rgba(18, 18, 18, 0.95); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px; padding: 20px; backdrop-filter: blur(40px);
            box-shadow: 0 40px 80px rgba(0,0,0,0.6);
            z-index: 9999; /* Widgets ke upar, Lock screen ke neeche */
            display: none; flex-direction: column; gap: 12px;
            transform-origin: top right;
            animation: panelOpen 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
            color: white; font-family: 'Segoe UI', sans-serif;
        }
        
        @keyframes panelOpen { 
            from { opacity: 0; transform: scale(0.9) translateY(-20px); } 
            to { opacity: 1; transform: scale(1) translateY(0); } 
        }

        .panel-header { font-size: 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 5px; color: #fff; }
        .panel-text { font-size: 12px; color: #888; margin-bottom: 5px; }
        
        .panel-btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);
            padding: 12px; border-radius: 12px; color: #ddd; cursor: pointer;
            font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: 0.2s;
        }
        .panel-btn:hover { background: rgba(255,255,255,0.1); color: #fff; transform: translateX(5px); }
        
        .btn-upload { color: #0f0; border-color: rgba(0, 255, 0, 0.15); }
        .btn-video { color: #8ab4f8; } 
        .btn-reset { color: #ff8b8b; } 
        .btn-pass { color: #ffd700; }
        
        .dev-sig { margin-top: 15px; text-align: center; font-size: 10px; text-transform: uppercase; color: #555; font-weight: 700; letter-spacing: 2px; }
    `;
    document.head.appendChild(style);

    // 3. UI BUILD
    const btn = document.createElement('div');
    btn.id = 'os-ctrl-btn'; btn.innerHTML = '⚙️';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'os-panel';
    panel.innerHTML = `
        <div class="panel-header">${CONFIG.aboutTitle}</div>
        <div class="panel-text">${CONFIG.aboutText}</div>
        
        <button class="panel-btn btn-upload" id="p-upload">📁 Upload Media</button>
        <button class="panel-btn btn-video" id="p-set-video">🎥 Enable Live Wallpaper</button>
        <button class="panel-btn btn-reset" id="p-reset" style="display:none;">🔄 Disable (Show Image)</button>
        <button class="panel-btn btn-pass" id="p-pass">🔐 Change Password</button>
        <button class="panel-btn" id="p-hide-ui">👁️ Hide Menu</button>
        
        <div class="dev-sig">Dev: ${CONFIG.devName}</div>
    `;
    document.body.appendChild(panel);

    // Hidden Input
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'file'; hiddenInput.accept = 'image/*,video/*'; hiddenInput.style.display = 'none';
    document.body.appendChild(hiddenInput);

    // 4. LOGIC ENGINE
    const ui = {
        btn: document.getElementById('os-ctrl-btn'),
        panel: document.getElementById('os-panel'),
        btnUpload: document.getElementById('p-upload'),
        btnVid: document.getElementById('p-set-video'),
        btnReset: document.getElementById('p-reset'),
        btnPass: document.getElementById('p-pass'),
        btnHide: document.getElementById('p-hide-ui'),
        bgVid: document.getElementById('bg-vid'),
        bgImg: document.getElementById('bg-img')
    };

    // Auto-Create Missing Elements (Fallback)
    if(!ui.bgVid) {
        const v = document.createElement('video'); v.id='bg-vid'; v.autoplay=true; v.loop=true; v.muted=true; v.playsInline=true;
        document.body.insertBefore(v, document.body.firstChild); ui.bgVid = v;
    }
    if(!ui.bgImg) {
        const i = document.createElement('img'); i.id='bg-img'; i.className='smart-bg';
        document.body.insertBefore(i, document.body.firstChild); ui.bgImg = i;
    }

    // TOGGLE PANEL & ANIMATION
    ui.btn.onclick = () => {
        const isOpen = ui.panel.style.display === 'flex';
        ui.panel.style.display = isOpen ? 'none' : 'flex';
        ui.btn.classList.toggle('active', !isOpen);
    };

    // UPLOAD LOGIC
    ui.btnUpload.onclick = () => hiddenInput.click();
    hiddenInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && window.UltraOS) {
            window.UltraOS.saveLocalWallpaper(file);
            ui.panel.style.display = 'none'; ui.btn.classList.remove('active');
        }
    };

    // VIDEO LOGIC
    function enableVideo(save=true) {
        if (!ui.bgVid.src || ui.bgVid.src === "" || ui.bgVid.src === window.location.href) {
            ui.bgVid.src = CONFIG.defaultVideo;
        }
        ui.bgVid.muted = true; ui.bgVid.style.opacity = '1'; ui.bgVid.play().catch(()=>{});
        ui.btnVid.style.display = 'none'; ui.btnReset.style.display = 'flex';
        if(save) localStorage.setItem('os_wallpaper_mode', 'video');
    }

    function disableVideo(save=true) {
        ui.bgVid.style.opacity = '0'; setTimeout(() => ui.bgVid.pause(), 500);
        ui.btnReset.style.display = 'none'; ui.btnVid.style.display = 'flex';
        if(save) localStorage.setItem('os_wallpaper_mode', 'image');
    }
    
    ui.btnVid.onclick = () => enableVideo(true);
    ui.btnReset.onclick = () => disableVideo(true);
    ui.btnHide.onclick = () => { ui.panel.style.display='none'; ui.btn.style.display='none'; };

    // PASSWORD LOGIC
    ui.btnPass.onclick = () => {
        const currentPin = localStorage.getItem('os_user_pin') || "1234";
        const old = prompt("Current PIN:");
        if (old === currentPin) {
            const newP = prompt("New 4-Digit PIN:");
            if (newP && newP.length === 4 && !isNaN(newP)) {
                localStorage.setItem('os_user_pin', newP); alert("✅ Updated!");
            } else alert("❌ Invalid PIN");
        } else alert("❌ Wrong PIN");
    };

    // === 🚀 STARTUP & DEFAULT WALLPAPER LOGIC (Merged Here) ===
    setTimeout(() => {
        const savedMode = localStorage.getItem('os_wallpaper_mode');
        
        // 1. Agar User ka Video mode on hai
        if (savedMode === 'video') {
            enableVideo(false);
        } else {
            disableVideo(false);
        }

        // 2. Agar koi Image set nahi hai, to Default lagao
        if (!ui.bgImg.src || ui.bgImg.src === "" || ui.bgImg.src === window.location.href) {
            // Check agar UltraOS ne pehle se kuch set nahi kiya
            if (!localStorage.getItem('ultra_cache_addon-wallpaper.js')) { 
                // Ye check thoda tricky hai, better hai direct set kar dein agar empty hai
                ui.bgImg.src = CONFIG.defaultImage;
                ui.bgImg.classList.add('active-bg');
                console.log("Setting Default Wallpaper from Panel");
            }
        }
    }, 500); // Thoda delay taaki Kernel apna kaam kar le

})();
