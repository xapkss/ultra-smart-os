/* FILENAME: addon-boot.js
   PURPOSE: Startup Boot Animation & Sound
*/

(function() {
    // 1. CHECK SESSION (Har baar dikhana hai ya sirf ek baar?)
    // Agar har baar dikhana hai to niche wali line delete kar do.
    if (sessionStorage.getItem('os_booted')) return; 

    // 2. STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        #os-boot-screen {
            position: fixed; inset: 0;
            background: #000; z-index: 99999;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            color: white; font-family: 'Segoe UI', sans-serif;
        }
        .boot-logo {
            font-size: 40px; font-weight: 800; letter-spacing: 2px;
            background: linear-gradient(45deg, #4285f4, #a6c8ff);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 20px; animation: glow 2s infinite alternate;
        }
        .boot-loader {
            width: 200px; height: 4px; background: #333;
            border-radius: 10px; overflow: hidden; position: relative;
        }
        .boot-bar {
            width: 0%; height: 100%; background: #4285f4;
            box-shadow: 0 0 10px #4285f4;
            transition: width 2.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .boot-text {
            margin-top: 10px; font-size: 12px; color: #666; font-family: monospace;
        }
        @keyframes glow { from {filter: drop-shadow(0 0 5px rgba(66,133,244,0.5));} to {filter: drop-shadow(0 0 20px rgba(66,133,244,0.8));} }
        @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
    `;
    document.head.appendChild(style);

    // 3. UI
    const screen = document.createElement('div');
    screen.id = 'os-boot-screen';
    screen.innerHTML = `
        <div class="boot-logo">ULTRA OS</div>
        <div class="boot-loader"><div class="boot-bar" id="boot-bar"></div></div>
        <div class="boot-text" id="boot-text">INITIALIZING KERNEL...</div>
    `;
    document.body.appendChild(screen);

    // 4. ANIMATION SEQUENCE
    setTimeout(() => {
        document.getElementById('boot-bar').style.width = '100%';
        document.getElementById('boot-text').innerText = "LOADING MODULES...";
        
        // Play Sound (Beep)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Sound Pitch
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
        oscillator.stop(audioCtx.currentTime + 0.5);

    }, 100);

    setTimeout(() => {
        document.getElementById('boot-text').innerText = "SYSTEM READY";
    }, 2000);

    setTimeout(() => {
        screen.style.animation = "fadeOut 0.5s forwards";
        setTimeout(() => screen.remove(), 600);
        sessionStorage.setItem('os_booted', 'true'); // Flag set
    }, 2800);

})();
