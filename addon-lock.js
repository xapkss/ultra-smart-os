/* FILENAME: addon-lock.js
   PURPOSE: Security Lock Screen (Custom PIN Support)
*/

(function() {
    // 1. CONFIGURATION (Get from Memory or Default '1234')
    const savedPin = localStorage.getItem('os_user_pin');
    const CORRECT_PIN = savedPin ? savedPin : "1234"; 
    
    // Session check
    if (sessionStorage.getItem('os_unlocked')) return;

    // 2. STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        #os-lock-screen {
            position: fixed; inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(25px);
            z-index: 99990; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            color: white; font-family: 'Segoe UI', sans-serif;
            transition: 0.5s;
        }
        .lock-avatar {
            width: 100px; height: 100px; border-radius: 50%;
            background: #111; border: 2px solid rgba(255,255,255,0.2);
            margin-bottom: 20px; display: flex; align-items: center; justify-content: center;
            font-size: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }
        .lock-title { font-size: 22px; font-weight: 600; margin-bottom: 25px; letter-spacing: 1px; }
        .pin-input {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 12px 20px; border-radius: 50px;
            color: white; font-size: 24px; letter-spacing: 8px;
            text-align: center; width: 160px; outline: none; transition: 0.3s;
        }
        .pin-input:focus { background: rgba(255, 255, 255, 0.15); border-color: #4285f4; width: 180px; }
        .pin-input::placeholder { font-size: 14px; letter-spacing: 1px; opacity: 0.5; }
        .lock-msg { margin-top: 20px; font-size: 13px; height: 15px; color: #ff5f57; opacity: 0; transition: 0.3s; font-weight: 600; }
        
        .unlock-btn {
            margin-top: 25px; padding: 12px 35px;
            background: linear-gradient(135deg, #4285f4, #2b5cbf);
            color: white; border: none; border-radius: 30px;
            cursor: pointer; font-weight: 700; font-size: 14px;
            box-shadow: 0 5px 15px rgba(66, 133, 244, 0.4);
            transition: 0.2s;
        }
        .unlock-btn:hover { transform: scale(1.05); }
    `;
    document.head.appendChild(style);

    // 3. UI
    const screen = document.createElement('div');
    screen.id = 'os-lock-screen';
    screen.innerHTML = `
        <div class="lock-avatar">🔒</div>
        <div class="lock-title">System Locked</div>
        <input type="password" id="os-pin" class="pin-input" placeholder="PIN" maxlength="4" autofocus>
        <div class="lock-msg" id="lock-msg">Incorrect PIN</div>
        <button class="unlock-btn" id="unlock-btn">UNLOCK</button>
    `;
    document.body.appendChild(screen);

    // 4. LOGIC
    const pinInput = document.getElementById('os-pin');
    const msg = document.getElementById('lock-msg');
    
    function attemptUnlock() {
        if (pinInput.value === CORRECT_PIN) {
            msg.style.color = '#4caf50'; msg.innerText = "ACCESS GRANTED"; msg.style.opacity = 1;
            setTimeout(() => {
                screen.style.opacity = '0'; screen.style.transform = 'scale(1.1)';
                setTimeout(() => screen.remove(), 500);
                sessionStorage.setItem('os_unlocked', 'true');
            }, 300);
        } else {
            msg.style.color = '#ff5f57'; msg.innerText = "WRONG PIN"; msg.style.opacity = 1;
            pinInput.value = '';
            pinInput.style.transform = 'translateX(10px)';
            setTimeout(() => pinInput.style.transform = 'translateX(-10px)', 50);
            setTimeout(() => pinInput.style.transform = 'translateX(0)', 100);
        }
    }

    document.getElementById('unlock-btn').onclick = attemptUnlock;
    pinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptUnlock(); });
    screen.onclick = (e) => { if(e.target === screen) pinInput.focus(); };

})();
