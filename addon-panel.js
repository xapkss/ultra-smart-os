/* FILENAME: addon-panel.js
   PURPOSE: Control Panel (Live Video Overlay + Password + No Image Interference)
   VERSION: 5.0 (Transparent Video Fix)
*/

(function() {
    // 1. CONFIGURATION
    const CONFIG = {
        // Image hata di gayi hai taaki user ki custom pic affect na ho
        video: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/my.mp4",
        aboutTitle: "Ultra OS v3.0",
        aboutText: "System Active. Video Layer Overlay Enabled.",
        devName: "DRx Shishupal"
    };

    if (document.getElementById('os-ctrl-btn')) return;

    // 2. STYLES (High Z-Index Added)
    const style = document.createElement('style');
    style.innerHTML = `
        /* BUTTON STYLE */
        #os-ctrl-btn {
            position: absolute; top: 80px; right: 20px;
            width: 50px; height: 50px;
            background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255,255,255,0.15);
            border-radius: 14px; cursor: pointer; backdrop-filter: blur(15px);
            z-index: 10000; /* High Priority */
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4); color: #fff; font-size: 22px;
            transition: 0.3s;
        }
        #os-ctrl-btn:hover { transform: scale(1.1); background: rgba(66, 133, 244, 0.9); border-color: #4285f4; }

        /* PANEL STYLE */
        #os-panel {
            position: absolute; top: 80px; right: 85px; width: 290px;
            background: rgba(15, 15, 15, 0.95); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 20px; backdrop-filter: blur(30px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.9);
            z-index: 10000; /* High Priority (Above Widgets) */
            display: none; flex-direction: column; gap: 12px;
            animation: slideIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            color: white; font-family: 'Segoe UI', sans-serif;
        }
        
        .panel-header { font-size: 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 5px; color: #fff; letter-spacing: 0.5px; }
        .panel-text { font-size: 12px; color: #888; line-height: 1.4; margin-bottom: 5px; }
        
        .panel-btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);
            padding: 12px; border-radius: 10px; color: #ddd; cursor: pointer;
            font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: 0.2s;
        }
        .panel-btn:hover { background: rgba(255,255,255,0.1); color: #fff; transform: translateX(5px); }
        
        .btn-video { color: #8ab4f8; border-color: rgba(66, 133, 244, 0.2); }
        .btn-video:hover { background: rgba(66, 133, 244, 0.1); }
        
        .btn-reset { color: #ff8b8b; border-color: rgba(255, 95, 87, 0.2); }
        .btn-reset:hover { background: rgba(255, 95, 87, 0.1); }
        
        .btn-pass { color: #ffd700; border-color: rgba(255, 215, 0, 0.2); }
        
        .dev-sig { margin-top: 15px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #555; font-weight: 700; }
        
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
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
        
        <button class="panel-btn btn-video" id="p-set-video">🎥 Enable Live Wallpaper</button>
        <button class="panel-btn btn-reset" id="p-reset" style="display:none;">🔄 Disable (Show Image)</button>
        <button class="panel-btn btn-pass" id="p-pass">🔐 Change Password</button>
        <button class="panel-btn" id="p-hide-ui">👁️ Hide Menu</button>
        
        <div class="dev-sig">Developer<br>${CONFIG.devName}</div>
    `;
    document.body.appendChild(panel);

    // 4. LOGIC ENGINE
    const ui = {
        btn: document.getElementById('os-ctrl-btn'),
        panel: document.getElementById('os-panel'),
        btnVid: document.getElementById('p-set-video'),
        btnReset: document.getElementById('p-reset'),
        btnPass: document.getElementById('p-pass'),
        btnHide: document.getElementById('p-hide-ui'),
        bgVid: document.getElementById('bg-vid')
    };

    // Toggle Panel
    ui.btn.onclick = () => ui.panel.style.display = (ui.panel.style.display === 'flex' ? 'none' : 'flex');

    // === CORE LOGIC: TRANSPARENCY TOGGLE ===
    
    // 1. Enable Video (Make Visible)
    function enableVideo(save=true) {
        // Setup Video
        if(!ui.bgVid.src || ui.bgVid.src === "") {
            ui.bgVid.muted = true; 
            ui.bgVid.src = CONFIG.video;
        }
        
        // CSS Magic: Make Video Visible
        ui.bgVid.style.opacity = '1';
        ui.bgVid.style.zIndex = '-1'; // Image ke upar, content ke neeche
        ui.bgVid.play().catch(()=>{});

        // Button Toggle
        ui.btnVid.style.display = 'none';
        ui.btnReset.style.display = 'flex';

        if(save) localStorage.setItem('os_wallpaper_mode', 'video');
    }

    // 2. Disable Video (Make Invisible -> Show underlying User Image)
    function disableVideo(save=true) {
        // CSS Magic: Make Video Invisible (Transparent)
        ui.bgVid.style.opacity = '0';
        
        // Pause to save battery/performance
        setTimeout(() => ui.bgVid.pause(), 500); 

        // Button Toggle
        ui.btnReset.style.display = 'none';
        ui.btnVid.style.display = 'flex';

        // NOTE: Hum image src ko touch nahi kar rahe.
        // Jo bhi user ne lagaya hoga, wo ab dikhne lagega kyunki video transparent ho gaya.

        if(save) localStorage.setItem('os_wallpaper_mode', 'image');
    }
    
    // Event Listeners
    ui.btnVid.onclick = () => enableVideo(true);
    ui.btnReset.onclick = () => disableVideo(true);
    ui.btnHide.onclick = () => { ui.panel.style.display='none'; ui.btn.style.display='none'; };

    // --- PASSWORD LOGIC ---
    ui.btnPass.onclick = () => {
        const currentPin = localStorage.getItem('os_user_pin') || "1234";
        const userOld = prompt("Enter Current PIN:");
        
        if (userOld === currentPin) {
            const newPin = prompt("Enter New 4-Digit PIN:");
            if (newPin && newPin.length === 4 && !isNaN(newPin)) {
                localStorage.setItem('os_user_pin', newPin);
                alert("✅ Password Updated Successfully!");
            } else {
                alert("❌ Error: PIN must be 4 digits (Numbers only).");
            }
        } else {
            alert("❌ Wrong Current PIN!");
        }
    };

    // --- AUTO START CHECK ---
    const savedMode = localStorage.getItem('os_wallpaper_mode');
    
    // Check if user prefers video
    if (savedMode === 'video') {
        enableVideo(false); 
    } else {
        // Default: Video hidden (User image will show)
        ui.bgVid.style.opacity = '0';
        ui.btnReset.style.display = 'none';
        ui.btnVid.style.display = 'flex';
    }

})();
