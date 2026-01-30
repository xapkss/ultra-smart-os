/* FILENAME: addon-search.js
   PURPOSE: ULTRA Search Widget (Glassmorphism HUD)
   VERSION: 3.0 (Pro UI)
*/

(function() {
    // 1. Check Conflicts
    if (document.getElementById('os-search-widget')) return;

    // 2. ULTRA CSS (Cyber-Glass Design)
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- MAIN BAR --- */
        #os-search-widget {
            position: fixed;
            top: 20%; left: 50%;
            transform: translateX(-50%);
            width: 90%; max-width: 650px;
            height: 60px;
            background: rgba(15, 15, 15, 0.6); /* Dark Glass */
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            display: flex; align-items: center;
            padding: 0 20px;
            z-index: 999;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: grab;
        }
        
        /* Focus Glow Effect */
        #os-search-widget.focused {
            background: rgba(15, 15, 15, 0.8);
            border-color: rgba(66, 133, 244, 0.5); /* Google Blue Glow */
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        #os-search-widget:active { cursor: grabbing; scale: 0.98; }

        /* --- ICONS --- */
        .g-icon { width: 28px; height: 28px; margin-right: 15px; opacity: 0.8; transition: 0.3s; fill: #fff; }
        /* Colorize on Hover */
        #os-search-widget:hover .g-icon { fill: #4285F4; opacity: 1; }

        /* --- INPUT --- */
        #os-search-input {
            flex: 1; border: none; outline: none;
            background: transparent;
            font-size: 20px; color: #fff;
            font-weight: 300; letter-spacing: 0.5px;
            font-family: 'Segoe UI', sans-serif;
            height: 100%;
        }
        #os-search-input::placeholder { color: rgba(255,255,255,0.4); }

        /* --- MIC BUTTON --- */
        #os-mic-btn {
            width: 24px; height: 24px; cursor: pointer;
            fill: rgba(255,255,255,0.6); margin-left: 15px;
            transition: 0.3s;
        }
        #os-mic-btn:hover { fill: #fff; transform: scale(1.1); }
        #os-mic-btn.listening { animation: pulse 1.5s infinite; fill: #ea4335; }

        /* --- SUGGESTIONS (Floating HUD) --- */
        #os-suggestions {
            position: absolute; top: 70px; left: 0;
            width: 100%; 
            background: rgba(20, 20, 20, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(25px);
            overflow: hidden; display: none;
            flex-direction: column;
        }
        .s-item {
            padding: 14px 20px; cursor: pointer;
            font-size: 16px; color: rgba(255,255,255,0.9);
            display: flex; align-items: center; gap: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: background 0.2s;
        }
        .s-item:last-child { border-bottom: none; }
        .s-item:hover { background: rgba(255,255,255,0.1); padding-left: 25px; }
        .s-icon { font-size: 14px; opacity: 0.5; }

        @keyframes pulse { 0% { scale: 1; } 50% { scale: 1.2; } 100% { scale: 1; } }
    `;
    document.head.appendChild(style);

    // 3. HTML Structure
    const widget = document.createElement('div');
    widget.id = 'os-search-widget';
    widget.innerHTML = `
        <svg class="g-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        <input type="text" id="os-search-input" placeholder="Type to search..." autocomplete="off">
        <svg id="os-mic-btn" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        <div id="os-suggestions"></div>
    `;
    document.body.appendChild(widget);

    // 4. RESTORE & DRAG LOGIC (Same Logic, Better Performance)
    const savedPos = localStorage.getItem('os_search_pos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        widget.style.top = pos.top;
        widget.style.left = pos.left;
        widget.style.transform = 'none';
    }

    const input = document.getElementById('os-search-input');
    const mic = document.getElementById('os-mic-btn');
    const suggestionsBox = document.getElementById('os-suggestions');

    // Drag Logic
    let isDragging = false, startX, startY, initialLeft, initialTop;
    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, {passive: false});

    function startDrag(e) {
        if (e.target === input || e.target === mic) return;
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        startX = clientX; startY = clientY;
        const rect = widget.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;
        widget.style.transform = 'none';
        widget.style.left = initialLeft + 'px'; widget.style.top = initialTop + 'px';
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, {passive: false});
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        widget.style.left = `${initialLeft + (clientX - startX)}px`;
        widget.style.top = `${initialTop + (clientY - startY)}px`;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        localStorage.setItem('os_search_pos', JSON.stringify({ top: widget.style.top, left: widget.style.left }));
    }

    // 5. SEARCH & GLOW LOGIC
    input.addEventListener('focus', () => widget.classList.add('focused'));
    input.addEventListener('blur', () => {
        widget.classList.remove('focused');
        // Delay hide to allow clicks on suggestions
        setTimeout(() => suggestionsBox.style.display = 'none', 200);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(input.value);
    });

    // 6. SMART AI-LIKE QUOTES SUGGESTIONS (OFFLINE • HUMAN • ADAPTIVE)

// === MOOD ENGINE ===
function getCurrentMood() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "calm";
  if (h >= 11 && h < 17) return "motivational";
  if (h >= 17 && h < 20) return "calm";
  return "night";
}

function getTodayKey() {
  return new Date().toISOString().slice(0,10);
}

// === USER PREFERENCE MEMORY ===
const USER_MOOD_KEY = "ultra_user_mood";

function getUserMood() {
  const saved = JSON.parse(localStorage.getItem(USER_MOOD_KEY) || "{}");
  if (saved.day !== getTodayKey()) return null;
  return saved.mood || null;
}

function saveUserMood(mood) {
  localStorage.setItem(
    USER_MOOD_KEY,
    JSON.stringify({ day: getTodayKey(), mood })
  );
}

const quotePools = {
  letters: {
    A:["Aaj thoda heavy lag raha hai, par tu weak nahi hai","Aage ka rasta dheere khulta hai, trust rakh","Akele rehna bhi ek skill hai","Aaj ka effort silent hai, result loud hoga","Apni pace me chalna bhi jeet hai"],
    B:["Bas rukna mat, chahe slow ho","Bheed se alag chalna padta hai kuch banne ke liye","Bure din filter jaise hote hain","Break lena theek hai, give up nahi","Bharosa khud pe rakho"],
    C:["Calm rehna bhi ek power hai","Chhoti progress bhi progress hoti hai","Control emotions, dreams nahi","Confidence shor nahi karta","Chal raha hai, wahi kaafi hai"],
    D:["Darr ka matlab hai growth start ho rahi hai","Dheere hi sahi, rukna nahi","Dil thak sakta hai, par hausla nahi","Discipline mood ka wait nahi karta","Dreams ko roz thoda paani do"],
    E:["Energy khatam ho sakti hai, hope nahi","Ek din sab clear lagega","Expect kam, effort zyada","Emotions ko samjho, dabao mat","Easy nahi hai, par worth it hai"],
    F:["Focus aaj ka kaam","Feelings temporary hoti hain","Failure feedback hota hai","Farak padta hai tu koshish karta hai","Forward hi ek option hai"],
    G:["Growth silent hoti hai","Galtiyaan teacher hoti hain","Give up ka option mat rakho","Grounded rehna bhi strength hai","Good things take time"],
    H:["Halka reh, bhaari mat soch","Hard days character banate hain","Himmat matlab dar ke baad bhi chalna","Heal hone ko time lagta hai","Hope chhodna mat"],
    I:["Itna bhi bura nahi hai jitna lag raha","Improve daily, compare nahi","Inner peace expensive nahi hoti","Intentions saaf rakho","It will make sense later"],
    J:["Jitna control chhodoge utna halka lagega","Journey perfect nahi hoti","Just keep moving","Jazba zinda rakho","Jeet process follow karti hai"],
    K:["Khud se baat karna seekho","Kuch cheezein waqt pe chhodni hoti hain","Khamoshi bhi jawab hoti hai","Keep going, even quietly","Khud pe doubt normal hai"],
    L:["Life straight line nahi hoti","Late hona fail hona nahi","Little wins matter","Light rehna bhi ek art hai","Learn and let go"],
    M:["Mood nahi, mission follow karo","Man thak jata hai kabhi kabhi","Mehnat dikhti nahi, mehsoos hoti hai","Mind ko rest bhi chahiye","Move at your speed"],
    N:["Normal feel nahi ho raha? it’s okay","No rush, no pressure","Nazar process pe rakho","Not every day needs victory","Naye din naye chances"],
    O:["Overthinking signal hai rest ka","One step is enough","Old patterns todna mushkil hota hai","Okay rehna bhi progress hai","Own your pace"],
    P:["Progress loud nahi hoti","Patience underrated hai","Pressure grow bhi karata hai","Pause bhi strategy hai","Present pe focus rakho"],
    Q:["Question karna growth hai","Quiet work matters","Quality over noise","Questions clarity laate hain","Quit sirf doubt ko karo"],
    R:["Rest lena weakness nahi","Routine freedom deta hai","Results time lete hain","Reset bhi zaroori hai","Real growth boring lagti hai"],
    S:["Slow chalna safe hai","Self-respect first","Strong banna loud nahi hota","Samajh aane me time lagta hai","Stick with it"],
    T:["Thakna allowed hai","Trust the process","Time sab sikha deta hai","Tension future ka tax hai","Take it easy"],
    U:["Ups and downs normal hain","Unlearn bhi zaroori hai","Umeed zinda rakho","You’re not behind","Use your energy wisely"],
    V:["Vibe important hai","Value khud se shuru hoti hai","Victory patient logon ko milti hai","Vision clear rakho","Very human to feel lost"],
    W:["Waqt lagega, par milega","Worth it hoga","Work quietly","Worry kam karo","Win slow bhi win hai"],
    X:["Xtra effort aaj ka edge hai","X-factor consistency hai","Xpect setbacks","Xplore calmly","Xhale stress"],
    Y:["You’re doing better than you think","Yahin se start hota hai","Your pace is valid","Yakeen rakho","You’ll be fine"],
    Z:["Zindagi rush nahi hai","Zero motivation days bhi part hain","Zyada sochna mat","Zameen pe reh, aasman khulega","Zaroori hai rukna nahi"]
  },
  numbers: {
    0:["Zero se hi sab shuru hota hai 😄","Aaj enjoy karo","Khushi free hai","Muskurana power hai","Light mood best mood"],
    1:["Ek ho to strong bano 🔥","Leader banne ko awaaz nahi soch chahiye","Khud pe khade raho","Silence powerful hota hai","One step ahead"],
    2:["Balance rakho 🌿","Thoda enjoy thoda kaam","Mood sahi ho to din apna","Life vibe hai race nahi","Smile more"],
    3:["Energy high rakho 😄","Masti bhi zaroori hai","Dil halka rakho","Enjoy small things","Positive reh"],
    4:["Strong base banao","Consistency jeet dilati hai","Mehnat ka number","Stable reh","Solid effort"],
    5:["Change healthy hota hai","Flow me raho","Refresh yourself","Movement zaroori hai","Life dynamic hai"],
    6:["Dil se jiyo ❤️","Family vibes strong","Care karna strength hai","Warm reh","Khushi baanto"],
    7:["Shant reh 🌌","Inner peace priority","Depth matters","Slow and mindful","Soul time"],
    8:["Power mode on 🔥","Focus sharp rakho","Ambition achhi cheez hai","Rise strong","Boss energy"],
    9:["Completion ka sukoon","Grateful reh","Cycle complete hota hai","Respect the journey","Smile end tak"]
  }
};

const quoteState = {};

// === PICK QUOTES (SMART) ===
function pickQuotes(key, pool) {
  const systemMood = getCurrentMood();
  const userMood = getUserMood();
  const activeMood = userMood || systemMood;

  let filtered = pool;

  if (activeMood === "night") {
    filtered = pool.filter(q =>
      /zindagi|khamosh|raat|shant|andar|alone|slow/i.test(q)
    );
    if (filtered.length < 2) filtered = pool;
  }

  if (!quoteState[key] || quoteState[key].length === 0) {
    quoteState[key] = [...filtered].sort(() => Math.random() - 0.5);
  }

  return quoteState[key].splice(0, 2);
}

// === RENDER ===
function renderQuotes(val) {
  const isNum = /^[0-9]/.test(val);
  const key = isNum ? val[0] : val[0].toUpperCase();
  const pool = isNum ? quotePools.numbers[key] : quotePools.letters[key];
  if (!pool) return suggestionsBox.style.display = 'none';

  const quotes = pickQuotes(key, pool);
  suggestionsBox.innerHTML = '';

  quotes.forEach(q => {
    const d = document.createElement('div');
    d.className = 's-item';
    d.innerHTML = `<span class="s-icon">🔍</span> ${q}`;
    d.onmousedown = () => showGoodChoice(val);
    suggestionsBox.appendChild(d);
  });

  suggestionsBox.style.display = 'flex';
}

// === CLICK FEEDBACK ===
function showGoodChoice(val) {
  saveUserMood(getCurrentMood());
  suggestionsBox.innerHTML =
    `<div class="s-item"><span class="s-icon">✨</span> Good Choice 🥰</div>`;
  setTimeout(() => renderQuotes(val), 500);
}

// === INPUT LISTENER ===
input.addEventListener('input', () => {
  const v = input.value.trim();
  if (!v) return suggestionsBox.style.display = 'none';

  if (/^[a-zA-Z]+$/.test(v) || /^[0-9]+$/.test(v)) {
    renderQuotes(v);
  } else {
    suggestionsBox.style.display = 'none';
  }
});

    // 7. VOICE (Same logic)
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        mic.onclick = () => {
            mic.classList.add('listening');
            input.placeholder = "Listening...";
            recognition.start();
        };
        recognition.onresult = (e) => {
            const txt = e.results[0][0].transcript;
            input.value = txt;
            mic.classList.remove('listening');
            performSearch(txt);
        };
    } else { mic.style.display = 'none'; }

    if(window.UltraOS) UltraOS.log("Ultra Search HUD Loaded");

})();
