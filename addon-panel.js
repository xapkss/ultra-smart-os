/* FILENAME: addon-panel.js
   PURPOSE: Control Panel (Video + Password Manager)
*/

(function() {
    // 1. CONFIGURATION
    const CONFIG = {
        image: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/pic.png",
        video: "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/my.mp4",
        aboutTitle: "Ultra OS v2.1",
        aboutText: "Advanced Web OS with Cloud Gallery & Security Layer.",
        devName: "DRx Shishupal"
    };

    if (document.getElementById('os-ctrl-btn')) return;

    // 2. STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        #os-ctrl-btn {
            position: absolute; top: 80px; right: 20px;
            width: 50px; height: 50px;
            background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px; cursor: pointer; backdrop-filter: blur(15px); z-index: 100;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); color: #fff; font-size: 22px;
            transition: 0.3s;
        }
        #os-ctrl-btn:hover { transform: scale(1.1); background: rgba(66, 133, 244, 0.8); }

        #os-panel {
            position: absolute; top: 80px; right: 85px; width: 280px;
            background: rgba(18, 18, 18, 0.95); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 20px; backdrop-filter: blur(30px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.8); z-index: 101;
            display: none; flex-direction: column; gap: 12px;
            animation: slideIn 0.2s ease forwards; color: white;
        }
        .panel-header { font-size: 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 5px; }
        .panel-text { font-size: 12px; color: #aaa; line-height: 1.4; margin-bottom: 5px; }
        .panel-btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);
            padding: 12px; border-radius: 10px; color: white; cursor: pointer;
            font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: 0.2s;
        }
        .panel-btn:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.2); }
        .btn-video { color: #8ab4f8; } .btn-reset { color: #ff8b8b; } .btn-pass { color: #ffd700; }
        .dev-sig { margin-top: 15px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #444; font-weight: 700; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
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
        
        <button class="panel-btn btn-video" id="p-set-video">🎥 Live Wallpaper</button>
        <button class="panel-btn btn-reset" id="p-reset" style="display:none;">🔄 Reset Wallpaper</button>
        <button class="panel-btn btn-pass" id="p-pass">🔐 Change Password</button>
        <button class="panel-btn" id="p-hide-ui">👁️ Hide Button</button>
        
        <div class="dev-sig">Developer<br>${CONFIG.devName}</div>
    `;
    document.body.appendChild(panel);

    // 4. LOGIC
    const ui = {
        btn: document.getElementById('os-ctrl-btn'),
        panel: document.getElementById('os-panel'),
        btnVid: document.getElementById('p-set-video'),
        btnReset: document.getElementById('p-reset'),
        btnPass: document.getElementById('p-pass'),
        btnHide: document.getElementById('p-hide-ui'),
        bgImg: document.getElementById('bg-img'),
        bgVid: document.getElementById('bg-vid')
    };

    // Toggle Panel
    ui.btn.onclick = () => ui.panel.style.display = (ui.panel.style.display === 'flex' ? 'none' : 'flex');

    // Wallpaper Logic
    function setVideo(save=true) {
        ui.bgVid.muted = true; ui.bgVid.src = CONFIG.video;
        ui.bgImg.classList.remove('active-bg'); ui.bgVid.classList.add('active-bg');
        ui.bgVid.play().catch(()=>{});
        ui.btnVid.style.display='none'; ui.btnReset.style.display='flex';
        if(save) localStorage.setItem('os_wallpaper_mode', 'video');
    }
    function setImage(save=true) {
        ui.bgVid.pause(); ui.bgVid.classList.remove('active-bg'); ui.bgImg.classList.add('active-bg');
        if(!ui.bgImg.src) ui.bgImg.src = CONFIG.image;
        ui.btnReset.style.display='none'; ui.btnVid.style.display='flex';
        if(save) localStorage.setItem('os_wallpaper_mode', 'image');
    }
    
    ui.btnVid.onclick = () => setVideo(true);
    ui.btnReset.onclick = () => setImage(true);
    ui.btnHide.onclick = () => { ui.panel.style.display='none'; ui.btn.style.display='none'; };

    // --- NEW: CHANGE PASSWORD LOGIC ---
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

    // Auto-Run Memory Check
    const savedMode = localStorage.getItem('os_wallpaper_mode');
    if (savedMode === 'video') setVideo(false); else { ui.bgImg.src = CONFIG.image; ui.bgImg.classList.add('active-bg'); }

})();
