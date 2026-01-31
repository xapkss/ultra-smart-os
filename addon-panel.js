/* FILENAME: addon-panel.js
   PURPOSE: Control Panel for Wallpaper & Updates
   DEVELOPER: DRx Shishupal
*/

(function() {
    // 1. CONFIGURATION
    const CONFIG = {
        image: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/pic.png",
        video: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/my.mp4",
        aboutTitle: "Ultra OS v2.0",
        aboutText: "Next-Gen Web OS with Persistent Live Wallpaper support. Experience the future of web interfaces.",
        devName: "DRx Shishupal"
    };

    // 2. CHECK CONFLICTS
    if (document.getElementById('os-ctrl-btn')) return;

    // 3. NEON CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #os-ctrl-btn {
            position: absolute; top: 80px; right: 20px;
            width: 50px; height: 50px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(66, 133, 244, 0.3);
            border-radius: 12px; cursor: pointer;
            backdrop-filter: blur(10px); z-index: 100;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); color: #4285f4; font-size: 24px;
        }
        #os-ctrl-btn:hover { background: rgba(66, 133, 244, 0.2); box-shadow: 0 0 15px rgba(66, 133, 244, 0.6); transform: scale(1.05); color: white; }

        #os-panel {
            position: absolute; top: 80px; right: 80px; width: 280px;
            background: rgba(10, 10, 10, 0.85); border: 1px solid rgba(66, 133, 244, 0.4);
            border-radius: 20px; padding: 20px; backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.6); z-index: 101;
            display: none; flex-direction: column; gap: 15px;
            animation: slideIn 0.3s ease forwards; color: white; font-family: 'Segoe UI', sans-serif;
        }
        .panel-header { font-size: 18px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
        .panel-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }
        .panel-btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            padding: 10px; border-radius: 10px; color: white; cursor: pointer;
            font-size: 14px; display: flex; align-items: center; gap: 10px; transition: 0.2s;
        }
        .panel-btn:hover { background: rgba(255,255,255,0.15); border-color: white; }
        .btn-video { border-color: rgba(66, 133, 244, 0.5); color: #8ab4f8; }
        .btn-reset { color: #ff8b8b; border-color: rgba(255, 139, 139, 0.3); }
        .btn-hide { opacity: 0.6; font-size: 12px; justify-content: center; }
        .dev-sig { margin-top: 10px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #4285f4; font-weight: 700; text-shadow: 0 0 10px rgba(66, 133, 244, 0.4); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    `;
    document.head.appendChild(style);

    // 4. HTML INJECTION
    const btn = document.createElement('div');
    btn.id = 'os-ctrl-btn'; btn.innerHTML = '⚡'; btn.title = "Control Center";
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'os-panel';
    panel.innerHTML = `
        <div class="panel-header">${CONFIG.aboutTitle}</div>
        <div class="panel-text">${CONFIG.aboutText}</div>
        <button class="panel-btn btn-video" id="p-set-video">🎥 Set Live Wallpaper</button>
        <button class="panel-btn btn-reset" id="p-reset" style="display:none;">🔄 Reset to Image</button>
        <button class="panel-btn btn-hide" id="p-hide-ui">👁️ Hide Button</button>
        <div class="dev-sig">Developer<br>${CONFIG.devName}</div>
    `;
    document.body.appendChild(panel);

    // 5. MEMORY & LOGIC ENGINE
    const ui = {
        btn: document.getElementById('os-ctrl-btn'),
        panel: document.getElementById('os-panel'),
        btnVid: document.getElementById('p-set-video'),
        btnReset: document.getElementById('p-reset'),
        btnHide: document.getElementById('p-hide-ui'),
        bgImg: document.getElementById('bg-img'),
        bgVid: document.getElementById('bg-vid')
    };

    // --- FUNCTION: Enable Video Mode ---
    function enableVideoMode(saveMemory = true) {
        ui.bgVid.muted = true; // Required for autoplay
        ui.bgVid.src = CONFIG.video;
        
        ui.bgImg.classList.remove('active-bg');
        ui.bgVid.classList.add('active-bg');
        
        ui.bgVid.play().catch(e => console.log("Auto-play restricted until user interaction"));

        // Update Buttons
        ui.btnVid.style.display = 'none';
        ui.btnReset.style.display = 'flex';

        // MEMORY SAVE: Browser ko batao ki user ne Video chuna hai
        if (saveMemory) localStorage.setItem('os_wallpaper_mode', 'video');
        
        if(window.UltraOS && saveMemory) UltraOS.notify("Live Wallpaper Active");
    }

    // --- FUNCTION: Enable Image Mode (Reset) ---
    function enableImageMode(saveMemory = true) {
        ui.bgVid.pause();
        ui.bgVid.classList.remove('active-bg');
        ui.bgImg.classList.add('active-bg');
        
        if(!ui.bgImg.src) ui.bgImg.src = CONFIG.image;

        // Update Buttons
        ui.btnReset.style.display = 'none';
        ui.btnVid.style.display = 'flex';

        // MEMORY SAVE: Browser ko batao ki user ne Image chuna hai
        if (saveMemory) localStorage.setItem('os_wallpaper_mode', 'image');

        if(window.UltraOS && saveMemory) UltraOS.notify("Restored to Image");
    }

    // --- EVENTS ---
    ui.btn.onclick = () => ui.panel.style.display = (ui.panel.style.display === 'flex' ? 'none' : 'flex');
    ui.btnVid.onclick = () => enableVideoMode(true);
    ui.btnReset.onclick = () => enableImageMode(true);
    
    ui.btnHide.onclick = () => {
        ui.panel.style.display = 'none';
        ui.btn.style.display = 'none';
    };

    // --- 🚀 AUTO-START LOGIC (MEMORY CHECK) ---
    // Page load hote hi check karo: User ne pichli baar kya chuna tha?
    const savedMode = localStorage.getItem('os_wallpaper_mode');

    if (savedMode === 'video') {
        console.log("Memory: User prefers Video");
        enableVideoMode(false); // False means don't show notification on boot
    } else {
        // Default Image state
        ui.bgImg.src = CONFIG.image;
        ui.bgImg.classList.add('active-bg');
    }

})();
