/* FILENAME: addon-panel.js
   PURPOSE: Control Panel for Wallpaper & Updates
   DEVELOPER: DRx Shishupal
*/

(function() {
    // 1. CONFIGURATION (Edit this on GitHub to change message/media)
    const CONFIG = {
        // Aapke GitHub se direct links
        image: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/pic.png",
        video: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/my.mp4",
        
        // Yahan jo likhoge wo sab users ko dikhega (About Section)
        aboutTitle: "Ultra OS v2.0",
        aboutText: "Welcome to the Next-Gen OS. Now supporting Live Wallpapers and Cloud Widgets. Stay tuned for more updates!",
        devName: "DRx Shishupal"
    };

    // 2. CHECK CONFLICTS
    if (document.getElementById('os-ctrl-btn')) return;

    // 3. NEON CSS STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- TOGGLE BUTTON --- */
        #os-ctrl-btn {
            position: absolute; top: 80px; right: 20px; /* Below Settings */
            width: 50px; height: 50px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(66, 133, 244, 0.3);
            border-radius: 12px; cursor: pointer;
            backdrop-filter: blur(10px); z-index: 100;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            color: #4285f4; font-size: 24px;
        }
        #os-ctrl-btn:hover { 
            background: rgba(66, 133, 244, 0.2); 
            box-shadow: 0 0 15px rgba(66, 133, 244, 0.6);
            transform: scale(1.05);
            color: white;
        }

        /* --- MAIN PANEL --- */
        #os-panel {
            position: absolute; top: 80px; right: 80px;
            width: 280px;
            background: rgba(10, 10, 10, 0.85);
            border: 1px solid rgba(66, 133, 244, 0.4);
            border-radius: 20px;
            padding: 20px;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(66, 133, 244, 0.2);
            z-index: 101;
            display: none; /* Hidden by default */
            flex-direction: column; gap: 15px;
            animation: slideIn 0.3s ease forwards;
            color: white; font-family: 'Segoe UI', sans-serif;
        }

        /* --- SECTIONS --- */
        .panel-header { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 5px; }
        .panel-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 10px; }
        
        /* --- BUTTONS --- */
        .panel-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 10px; border-radius: 10px;
            color: white; cursor: pointer;
            font-size: 14px; font-weight: 500;
            display: flex; align-items: center; gap: 10px;
            transition: 0.2s;
        }
        .panel-btn:hover { background: rgba(255,255,255,0.15); border-color: white; }
        .btn-video { border-color: rgba(66, 133, 244, 0.5); color: #8ab4f8; }
        .btn-video:hover { background: rgba(66, 133, 244, 0.2); }
        .btn-reset { color: #ff8b8b; border-color: rgba(255, 139, 139, 0.3); }
        .btn-hide { opacity: 0.6; font-size: 12px; justify-content: center; }

        /* --- DEV SIGNATURE --- */
        .dev-sig {
            margin-top: 10px; text-align: center;
            font-size: 11px; text-transform: uppercase;
            letter-spacing: 2px; color: #4285f4;
            opacity: 0.8; font-weight: 700;
            text-shadow: 0 0 10px rgba(66, 133, 244, 0.4);
        }

        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    `;
    document.head.appendChild(style);

    // 4. HTML STRUCTURE
    // Button
    const btn = document.createElement('div');
    btn.id = 'os-ctrl-btn';
    btn.innerHTML = '⚡';
    btn.title = "Control Center";
    document.body.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'os-panel';
    panel.innerHTML = `
        <div class="panel-header">${CONFIG.aboutTitle}</div>
        <div class="panel-text">${CONFIG.aboutText}</div>
        
        <button class="panel-btn btn-video" id="p-set-video">🎥 Set Live Wallpaper</button>
        <button class="panel-btn btn-reset" id="p-reset" style="display:none;">🔄 Reset to Image</button>
        <button class="panel-btn btn-hide" id="p-hide-ui">👁️ Hide This Button</button>
        
        <div class="dev-sig">Developer<br>${CONFIG.devName}</div>
    `;
    document.body.appendChild(panel);

    // 5. LOGIC ENGINE
    const ui = {
        btn: document.getElementById('os-ctrl-btn'),
        panel: document.getElementById('os-panel'),
        btnVid: document.getElementById('p-set-video'),
        btnReset: document.getElementById('p-reset'),
        btnHide: document.getElementById('p-hide-ui'),
        bgImg: document.getElementById('bg-img'),
        bgVid: document.getElementById('bg-vid')
    };

    // Toggle Panel
    ui.btn.onclick = () => {
        ui.panel.style.display = ui.panel.style.display === 'flex' ? 'none' : 'flex';
    };

    // A. SET VIDEO LOGIC
    ui.btnVid.onclick = () => {
        // Force Mute to allow Autoplay
        ui.bgVid.muted = true; 
        ui.bgVid.src = CONFIG.video;
        
        // UI Switch
        ui.bgImg.classList.remove('active-bg'); // Hide Image
        ui.bgVid.classList.add('active-bg');    // Show Video
        
        ui.bgVid.play().catch(e => {
            alert("Video Play Error: User interaction needed or format issue.");
            console.error(e);
        });

        // Toggle Buttons
        ui.btnVid.style.display = 'none';
        ui.btnReset.style.display = 'flex';
        
        if(window.UltraOS) UltraOS.notify("Live Wallpaper Active");
    };

    // B. RESET LOGIC (Back to Pic)
    ui.btnReset.onclick = () => {
        ui.bgVid.pause();
        ui.bgVid.classList.remove('active-bg'); // Hide Video
        ui.bgImg.classList.add('active-bg');    // Show Image
        
        // Ensure Image is Loaded
        if(!ui.bgImg.src) ui.bgImg.src = CONFIG.image;

        // Toggle Buttons
        ui.btnReset.style.display = 'none';
        ui.btnVid.style.display = 'flex';

        if(window.UltraOS) UltraOS.notify("Wallpaper Reset");
    };

    // C. HIDE UI LOGIC (Temporary)
    ui.btnHide.onclick = () => {
        ui.panel.style.display = 'none';
        ui.btn.style.display = 'none';
        if(window.UltraOS) UltraOS.notify("UI Hidden (Refresh to restore)");
    };

    // Initial State Check: Agar video pehle se nahi chal raha to Pic dikhao
    if (!ui.bgVid.classList.contains('active-bg')) {
         ui.bgImg.src = CONFIG.image;
         ui.bgImg.classList.add('active-bg');
    }

})();
