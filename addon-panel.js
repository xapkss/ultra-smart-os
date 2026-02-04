/* FILENAME: addon-panel.js
   PURPOSE: Control Panel (Auto-Create Video Element + Fix)
   VERSION: 6.0 (Self-Healing)
*/

(function() {
    // 1. CONFIGURATION
    const CONFIG = {
        defaultVideo: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/my.mp4",
        aboutTitle: "Ultra OS v3.1",
        aboutText: "System Active. Video Layer Overlay Enabled.",
        devName: "DRx Shishupal"
    };

    if (document.getElementById('os-ctrl-btn')) return;

    // 2. STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        /* PANEL & BUTTON STYLES */
        #os-ctrl-btn {
            position: absolute; top: 80px; right: 20px;
            width: 50px; height: 50px;
            background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255,255,255,0.15);
            border-radius: 14px; cursor: pointer; backdrop-filter: blur(15px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4); color: #fff; font-size: 22px;
            transition: 0.3s;
        }
        #os-ctrl-btn:hover { transform: scale(1.1); background: rgba(66, 133, 244, 0.9); }

        #os-panel {
            position: absolute; top: 80px; right: 85px; width: 290px;
            background: rgba(15, 15, 15, 0.95); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 20px; backdrop-filter: blur(30px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.9);
            z-index: 10000; display: none; flex-direction: column; gap: 12px;
            animation: slideIn 0.2s forwards; color: white; font-family: 'Segoe UI', sans-serif;
        }
        .panel-header { font-size: 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 5px; color: #fff; }
        .panel-text { font-size: 12px; color: #888; margin-bottom: 5px; }
        .panel-btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);
            padding: 12px; border-radius: 10px; color: #ddd; cursor: pointer;
            font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: 0.2s;
        }
        .panel-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-video { color: #8ab4f8; } .btn-reset { color: #ff8b8b; } .btn-pass { color: #ffd700; }
        .dev-sig { margin-top: 15px; text-align: center; font-size: 10px; text-transform: uppercase; color: #555; font-weight: 700; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

        /* VIDEO LAYER STYLE (Important) */
        #bg-vid {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover; z-index: -1; /* Image (-2) ke upar */
            transition: opacity 0.5s ease; opacity: 0; pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // 3. AUTO-CREATE VIDEO ELEMENT (Safety Check)
    let videoEl = document.getElementById('bg-vid');
    if (!videoEl) {
        // Agar HTML me video tag nahi hai, to JS khud bana dega
        videoEl = document.createElement('video');
        videoEl.id = 'bg-vid';
        videoEl.autoplay = true;
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.playsInline = true;
        // Body me sabse pehle insert karo (background ke liye)
        document.body.insertBefore(videoEl, document.body.firstChild);
    }

    // 4. UI BUILD
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

    // 5. LOGIC ENGINE
    const ui = {
        btn: document.getElementById('os-ctrl-btn'),
        panel: document.getElementById('os-panel'),
        btnVid: document.getElementById('p-set-video'),
        btnReset: document.getElementById('p-reset'),
        btnPass: document.getElementById('p-pass'),
        btnHide: document.getElementById('p-hide-ui'),
        bgVid: videoEl // Ab ye kabhi null nahi hoga
    };

    ui.btn.onclick = () => ui.panel.style.display = (ui.panel.style.display === 'flex' ? 'none' : 'flex');

    // === VIDEO LOGIC ===
    function enableVideo(save=true) {
        if (!ui.bgVid.src || ui.bgVid.src === "" || ui.bgVid.src === window.location.href) {
            ui.bgVid.src = CONFIG.defaultVideo;
        }
        ui.bgVid.muted = true;
        ui.bgVid.style.opacity = '1'; // Make Visible
        ui.bgVid.play().catch(e => console.log("Autoplay blocked:", e));

        ui.btnVid.style.display = 'none';
        ui.btnReset.style.display = 'flex';
        if(save) localStorage.setItem('os_wallpaper_mode', 'video');
    }

    function disableVideo(save=true) {
        ui.bgVid.style.opacity = '0'; // Make Invisible
        setTimeout(() => ui.bgVid.pause(), 500); // Save Battery
        
        ui.btnReset.style.display = 'none';
        ui.btnVid.style.display = 'flex';
        if(save) localStorage.setItem('os_wallpaper_mode', 'image');
    }
    
    ui.btnVid.onclick = () => enableVideo(true);
    ui.btnReset.onclick = () => disableVideo(true);
    ui.btnHide.onclick = () => { ui.panel.style.display='none'; ui.btn.style.display='none'; };

    // === PASSWORD LOGIC ===
    ui.btnPass.onclick = () => {
        const currentPin = localStorage.getItem('os_user_pin') || "1234";
        const userOld = prompt("Enter Current PIN:");
        if (userOld === currentPin) {
            const newPin = prompt("Enter New 4-Digit PIN:");
            if (newPin && newPin.length === 4 && !isNaN(newPin)) {
                localStorage.setItem('os_user_pin', newPin);
                alert("✅ Password Updated!");
            } else { alert("❌ PIN must be 4 digits."); }
        } else { alert("❌ Wrong PIN!"); }
    };

    // === AUTO START ===
    const savedMode = localStorage.getItem('os_wallpaper_mode');
    if (savedMode === 'video') enableVideo(false);
    else disableVideo(false);

})();
