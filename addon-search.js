/* =========================================================
   ULTRA GLASS SEARCH — VOICE EDITION (AUTO-RESPONSIVE)
   ========================================================= */

(function () {
    // Prevent duplicate injection
    if (document.getElementById("os-search-widget")) return;

    /* ================= CSS ================= */
    const style = document.createElement("style");
    style.textContent = `
    /* --- Base Variables & Reset --- */
    #os-search-widget-wrapper * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* --- Main Widget (Glassmorphism & Auto-Responsive) --- */
    #os-search-widget {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%); 
        
        /* AUTO-RESPONSIVE WIDTH LOGIC */
        width: 90%;           /* Mobile par 90% width lega (Compact) */
        max-width: 650px;     /* Desktop par 650px se zyada nahi failega (Wide) */
        
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        z-index: 9999;

        /* GLASSMORPHISM STYLE */
        background: rgba(30, 30, 30, 0.65);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4), 
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        
        border-radius: 20px;
        transition: transform 0.1s;
        color: #fff;
    }

    /* Drag Handle Cursor */
    #os-search-widget.draggable { cursor: grab; }
    #os-search-widget.dragging {
        cursor: grabbing;
        transform: scale(0.99) !important;
        user-select: none;
    }

    /* --- Input Field --- */
    #os-search-input {
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-size: 18px;
        color: rgba(255, 255, 255, 0.95);
        font-weight: 400;
        letter-spacing: 0.5px;
    }
    #os-search-input::placeholder { color: rgba(255, 255, 255, 0.4); transition: color 0.3s;}

    /* --- Mic Button 🎤 --- */
    #os-mic-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0.7;
        transition: 0.2s all ease;
        margin-left: 10px;
        background: rgba(255,255,255,0.05);
    }
    #os-mic-btn:hover {
        background: rgba(255,255,255,0.15);
        opacity: 1;
    }
    #os-mic-btn svg {
        fill: #fff;
        width: 20px;
        height: 20px;
        transition: fill 0.3s;
    }

    /* Listening State Animation */
    #os-mic-btn.listening {
        background: rgba(234, 67, 53, 0.2); /* Reddish tint */
        animation: micPulse 1.5s infinite;
    }
    #os-mic-btn.listening svg { fill: #ea4335; /* Google Red */ }
    
    @keyframes micPulse {
        0% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(234, 67, 53, 0); }
        100% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
    }


    /* --- Suggestions Dropdown --- */
    #os-suggestions {
        position: absolute;
        top: 72px; left: 0; width: 100%;
        display: none;
        flex-direction: column;
        background: rgba(25, 25, 25, 0.85);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .s-item {
        padding: 14px 20px;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.8);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: background 0.2s;
    }
    .s-item:last-child { border-bottom: none; }
    .s-item:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
    `;
    document.head.appendChild(style);

    /* ================= HTML STRUCTURE ================= */
    const wrapper = document.createElement("div");
    wrapper.id = "os-search-widget-wrapper";
    
    // Main Widget HTML (Settings removed, Mic added)
    wrapper.innerHTML = `
        <div id="os-search-widget" class="draggable">
            <input id="os-search-input" type="text" placeholder="Search or speak..." autocomplete="off" />
            
            <div id="os-mic-btn" title="Voice Search">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </div>

            <div id="os-suggestions"></div>
        </div>
    `;
    
    document.body.appendChild(wrapper);

    /* ================= ELEMENTS ================= */
    const widget = document.getElementById("os-search-widget");
    const input = document.getElementById("os-search-input");
    const suggestions = document.getElementById("os-suggestions");
    const micBtn = document.getElementById("os-mic-btn");

    /* ================= VOICE SEARCH LOGIC 🎤 ================= */
    // Check browser support for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after one sentence
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default language

        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            micBtn.classList.add('listening');
            input.placeholder = "Listening...";
            input.focus();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            // Manually trigger input event so suggestions logic runs
            input.dispatchEvent(new Event('input'));
            
            micBtn.classList.remove('listening');
            input.placeholder = "Search or speak...";
        };

        recognition.onend = () => {
            micBtn.classList.remove('listening');
            if(input.placeholder === "Listening...") {
                 input.placeholder = "Search or speak...";
            }
        };

        recognition.onerror = (event) => {
            console.log("Speech recognition error: " + event.error);
            micBtn.classList.remove('listening');
            input.placeholder = "Error. Try again.";
            setTimeout(() => { input.placeholder = "Search or speak..."; }, 2000);
        };

    } else {
        // If speech API is not supported by the browser, hide the mic button
        micBtn.style.display = 'none';
        input.placeholder = "Search...";
        console.warn("Web Speech API not supported in this browser.");
    }


    /* ================= DRAG LOGIC (Same as before) ================= */
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const preventSelect = (e) => e.preventDefault();

    function startDrag(e) {
        // Ignore if clicking input or mic button
        if (e.target === input || e.target.closest('#os-mic-btn')) return;

        isDragging = true;
        widget.classList.add('dragging');
        
        const rect = widget.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        offset.x = clientX - rect.left;
        offset.y = clientY - rect.top;

        const computedStyle = window.getComputedStyle(widget);
        if (computedStyle.transform !== 'none') {
            widget.style.left = rect.left + 'px';
            widget.style.top = rect.top + 'px';
            widget.style.transform = 'none';
        }

        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        document.addEventListener('selectstart', preventSelect);
    }

    function moveDrag(e) {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        widget.style.left = (clientX - offset.x) + 'px';
        widget.style.top = (clientY - offset.y) + 'px';
        if(e.preventDefault) e.preventDefault(); 
    }

    function endDrag() {
        isDragging = false;
        widget.classList.remove('dragging');
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('selectstart', preventSelect);
    }

    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, { passive: false });

    /* ================= SUGGESTIONS LOGIC (Same as before) ================= */
    const quotePools = {
        letters: {
                      A: [
  "Aaj thoda heavy lag raha hai, par tu weak nahi hai 💪🫂",
  "Aage ka rasta dheere khulta hai, trust rakh 🚀✨",
  "Akele rehna bhi ek skill hai, enjoy your company 🏞️💭",
  "Aaj ka effort silent hai, result loud hoga 🤫🏆🔥",
  "Apni pace me chalna bhi jeet hai 🐢👑",
  "Asli growth uncomfortable hoti hai, aur ye normal hai 🌱😌",
  "Action hi anxiety ka sabse bada killer hai 🏃‍♂️💥",
  "Apne aap ko maaf karna bhi aage badhna hai 🤍🕊️",
  "Abhi dhundhla hai, par picture clear hogi 🔍🌄",
  "Aaj toot kar bhi khada hai, ye kam baat nahi 🧱❤️",
  "Andar ka warrior thaka hai, haara nahi 🛡️🔥",
  "Aansoo bhi kabhi kabhi strength hote hain 😢💎",
  "Aaj survive kiya, kal shine karega ✨☀️",
  "Apni kahani ka hero tu khud hai 🎬🦸‍♂️",
  "Aakhri saans tak hope zinda rakh 🌈❤️‍🔥"
],

B: [
  "Bas rukna mat, chahe slow ho 🚶‍♂️➡️",
  "Bheed se alag chalna padta hai kuch banne ke liye 🐺🌌",
  "Bure din filter jaise hote hain, asliyat dikhate hain 🎭🔍",
  "Break lena theek hai, give up nahi ☕🫂",
  "Bharosa khud pe rakho, baaki sab shor hai 🔇❤️",
  "Badlav darr lagata hai par wahi zaroori hai 🔄🔥",
  "Behtar banne ki ladai khud se hai, duniya se nahi 🥊🪞",
  "Bohot sochna band kar, bas pehla step le 👣⚡",
  "Bina thokar khaye, balance nahi seekha jata 🤕⚖️",
  "Bas ek din aur, phir ek aur 🌅⏳",
  "Broken feel karna weak hona nahi hota 💔🧠",
  "Bharosa waqt pe rakho, jawab milega ⏰✨",
  "Bina awaaz ke bhi tu bohot kuch jeet raha hai 🤍🏆",
  "Bura phase bhi teacher hota hai 📖🔥",
  "Bas zinda rehna bhi kabhi kabhi victory hoti hai 🫀👑"
],

C: [
  "Calm rehna bhi ek power hai 🧘‍♂️⚡",
  "Chhoti progress bhi progress hoti hai 🐾📈",
  "Control emotions, dreams nahi 🎯❤️",
  "Confidence shor nahi karta, wo silent hota hai 🤫🖤",
  "Chal raha hai, wahi kaafi hai abhi ke liye 🚶‍♀️🌱",
  "Consistency mood par nahi, discipline par chalti hai ⏱️🧠",
  "Comparison khushi ka chor hai, mat kar 🛑😌",
  "Chaos me shant rehna hi asli flex hai 🌪️😎",
  "Clear mind, sharp focus, steady heart 🧠🎯❤️",
  "Chupchaap mehnat bhi roar ban jaati hai 🐯🔥",
  "Confidence tab aata hai jab tu khud se jhooth nahi bolta 🤍🪞",
  "Chhoti jeetein future ka base hoti hain 🧱✨",
  "Calm rehkar liya gaya decision strongest hota hai 🧘‍♀️⚔️",
  "Consistency hi self-respect banati hai 👑🛤️",
  "Chalna band mat kar, chahe raste badlein 🛣️🌄"
],

D: [
  "Dheere hi sahi, rukna nahi 🐢🔥",
  "Dil thak sakta hai, par hausla nahi ❤️‍🔥🛡️",
  "Discipline mood ka wait nahi karta ⏰⚔️",
  "Dreams ko roz thoda paani do 🌱💧",
  "Duniya kya kahegi, ye sochna tera kaam nahi 🚫🗣️",
  "Difficult roads often lead to beautiful destinations 🛣️🏔️",
  "Doubt kills more dreams than failure ever will ❌💭",
  "Dard temporary hai, pride forever rahega 💥👑",
  "Do din kamzor lagna, zindagi haarna nahi hota 🫂⏳",
  "Dil se ki gayi mehnat kabhi waste nahi jaati ❤️📦",
  "Dark phase bhi direction dikhata hai 🌑➡️🌅",
  "Dheere dheere hi sahi, par tu ban raha hai 🔨✨",
  "Decision lene ka darr, regret se chhota hota hai ⚖️🔥",
  "Dum hai tujhme, bas yaad dilane ki zarurat hai 🦁❤️"
],

E: [
  "Energy khatam ho sakti hai, hope nahi ⚡🌈",
  "Ek din sab clear lagega, bas chalte raho 🌄🚶‍♂️",
  "Expect kam, effort zyada, peace maximum 🧠🕊️",
  "Emotions ko samjho, dabao mat ❤️🫂",
  "Easy nahi hai, par worth it hai 🥵🏆",
  "Every step counts, even the backward ones 👣🔁",
  "Ek waqt me ek hi cheez, multitasking mat kar 🎯⛔",
  "Effort kabhi waste nahi jata, store hota hai 📦🔥",
  "Empty cup hi bhar sakta hai, seekhne ko ready raho ☕📚",
  "Exhausted hona proof hai ki tu try kar raha hai 😮‍💨💪",
  "Ek chhota sa faith, bada farq laata hai 🤍✨",
  "Emotional hona weak hona nahi hota 🧠❤️",
  "End slow ho sakta hai, par strong hoga 🛤️🔥",
  "Ek din tera patience jawab banega ⏳🏅",
  "Energy wapas aa jayegi, direction mat khona 🧭⚡"
],

F: [
  "Focus aaj ka kaam, kal ki chinta nahi 🎯🧘‍♂️",
  "Feelings temporary hoti hain, goals permanent 🫀🏆",
  "Failure feedback hota hai, end nahi ❌➡️📘",
  "Farak padta hai ki tu koshish kar raha hai ❤️🔥",
  "Forward hi ek option hai, peeche mat dekh ➡️🚫",
  "Fear sirf ek thought hai, reality nahi 🧠❌",
  "Fake it till you make it? Nahi, Face it till you make it 😤⚔️",
  "Finish what you start, aadha mat chhod 🏁🔥",
  "Foundations time leti hain banne me 🧱⏳",
  "Fallen feel karna bhi human hai, uthna hero banata hai 🦸‍♂️💥",
  "Faith self se shuru hota hai 🙏❤️",
  "Focus toot jaye to bhi direction yaad rakh 🧭✨",
  "Fear ke uss paar hi growth baithi hoti hai 🚪🌱",
  "Fight roz ka hai, par tu akela nahi 🫂⚔️",
  "Future tera wait kar raha hai, give up mat kar 🌅👑"
],
G: [
  "Growth silent hoti hai, shor mat macha 🌱🤫",
  "Galtiyaan teacher hoti hain, dushman nahi 📘❤️",
  "Give up ka option mat rakho, rasta badlo 🔁🔥",
  "Grounded rehna bhi strength hai 🌍💪",
  "Good things take time, jaldi ka kaam kachcha ⏳🍃",
  "Goals bade hain to sacrifice bhi bada hoga 🎯🔥",
  "Guroor nahi, gratitude rakh 🙏✨",
  "Game abhi khatam nahi hua, tu abhi hara nahi 🎮🛑",
  "Greatness comfortable zone me nahi milti 🚪🔥",
  "Growth dard ke bina complete nahi hoti 🌱💢",
  "Girte rehna fail hona nahi hota 🤕➡️🧠",
  "Gehri saans le, tu sambhal lega 😮‍💨🫂",
  "Gussa signal hai, decision nahi 🚦🧠",
  "Gum bhi tujhe strong banane aaye hain 🛡️❤️",
  "Ghabrana allowed hai, rukna nahi 😨➡️🚶‍♂️",
  "Genuine effort kabhi ignore nahi hota 📦✨",
  "Galat phase bhi ek chapter hi hota hai 📖🌑",
  "Grow kar raha hai tu, bhale slow hi sahi 🐢🌱",
  "Gravity jaisa waqt hai, jhukna padta hai par tootna nahi 🌍🛡️",
  "Give yourself credit, tu zinda khada hai 👏❤️‍🔥"
],

H: [
  "Halka reh, bhaari mat soch ☁️🧠",
  "Hard days character banate hain 🔨👑",
  "Himmat matlab dar ke baad bhi chalna 😨➡️🚶‍♂️",
  "Heal hone ko time lagta hai, jaldbaazi mat kar 🩹⏳",
  "Hope chhodna mat, miracle kabhi bhi ho sakta hai 🌈✨",
  "Hamesha jeetna zaroori nahi, seekhna zaroori hai 📘🔥",
  "Head down, hustle hard, stay humble 👇💼🙏",
  "Heavy dil ke saath bhi chalna bravery hai ❤️‍����🛡️",
  "Haqeeqat sapno se zyada sundar banegi 🌄✨",
  "Haar ke baad uthna hi asli power hai 🧱⚡",
  "Har din same strong feel karna zaroori nahi 😮‍💨🤍",
  "Himmat ka matlab perfect hona nahi hota 💪🫂",
  "Healing linear nahi hoti, ups-downs aate hain 📈📉",
  "Haalat tujhe define nahi karte, tu unhe karta hai 🧠👑",
  "Hamesha answer nahi milta, par direction milti hai 🧭✨",
  "Hustle dikhta kam hai, par kaam zyada karta hai 🔥🤫",
  "Halka sa faith bhi kaafi hota hai 🙏💫",
  "Heart toot sakta hai, spirit nahi 💔🔥",
  "Har subah ek naya chance hota hai 🌅♻️",
  "Hold on, ye phase bhi nikal jayega 🫂⏳"
],

I: [
  "Itna bhi bura nahi hai jitna dimaag bata raha hai 🧠❌",
  "Improve daily, compare nahi 📈🚫",
  "Inner peace expensive nahi hoti, bas rare hoti hai 🕊️💎",
  "Intentions saaf rakho, raste apne aap banenge 🧭✨",
  "It will make sense later, abhi bas dot connect kar 🔗⏳",
  "Impossible sirf ek opinion hai, fact nahi 🚫🧠",
  "Ignore the noise, trust the vibe 🔇💫",
  "Invest in yourself, best return milega 💼📈",
  "Insaan hai tu, machine nahi, rest kar 🫂😴",
  "Inner battles bahar se dikhte nahi ⚔️🤍",
  "Improve hona process hai, pressure nahi 🛠️🌱",
  "Intuition kabhi kabhi logic se tez hoti hai 💭⚡",
  "Itna strong banna padta hai, koi option nahi 🛡️🔥",
  "Insecurity bhi human hai, sach bol rahi hoti hai 🪞🧠",
  "Impact dheere aata hai, par gehra hota hai 🌊✨",
  "Ignore nahi, observe kar 📡🧠",
  "Intent sahi ho to delay bhi blessing hota hai ⏳🙏",
  "Inner calm hi asli success hai 🧘‍♂️👑",
  "Itna sab handle kar raha hai tu, proud feel kar 👏❤️",
  "Izzat khud se shuru hoti hai 🤍👑"
],

J: [
  "Jitna control chhodoge utna halka lagega 🎈🫂",
  "Journey perfect nahi hoti, messy hoti hai 🛣️🎒",
  "Just keep moving, momentum ban jayega ➡️🔥",
  "Jazba zinda rakho, baki sab manage ho jayega ❤️‍🔥🛠️",
  "Jeet process follow karti hai, excitement nahi 🏁🧠",
  "Jawab waqt dega, tu bas sawaal mat chhod ⏳❓",
  "Judge mat kar, na khud ko na kisi aur ko 🚫⚖️",
  "Jo tera hai, wo tere paas aayega 🧲✨",
  "Junoon hai to rasta nikal hi aayega 🔥🛣️",
  "Jab thak jao, tab bhi rukna zaroori nahi 😮‍💨➡️",
  "Jo aaj heavy hai, kal strength banega 🏋️‍♂️🔥",
  "Jitna jhukoge, utna tootoge nahi 🌾🛡️",
  "Journey me doubt aana normal hai ❓🧠",
  "Just show up, kaafi hai aaj ke liye 👣🤍",
  "Jeene ka matlab sirf jeetna nahi hota 🌱❤️",
  "Jazba ho to resources mil jaate hain 🔥📦",
  "Jab koi saath na ho, tab khud ka haath pakad 🤝🫂",
  "Jo control me nahi, use chhod dena hi peace hai 🕊️🚪",
  "Jitna feel karta hai tu, utna hi real hai 💭❤️",
  "Jeet se pehle ka version hi hero hota hai 🦸‍♂️🔥"
],
K: [
  "Khud se baat karna seekho, dost ban jaoge 🪞❤️",
  "Kuch cheezein waqt pe chhodni hoti hain ⏳🍃",
  "Khamoshi bhi jawab hoti hai, samjho isse 🤫🧠",
  "Keep going, even quietly, koi dekh nahi raha to kya 🚶‍♂️🔥",
  "Khud pe doubt normal hai, par rukna mana hai ⚠️➡️",
  "Kismat hath ki lakiron me nahi, mehnat ke pasine me hai 💦✊",
  "Koshish karne walon ki haar nahi hoti 💪🏆",
  "Kal ka din naya mauka layega 🌅✨",
  "Knowledge power hai, par action magic hai 📚➡️✨",
  "Khud ko samajhna bhi ek journey hai 🛤️🧠",
  "Kuch zakhm dikhte nahi, par strong bana dete hain 🩹🛡️",
  "Kyun thaka hai ye bhi soch, sirf chalna hi kaafi nahi 🤍🧠",
  "Kadam chhota ho sakta hai, direction galat nahi 👣🧭",
  "Khaamosh mehnat hi sabse zyada bolti hai 🤫🔥",
  "Khud ko proof dena duniya ko nahi 🪞👑",
  "Kabhi kabhi rukna bhi self-respect hota hai 🛑🤍",
  "Kismat bhi mehnat dekh kar hi saath deti hai 🎯✨",
  "Khud se bhaagna band kar, wahi solution hai 🫂🧠",
  "Kuch battles sirf dil me ladni hoti hain ⚔️❤️",
  "Khud ka saath sabse strong hota hai 🤝🔥",
  "Kya slow hai, ye bhi growth hi hai 🐢🌱",
  "Kisi aur ka chapter dekh kar apna mat judge karo 📖🚫",
  "Khud pe bharosa wapas lana hi asli jeet hai 👑❤️",
  "Koshish roz ki hoti hai, jeet ek din ki 🗓️🏁",
  "Khada rehna hi kaafi hai, abhi 🧍‍♂️❤️‍🔥"
],

L: [
  "Life straight line nahi hoti, ups and downs rahenge 📉📈",
  "Late hona fail hona nahi, har kisi ka apna time zone hai ⏰🌍",
  "Little wins matter, unhe celebrate kar 🎉👣",
  "Light rehna bhi ek art hai ☁️🎨",
  "Learn and let go, bojh lekar mat chal 🎒🍃",
  "Log kya kahenge, ye sabse chhota rog hai 🗣️🚫",
  "Limit sirf dimaag me hoti hai 🧠🚧",
  "Listen to your gut, wo kabhi jhoot nahi bolta 👂✨",
  "Lost feel karna part of finding yourself hai 🧭💭",
  "Life pressure cooker nahi, saans le 🫁🫂",
  "Late bloomers bhi phool hi hote hain 🌸⏳",
  "Ladte rehna hi proof hai ki tu zinda hai ⚔️❤️",
  "Logic thak jaye to thoda feel bhi kar 💭❤️",
  "Life ko samajhne me waqt lagta hai, jaldi mat kar ⏳🧠",
  "Load kam kar, clarity badhegi 🎈🔍",
  "Luck bhi movement dekh kar aata hai 🚶‍♂️✨",
  "Life ka weight akela mat uthao 🤝🎒",
  "Learning zone uncomfortable hota hai 📘🔥",
  "Long run me patience hi jeetata hai 🏃‍♂️⏳",
  "Life tough hai, tu bhi tough hai 🛡️🔥",
  "Losing focus matlab losing nahi hota 🎯❌",
  "Let it hurt, phir let it heal 🩹🤍",
  "Light at the end real hoti hai, chalna padta hai 🚶‍♀️🌄",
  "Life ka pace tera hai, copy mat kar 🧭👑",
  "Likh kar rakh, tu is phase se bahar niklega ✍️✨"
],

M: [
  "Mood nahi, mission follow karo 🎯🔥",
  "Man thak jata hai kabhi kabhi, aur ye okay hai 😮‍💨🤍",
  "Mehnat dikhti nahi, mehsoos hoti hai results me 📦🏆",
  "Mind ko rest bhi chahiye, burn out mat ho 🧠🛌",
  "Move at your speed, race kisi aur se nahi hai 🐢👣",
  "Mistakes saboot hain ki tum try kar rahe ho ❌➡️📘",
  "Magic happens when you don't give up ✨🛑",
  "Mauka dhundo mat, banao 🔨🔥",
  "Muzbut ban, kyunki duniya soft nahi hai 🛡️🌍",
  "Man ka bojh kam karna bhi courage hai 🎒❤️",
  "Motivation aata-jaata hai, discipline rukta nahi ⏱️⚔️",
  "Mushkil phase hi muscle banata hai 🏋️‍♂️🔥",
  "Mindset change karo, game change ho jayega 🧠🎮",
  "Mehnat ka silence future me shor banega 🤫🏆",
  "Mann bhar aaye to rona allowed hai 😢🫂",
  "Mistake repeat mat kar, regret repeat mat kar 🔁🚫",
  "Move karte raho, clarity aati jayegi 🚶‍♂️🔍",
  "Mujhse nahi hoga bolna band kar ❌🧠",
  "Mehnat slow ho sakti hai, direction galat nahi 🧭🐢",
  "Mind ko train karo, situation apne aap handle hogi 🧠💪",
  "Motivation nahi, habit banao 🔁🔥",
  "Mushkil sawal hi strong answer banata hai ❓➡️💎",
  "Manzil se pehle ka version hi asli hero hai 🦸‍♂️🔥",
  "Mehnat ka weight future uthata hai 🎒✨",
  "Mera kal aaj se strong hoga, bas ye yaad rakh 🌅❤️‍🔥"
],

N: [
  "Normal feel nahi ho raha? it’s okay 🤍🫂",
  "No rush, no pressure, bas present me raho 🧘‍♂️⏳",
  "Nazar process pe rakho, pahad apne aap kat jayega 🏔️✂️",
  "Not every day needs victory, survival bhi kaafi hai 🛡️❤️",
  "Naye din naye chances late hain 🌅✨",
  "Negative thoughts sirf clouds hain, sky nahi ☁️🌤️",
  "Never regret a day in your life, good days give happiness 🌈",
  "Niyat saaf to manzil pass ❤️🧭",
  "Nothing changes if nothing changes 🔁🔥",
  "Na bolna bhi self-care hai 🚫🤍",
  "Numb feel karna bhi ek phase hai 🫥⏳",
  "Naye version ke liye purana todna padta hai 🔨🌱",
  "Nazar apni growth pe rakho, logon pe nahi 👀📈",
  "Negative log temporary hain, goals permanent 🎯🛑",
  "Neend bhi productivity ka hissa hai 😴⚙️",
  "Niche girkar uthna hi strength hai ��➡️💪",
  "Naye darr ka matlab nayi growth 😨🌱",
  "Na rukna hi tera secret weapon hai 🗝️🔥",
  "Niyat aur mehnat ka combo unbeatable hai 🧠💪",
  "No validation needed, tu kaafi hai 👑🤍",
  "Naye raaste awkward lagte hain pehle 🛣️😶",
  "Na milne wale jawab bhi seekh hote hain ❓📘",
  "Normal hona boring hai, real reh 🔥🧠",
  "Nazar neeche, kaam upar 👇⬆️",
  "Nikal jayega ye phase bhi, jaise baaki nikle ⏳🫂"
],

O: [
  "Overthinking signal hai rest ka, pause le ⏸️🧠",
  "One step is enough, pura seedhi mat dekh 👣🪜",
  "Old patterns todna mushkil hota hai, par zaroori hai 🔨🔥",
  "Okay rehna bhi progress hai 🤍📈",
  "Own your pace, apni speed se chalo 🧭🐢",
  "Opportunity knock nahi karegi, darwaza tod do 🚪🔥",
  "Obsession beats talent every time 🧠⚔️",
  "Only you can change your life 🔑✨",
  "Open your mind, duniya badi hai 🌍🧠",
  "Overload ho to offline jao 📵🧘‍♂️",
  "One bad day doesn't define you 📆🚫",
  "Observe zyada karo, react kam 👀🧠",
  "Outgrow hona lonely hota hai, par zaroori 🌱🫂",
  "Old pain ko new excuse mat banao 🚫💭",
  "Okay bolna seekho jab zarurat ho 🤍🛑",
  "Outcome chhod, effort pe dhyaan de 🎯🔥",
  "Overnight success ek myth hai 🌙❌",
  "One decision poori direction badal sakta hai 🧭⚡",
  "Own your story, chahe messy ho 📖❤️",
  "Overthinking kam hogi jab action badhega 🏃‍♂️💥",
  "Open heart ke saath strong boundaries rakho ❤️🛡️",
  "Old version ko thank you bol, aage badh 🙏➡️",
  "One day ka pain, lifetime ka lesson ban sakta hai ⏳📘",
  "Opportunity patience test karti hai ⏰🔥",
  "Okay nahi ho tab bhi chalna hi courage hai 🚶‍♂️❤️‍🔥"
],
P: [
  "Progress loud nahi hoti, wo silent build hoti hai 🌱🤫",
  "Patience underrated hai, ye superpower hai ⏳🦸‍♂️",
  "Pressure grow bhi karata hai, diamond banata hai 💎🔥",
  "Pause bhi strategy hai, rukna haar nahi ⏸️🧠",
  "Present pe focus rakho, future sorted hai 🎯✨",
  "Pain pass ho jayega, pride reh jayega 💥👑",
  "Practice makes permanent, not just perfect 🔁📈",
  "Priority set kar, options apne aap kam honge 🧭✂️",
  "Positive mind finds opportunity in everything 🌈🔍",
  "Progress slow ho sakti hai, par direction sahi honi chahiye 🐢🧭",
  "Pressure se bhaago mat, use shape banane do 🔥🛠️",
  "Patience ka test hi future ka taste batata hai 😌🍃",
  "Present ka effort hi past ka regret mitaata hai ⏳🧹",
  "Pain ko teacher banao, jailer nahi 📘🩹",
  "Practice tab bhi karo jab mood saath na ho ⚔️⏱️",
  "Progress invisible hoti hai jab tak visible nahi hoti 👀✨",
  "Pause lene se clarity aati hai, guilt nahi 🧘‍♂️🤍",
  "Purpose clear ho to pressure manageable ho jata hai 🎯💪",
  "Patience me power hai, bas noise kam hota hai 🤫⚡",
  "Positive rehna matlab blind rehna nahi, hopeful rehna hai 🌤️❤️",
  "Progress ka scale doosron se mat naap 📏🚫",
  "Pain ke baad jo tu banta hai, wahi reward hai 🛡️🔥",
  "Present me jeena bhi ek discipline hai 🧘‍♀️📚",
  "Practice boring lagti hai, par jeet wahi se aati hai 🏆🔁",
  "Pressure ke bina polish nahi hoti ✨💎",
  "Patience ka matlab wait nahi, consistent action hai 🚶‍♂️⏳",
  "Positive mindset luck ko bhi invite karta hai 🍀🌈",
  "Progress ka credit khud ko bhi diya kar 👏❤️",
  "Pause is not weakness, it’s wisdom 🧠⏸️",
  "Pressure tujhe todne nahi, tarashne aaya hai 🔨🔥",
  "Present ke saath honest reh, future loyal hoga 🤝🌅",
  "Pain ko ignore mat kar, samajh 🧠🩹",
  "Practice me hi confidence janam leta hai 💪✨",
  "Purpose yaad rakh, problems chhoti lagenge 🎯🔍",
  "Progress ho rahi hai, bas tu daily dekh nahi pa raha 📆🌱"
],

Q: [
  "Question karna growth hai, maan lena nahi ❓🌱",
  "Quiet work matters the most 🤫🏗️",
  "Quality over noise, hamesha 🎧✨",
  "Questions clarity laate hain, pucho khud se 🪞❓",
  "Quit sirf doubt ko karo, sapno ko nahi 🚫💭",
  "Quick fix jaisa kuch nahi hota, grind real hai 🛠️🔥",
  "Queen/King mindset: Handle with grace 👑🤍",
  "Quote your own life, copy mat ban ✍️🚫",
  "Quietly building an empire 🏰🤫",
  "Questions se bhaagna nahi, face karna seekho ⚔️❓",
  "Quiet rehkar bhi kaam zor se hota hai 🔥🤫",
  "Quality focus beats quantity effort 🎯📉",
  "Question khud se pucho: kya main try kar raha hoon? 🪞🧠",
  "Quit ka thought aaye to reason yaad karo 🎯❤️‍🔥",
  "Quick results slow habits se nahi aate 🐢🚫",
  "Queen/King attitude ka matlab ego nahi, self-respect 👑🛡️",
  "Quiet progress bhi progress hi hoti hai 🌱🤍",
  "Questions hi direction dete hain 🧭❓",
  "Quit mat kar, thoda sa aur 🫂⏳",
  "Quality sleep bhi grind ka hissa hai 😴⚙️",
  "Quiet log zyada observe karte hain 👀🧠",
  "Question marks hi full stop ko todte hain ❓➡️🚫",
  "Quick motivation nahi, deep commitment chahiye 🔥🧠",
  "Queen/King energy ka matlab calm strength 👑🧘‍♂️",
  "Quote wahi likho jo jee rahe ho 📖❤️",
  "Quiet hustle ka reward loud hota hai 🏆🔊",
  "Questions uncomfortable hote hain, par zaroori 😶‍🌫️❓",
  "Quit karna easy hai, tikna courage hai 🛡️🔥",
  "Quality decisions future ko shape karte hain 🧭✨",
  "Quiet mind best decisions leta hai 🧠🕊️",
  "Question ko ignore karoge to answer delay hoga ⏳❓",
  "Quick comparison khushi chheen leta hai 🚫😌",
  "Queen/King banne se pehle khud ka respect sikho 👑❤️",
  "Quiet strength hi longest chalti hai 🛡️⏳",
  "Questions ka darr khatam karo, clarity milegi 🌤️🧠"
],
R: [
  "Rest lena weakness nahi, fuel hai 🔋😌",
  "Routine freedom deta hai, kaid nahi ⏰🕊️",
  "Results time lete hain, bamboo tree philosophy 🎋⏳",
  "Reset bhi zaroori hai, switch off-on kar 🔄🧠",
  "Real growth boring lagti hai, par solid hoti hai 🧱🔥",
  "Risk liye bina kahani nahi banti 🎲📖",
  "Regret se bada darr koi nahi 😔⚠️",
  "Rise above the storm and you will find sunshine ⛈️☀️",
  "Ruk mat, bas saans le aur aage badh 😮‍💨➡️",
  "Roz thoda better banna hi real jeet hai 📈👑",
  "Rest ke bina consistency possible nahi 🛌⚙️",
  "Routine jab habit ban jaye, stress kam hota hai 🔁🧠",
  "Results dikhenge, bas patience zinda rakho ⏳❤️",
  "Reset karna matlab haar maanna nahi hota 🛑➡️✨",
  "Real progress chupchaap hoti hai 🤫🌱",
  "Risk lene se hi limits toot-ti hain 🚪🔥",
  "Regret future ka bojh hai, aaj mat uthao 🎒❌",
  "Rise tab hota hai jab give up ka option chhod do ⬆️🔥",
  "Rukna allowed hai, peeche jaana nahi 🛑🚫",
  "Roz ka discipline hi kal ka confidence hai 📅💪",
  "Rest lene se clarity aati hai, guilt nahi 🧘‍♂️🤍",
  "Routine strong ho to motivation optional hoti hai 🛠️⚡",
  "Results slow ho sakte hain, par sure hote hain 🐢✅",
  "Reset ke baad hi next level start hota hai 🎮🚀",
  "Real strength calm rehna bhi hota hai 🧘‍♀️🛡️",
  "Risk lene ka darr regret se chhota hota hai ⚖️🔥",
  "Regret tab hota hai jab try hi nahi kiya 😶‍🌫️❌",
  "Rise ke liye pehle girna padta hai 🤕➡️⬆️",
  "Ruk kar sochna bhi ek smart move hai ♟️🧠",
  "Roz ka effort future ka foundation hai 🧱🌄",
  "Rest ke moments me bhi guilt mat bharo 🛌🕊️",
  "Routine follow karna self-respect hai 👑⏰",
  "Results ka wait hi patience sikhata hai ⏳📘",
  "Reset ka matlab naye angle se dekhna 👀🔄",
  "Real battle tere andar chal rahi hai ⚔️❤️",
  "Risk lene wale hi yaad rakhe jaate hain 📜🔥",
  "Regret ko lesson banao, sentence nahi 📘🚫",
  "Rise karne wale log shor nahi machate 🤫⬆️",
  "Rukna nahi, chahe speed kam ho 🐢➡️",
  "Roz survive karna bhi strength hai 🛡️🫂",
  "Rest ke baad comeback zyada strong hota hai 🔥🔁",
  "Routine ka magic dheere dikhta hai ✨⏳",
  "Results tere favor me kaam kar rahe hain, trust rakh 🤝🌈",
  "Reset karte rehna, warna burn out ho jayega 🔄🔥",
  "Real courage daily uth kar try karna hai 🌅💪",
  "Risk lene se pehle darr aana normal hai 😨🤍",
  "Regret se zyada heavy kuch nahi hota 🎒⚠️",
  "Rise tab hota hai jab tu khud pe nahi chhodta 🔥👑",
  "Ruk kar saans le, tu akela nahi hai 🫂😌"
],
S: [
  "Shishupal the owner of this Ultra Os  📱 ",
  "Slow chalna safe hai, girne se bachoge 🐢🛡️",
  "Self-respect first, baaki sab baad me 👑🤍",
  "Strong banna loud nahi hota, wo andar ki shanti hai 🧘‍♂️💪",
  "Samajh aane me time lagta hai, jaldbaazi mat kar ⏳🧠",
  "Stick with it, magic last rep me hota hai 🔁✨",
  "Small steps every day add up to big results 👣📈",
  "Success rental hai, rent roz dena padta hai 🏠⏰",
  "Silence is the best response to a fool 🤫🧠",
  "Sangharsh jitna bada, jeet utni shandar ⚔️👑",
  "Strong rehna matlab hard nahi, steady rehna hai 🌊🛡️",
  "Slow progress bhi progress hi hoti hai 🐢🌱",
  "Self-doubt aayega, par steering mat chhod 🚗🧭",
  "Shor kam karo, clarity badhegi 🔇✨",
  "Sach ye hai: tu kaafi hai 🤍👑",
  "Struggle tera certificate banega, dar mat 📜🔥",
  "Support khud se shuru hota hai 🤝❤️",
  "Sabr ka phal sweet hota hai 🍯⏳",
  "Strong foundation time leti hai 🧱⌛",
  "Shant rehkar liya gaya decision sabse powerful hota hai 🧠⚡",
  "Sirf zinda rehna bhi kabhi kabhi jeet hota hai 🫂🏆"
],

T: [
  "Thakna allowed hai, rukna nahi 😮‍💨➡️",
  "Trust the process, even when it's dark 🌑🤝",
  "Time sab sikha deta hai, teacher hai wo ⏰📘",
  "Tension future ka tax hai, abhi mat bharo 💸🚫",
  "Take it easy, life marathon hai sprint nahi 🏃‍♂️🛤️",
  "Tough times don't last, tough people do 🛡️🔥",
  "Talent se bada discipline hota hai ⚙️👑",
  "Think big, start small, act now 🧠👣⚡",
  "Try karne me koi loss nahi hai 🎯🤍",
  "Thoda tootna bhi growth ka part hai 🩹🌱",
  "Trust khud pe rakho, raasta niklega 🧭❤️",
  "Time ke saath clarity aati hai, panic nahi ⏳🧘‍♂️",
  "Tired feel karna weak hona nahi hota 😮‍💨💪",
  "Tough decisions hi easy future banate hain ⚖️🌄",
  "Try karte rehna hi bravery hai 🛡️🔥",
  "Time lag raha hai, par tu galat nahi hai ⏰🤍",
  "Thoda ruk kar sochna bhi smart move hai ♟️🧠",
  "Trust slow process, fast results ka shortcut nahi hota 🐢🚫",
  "Tu akela nahi hai, bas yaad rakh 🫂❤️",
  "Today ka effort kal ka confidence hai 🌅💪"
],

U: [
  "Ups and downs normal hain, heartbeat bhi straight nahi hoti 📈📉❤️",
  "Unlearn bhi zaroori hai, purana delete kar 🗑️🧠",
  "Umeed zinda rakho, suraj niklega 🌅🌈",
  "You’re not behind, you are in your time zone ⏰🌍",
  "Use your energy wisely, har jagah mat baha ⚡🚫",
  "Understand ki tum insaan ho, robot nahi 🤍🤖",
  "Upgrade your mindset, upgrade your life 🧠⬆️✨",
  "Unique ban, copy karke kya milega 🦋🚫",
  "Until you win, keep playing 🎮🔥",
  "Ups and downs hi story banate hain 📖🌊",
  "Uncomfortable hona growth ka sign hai 😣🌱",
  "Upar jaane ke liye pehle stable banna padta hai 🧱⬆️",
  "Umeed chhoti ho sakti hai, par kaafi hoti hai 🤍✨",
  "Unseen effort hi real effort hota hai 🤫🔥",
  "Urgency kam karo, clarity badhao 🧘‍♂️🧠",
  "Uncertainty me bhi tu sambhal raha hai 🫂💪",
  "Upgrade ka matlab change accept karna hai 🔄🌱",
  "Unique journey ka pace bhi unique hota hai 🛤️👣",
  "Uthna har baar possible hai, bas try chahiye 🔁🔥",
  "Umeed wahi rakhta hai jo andar se strong hota hai 🛡️🌈"
],
V: [
  "Vibe important hai, energy jhoot nahi bolti ✨🧠",
  "Value khud se shuru hoti hai, log baad me karte hain 👑🤍",
  "Victory patient logon ko milti hai ⏳🏆",
  "Vision clear rakho, raste mil jayenge 🧭✨",
  "Very human to feel lost, wapas aa jaoge 🫂🌱",
  "Voice your truth, even if your voice shakes 🎤💪",
  "Validate yourself, likes ki zaroorat nahi ❤️🚫",
  "Visualize it, then materialize it 🎯🔮",
  "Value time, it's the only currency ⏰💎",
  "Vibe match karo, fight kam hogi 🤝✨",
  "Victory ka raasta silent hota hai 🤫🏆",
  "Vision strong ho to fear kam lagta hai 👀🔥",
  "Value boundaries, peace milegi 🛡️🕊️",
  "Very slow progress bhi progress hi hoti hai 🐢📈",
  "Voice dabana mat, par chillao bhi mat ⚖️🗣️",
  "Victory sirf result nahi, journey bhi hoti hai 🛤️👑",
  "Vibe pe kaam karo, luck follow karega 🍀✨",
  "Value self-respect, sab sort ho jayega 👑❤️",
  "Vision ke bina mehnat bhatak jaati hai 🧭🚶‍♂️",
  "Very real pain bhi strong bana deta hai 🩹🛡️",
  "Voice ka weight tab badhta hai jab sach bolte ho ⚖️🎤",
  "Value growth, comfort nahi 🌱🔥",
  "Victory ke liye patience ka test dena padta hai 📝⏳",
  "Vibe calm rakho, decisions clear honge 🧘‍♂️🧠",
  "Very human ho tum, perfection mat dhoondo 🤍✨"
],

W: [
  "Waqt lagega, par milega zaroor ⏳🌄",
  "Worth it hoga, bas tika reh 🛡️🔥",
  "Work quietly, let success make the noise 🤫🏆",
  "Worry kam karo, worship/work zyada 🙏💼",
  "Win slow bhi win hai, speed doesn't matter 🐢👑",
  "Why clear hai to How mil jayega 🎯🧠",
  "Wake up with determination, sleep with satisfaction 🌅😌",
  "Walking away is also a power move 🚶‍♂️🛡️",
  "Whatever it takes, do it for you 🔥❤️",
  "Waqt pressure banata hai ya polish, choice tumhari ⏰💎",
  "Work on yourself, sab follow karega 🔁✨",
  "Worry future me hoti hai, present me nahi 🚫🧠",
  "Win ka matlab hamesha trophy nahi hota 🏆❌",
  "Worth tab banta hai jab tu rukta nahi 🛠️🔥",
  "Wake up, show up, repeat 🔁🌅",
  "Wounds bhi wisdom de jaate hain 🩹📘",
  "Work ethic talent ko bhi beat kar deta hai ⚙️🔥",
  "Waqt ke saath clarity aati hai, panic nahi ⏳🧘‍♂️",
  "Walking slow is better than standing still 🚶‍♂️➡️",
  "Worry kam hogi jab action zyada hoga 🏃‍♂️💥",
  "Win ke liye pehle discipline chahiye 📅👑",
  "Waqt sabka aata hai, bas sabr rakho ⏰🤍",
  "Work ka weight future uthata hai 🎒🌄",
  "Wake up with hope, sleep with peace 🌈😴",
  "Winners quit excuses, not goals 🚫🎯"
],

X: [
  "Xtra effort aaj ka edge hai, kal ka result ⚡🏆",
  "X-factor consistency hai, talent nahi 🔁🔥",
  "Xpect setbacks, plan for them ⚠️🧠",
  "Xplore calmly, duniya badi hai 🌍🧘‍♂️",
  "Xhale stress, inhale power 😮‍💨💪",
  "X-ray vision rakh, dikhawe ke paar dekh 👀🩻",
  "X mark lagata ja, task khatam kar ✔️🔥",
  "Xenon jaisa noble ban, stable and bright 💡👑",
  "Xerox mat ban, original reh 🧬✨",
  "Xtra patience bhi growth ka part hai ⏳🌱",
  "Xpect kam, effort zyada, peace milegi ⚖️🕊️",
  "Xplore khud ko, answers milenge 🪞🧠",
  "X-factor wahi hota hai jo dikhta nahi 🤫🔥",
  "Xtra push last moment me game badalta hai 🏁⚡",
  "Xhale negativity, space banao positivity ke liye 🚪🌈",
  "X-ray nazar rakho, log nahi process dekho 👀⚙️",
  "X marks the spot, wahi kaam karna hai 🎯✔️",
  "Xtra discipline beats motivation 🔒🔥",
  "Xplore discomfort, wahi growth hai 😣🌱",
  "X-factor ka matlab calm confidence 😌👑",
  "Xtra focus = kam regret 🎯🚫",
  "Xhale doubt, inhale belief 😮‍💨🤍",
  "Xerox zindagi mat jiyo, apni likho ✍️✨",
  "Xtra mile chalega, rukna nahi 🐢➡️",
  "Xpect delay, deny quitting ⏳🚫"
],
Y: [
  "You don’t need to rush, bas rukna mat ⏳➡️",
  "You are allowed to grow at your own pace 🐢🌱",
  "Yesterday ka bojh aaj mat uthao 🎒🚫",
  "You are stronger than the phase you’re in 🛡️🔥",
  "Your focus decides your future 🎯🌄",
  "You don’t need motivation daily, discipline kaafi hai ⚙️👑",
  "Your effort counts even when no one notices 🤫🏆",
  "You are not lazy, you’re tired—rest smartly 😮‍💨🛌",
  "Your journey is valid, even if it’s slow 🛤️🐢",
  "You win every time you don’t quit 🔁🔥",
  "Your mind believes what you repeat 🧠🔁",
  "You don’t fail, you learn 📘✨",
  "Your silence today can become strength tomorrow 🤫🛡️",
  "You are building something unseen 🌱👀",
  "Your consistency will embarrass your excuses ⚔️🔥",
  "You don’t need approval, you need progress 📈🚫",
  "Your best version is under construction 🏗️👑",
  "You show up daily, that’s rare 👏🔥",
  "Your limits move when you move 🚶‍♂️🧭",
  "You’re not behind, you’re preparing ⏳🛠️",
  "Your struggle is shaping discipline 📚💪",
  "You don’t need perfect days, just honest ones 🤍📅",
  "Your patience is working silently ⏳🤫",
  "You are allowed to pause, not to quit ⏸️🚫",
  "You will thank yourself for not stopping 🙏🏆"
],

Z: [
  "Zero excuses, bas thoda effort roz ka 🔥📅",
  "Zone me rehna hi success ka shortcut hai 🎧🎯",
  "Zyada sochna kam karo, zyada karna shuru karo 🧠➡️🏃‍♂️",
  "Zidd agar sahi ho to manzil milti hai 🛤️🔥",
  "Zero motivation bhi discipline se jeet sakta hai ⚙️👑",
  "Zakhm proof hain ki tu fight kar raha hai 🩹🛡️",
  "Zone out nahi, zone in karo 🎯🧠",
  "Zyada pressure growth ka sign hota hai 💎🔥",
  "Zero distractions, maximum focus 📵🎯",
  "Zindagi exam hai, roz thoda revise kar 📚🔁",
  "Zameen se jude raho, upar jaoge 🌍⬆️",
  "Zidd aur sabr ka combo unbeatable hai ⚔️⏳",
  "Zero comparison, full concentration 🚫👀",
  "Zyada comfort progress ka enemy hai 🛑🛋️",
  "Zone me kaam karo, result shor karega 🤫🏆",
  "Zaroorat pade to slow ho jao, stop mat ho 🐢➡️",
  "Zindagi tough hai, par tu trained ho raha hai 🏋️‍♂️🔥",
  "Zero regret tab hota hai jab try full ho 💯🚫",
  "Zyada bolna nahi, zyada karna seekho 🤫⚙️",
  "Zone banane me time lagta hai, todne me second ⏳⚠️",
  "Zaroori nahi har din perfect ho 📅🤍",
  "Zidd ko discipline me badlo 🔄👑",
  "Zero fear nahi, control chahiye 🧠🛡️",
  "Zindagi ka syllabus tough hai, par tu pass ho jayega 📘🏆",
  "Zarurat pade to akela chalo, par rukna mat 🚶‍♂️🔥"
]       
 }, // <--- YAHAN GALTI THI (Fixed)
        numbers: {
            0: [
  "Zero se hi sab shuru hota hai 😄🌱",
  "Aaj enjoy karo, kal ka load kal 🧘‍♂️☀️",
  "Khushi free hai, loot lo 😄🎁",
  "Muskurana power hai, use it 😊⚡",
  "Light mood best mood hota hai ☁️💙",
  "Zero ego, infinite growth ♾️🌱",
  "Start fresh, purana baggage drop kar 🎒🚫",
  "Infinite possibilities start from zero ✨0️⃣",
  "Null nahi, new beginning hai ye 🔄🌄",
  "Zero pressure, full presence 😌🧠",
  "Zero se darte nahi, zero se bante hain 💪🔥",
  "Zero expectations, maximum peace 🕊️🤍",
  "Zero ka matlab khaali nahi, open space hai 🌌✨",
  "Zero comparison, pure freedom 🚫👀",
  "Zero stress days bhi zaroori hote hain 😴💤",
  "Zero se start karna brave hota hai 🛡️🌱",
  "Zero point pe clarity milti hai 🔍✨",
  "Zero ka magic underestimate mat kar ✨0️⃣"
],

1: [
  "Ek ho to strong bano, army of one 🔥🧍‍♂️",
  "Leader banne ko awaaz nahi soch chahiye 🧠👑",
  "Khud pe khade raho, sahara mat dhundo 💪🛡️",
  "Silence powerful hota hai, suno isse 🤫🧠",
  "One step ahead is enough 👣✨",
  "Number 1 priority: Tera mental peace 🧠🕊️",
  "Ek din ya Day One? Tu decide kar ⏳🔥",
  "Single focus, double result 🎯⚡",
  "You are the one you've been waiting for 🤍👑",
  "Ek strong habit poora future badal sakti hai 🔁🌄",
  "One clear goal beats hundred wishes 🎯🚫",
  "Khud ka number one banna seekho 👑❤️",
  "One decision, one direction 🧭✨",
  "Ek kadam roz, kaafi hota hai 👣📅",
  "One voice bhi farq la sakti hai 🗣️🔥",
  "Ek ho kar bhi complete ho tum 🤍✔️",
  "One path, apna pace ���️🐢",
  "Ek khud par bharosa, sabse bada asset 🤝💎"
],

2: [
  "Balance rakho, work aur life me 🌿⚖️",
  "Thoda enjoy thoda kaam, yehi hai life 😄📚",
  "Mood sahi ho to din apna hota hai 😊☀️",
  "Life vibe hai race nahi, chill kar 🎶🧘‍♂️",
  "Smile more, stress less 😄🚫",
  "Do raste honge, sahi wala chunna 🧭✨",
  "Together is better, help maang lena 🤝❤️",
  "Second chance sabko milta hai 🔁🌈",
  "Peace of mind > Everything else 🕊️👑",
  "Do cheezon ka balance hi game hai ⚖️🔥",
  "Do kadam peeche lene me sharam nahi 🚶‍♂️↩️",
  "Do log ho ya akela, self-respect same rakho 👑🤍",
  "Do sides samajhna maturity hai 🧠✨",
  "Do baar girkar uthna strength hai 💪🌱",
  "Do options me se calm wala chuno 🧘‍♂️✔️",
  "Do cheez kabhi mat chhodo: hope aur smile 🌈😊",
  "Do minute ki shaanti bhi healing hoti hai ⏸️🕊️",
  "Do cheez permanent rakho: honesty aur effort ❤️🔥"
],

3: [
  "Energy high rakho, low vibe not allowed 😄⚡",
  "Masti bhi zaroori hai, serious mat ho 🎉😌",
  "Dil halka rakho, udaan unchi hogi 🕊️☁️",
  "Enjoy small things, chai aur hawa ☕🍃",
  "Positive reh, magnet ban jayega 🧲✨",
  "Third eye khuli rakh, alert reh 👁️🧠",
  "Past, Present, Future - bas aaj me jiyo ⏳❤️",
  "Teen tigada kaam bigada nahi, kaam banata hai 🔺🔥",
  "Mind, Body, Soul - teeno align kar 🧠💪❤️",
  "Teen cheez yaad rakh: breathe, believe, move 😮‍💨✨",
  "3 deep breaths, phir decision 🧘‍♂️🧠",
  "Teen cheez kam rakho: stress, ego, noise 🚫🔇",
  "Teen cheez badhao: smile, patience, effort 😊⏳🔥",
  "Teen second ruk kar react karo ⏸️🧠",
  "Teen jeet roz ki hoti hai: uthna, try, repeat 🔁🔥",
  "Teen level growth: soch, action, habit 📈🛠️",
  "Teen ka rule: simple, steady, strong 🛡️✨",
  "Teen words ka mantra: I will try 💪❤️"
],

4: [
  "Strong base banao, building nahi giregi 🧱🏗️",
  "Consistency jeet dilati hai, talent nahi 🔁👑",
  "Mehnat ka number, result pakka hai 💯🔥",
  "Stable reh, hawa ke jhonke aayenge 🌬️🛡️",
  "Solid effort beats luck everyday ⚒️🍀",
  "Charon taraf dekh, par focus seedha rakh 👀🎯",
  "Foundation strong to future secure 🧱🌄",
  "Discipline freedom deta hai 🔓📅",
  "Square one pe wapas aana failure nahi hai 🔄🤍",
  "4 walls me bhi sapne bade ho sakte hain 🏠✨",
  "4 din ka slow phase normal hai 🐢⏳",
  "4 habits sabse strong: sleep, move, focus, repeat 🔁💪",
  "4 cheez chhod do: excuse, doubt, rush, fear 🚫😌",
  "4 step formula: plan, act, rest, repeat 📋⚡",
  "4 baar girkar uthna hi resilience hai 💪🔥",
  "4 corner strong ho to life balanced rehti hai ⚖️✨",
  "4 words enough hain: Tu kar sakta hai 💪❤️",
  "4 ka rule: steady reh, strong ban 🛡️🌱"
],
5: [
  "5 minute ki hansi, din halka kar deti hai 😄☀️",
  "5 cheez yaad rakh: chill, smile, repeat 🎶😊",
  "5 ka funda: life ko thoda easy lo 😌🍃",
  "5 second rukkar react karo, drama kam hoga ⏸️😄",
  "5 reasons dhundo khush rehne ke, mil jayenge 🌈✨",
  "5 din ka stress, 2 din ka chill balance hai ⚖️😎",
  "5 wali chai best lagti hai ☕😌",
  "5 steps me mood fresh: walk, music, smile 🚶‍♂️🎧😊",
  "5 ka number friendly hota hai 🤝😄",
  "5 deep breaths, phir sab sorted 😮‍💨🌿",
  "5 jokes suno, tension bhaag jayegi 😂🏃‍♂️",
  "5 cheez kam rakho: gussa, overthinking 🚫🧠",
  "5 ka rule: thoda kaam, thoda fun 🎯🎉",
  "5 wali energy full vibe hoti hai ⚡😎",
  "5 minute ka break bhi magic karta hai ✨⏳",
  "5 ka mood: light, playful, happy 😄🎈",
  "5 se start karo, smile pe end karo 😊🔁",
  "5 reasons nahi, bas khush raho 😄❤️"
],

6: [
  "6 ka number balance aur fun dono hai ⚖️😄",
  "6 wali smile extra cute hoti hai 😊✨",
  "6 cheez daily karo: laugh loud 😂🔊",
  "6 minute music = instant mood boost 🎧⚡",
  "6 ka vibe: no rush, no fuss 😌🍃",
  "6 jokes me din set ho jata hai 🤣☀️",
  "6 deep breaths = calm mind 😮‍💨🧠",
  "6 ka rule: thoda chill, thoda thrill 🎢😎",
  "6 reasons stress lene ke? skip karo 🚫😄",
  "6 wali evening best hoti hai 🌇☕",
  "6 ka number friendly aur warm lagta hai 🤍😊",
  "6 minute walk bhi kaafi hoti hai 🚶‍♂️🌿",
  "6 ka mantra: smile first 😄✨",
  "6 cheez chhod do: overthinking 🚫🧠",
  "6 ka mood: relaxed and happy 😌🎈",
  "6 ka secret: light rehna 🍃😄",
  "6 baar haso, ek baar worry kam 😄➖",
  "6 ka sign: good vibes only ✌️🌈"
],

7: [
  "7 lucky number, lucky mood 😄🍀",
  "7 din me ek full chill day zaroor 😌☀️",
  "7 ka vibe hamesha positive hota hai ✨😊",
  "7 cheez yaad rakh: life short hai 😄⏳",
  "7 minute ka laugh therapy 😂🧠",
  "7 ka rule: worry kam, masti zyada 🎉😎",
  "7 smiles = instant happiness 😊✨",
  "7 ka number friendly lagta hai 🤝😄",
  "7 wali feeling: all good 😌🌈",
  "7 reasons khush rehne ke, count mat karo 😄",
  "7 jokes suno, din ban jaata hai 🤣☀️",
  "7 ka mood: light and lucky 🍀😄",
  "7 minute break = fresh start 🔄✨",
  "7 ka sign: sab theek hai 👍😊",
  "7 baar bolo: it’s okay 😌❤️",
  "7 ka mantra: enjoy the moment 🎶😄",
  "7 ka energy soft hoti hai ☁️😊",
  "7 ke saath smile free 😄🎁"
],

8: [
  "8 ka number power + fun combo hai 💪😄",
  "8 wali hansi loud hoti hai 😂🔊",
  "8 ka rule: chill reh, cool reh 😎🍃",
  "8 cheez kam rakho: stress 🚫🧠",
  "8 minute ka music break 🎧✨",
  "8 ka mood: confident but chill 😌💫",
  "8 smiles today, good vibes tomorrow 😊🌈",
  "8 ka number friendly feel deta hai 🤝😄",
  "8 wali energy steady hoti hai ⚡😌",
  "8 ka mantra: light lo life ko 😄",
  "8 baar stretch karo, body thank you bolegi 🤸‍♂️😊",
  "8 ka sign: balance is fun ⚖️😎",
  "8 minute walk = happy legs 🚶‍♂️😄",
  "8 ka vibe: smooth and easy 🍃✨",
  "8 jokes > 8 worries 😂🚫",
  "8 ka mood: playful 😄🎈",
  "8 ke saath smile double 😊😊",
  "8 ka secret: relaxed confidence 😌💪"
],

9: [
  "9 ka number full circle, full chill 🔄😄",
  "9 wali smile peaceful hoti hai 😊🕊️",
  "9 ka rule: sab theek ho jata hai 😌✨",
  "9 cheez kam rakho: overthinking 🚫🧠",
  "9 minute ka silence bhi soothing hota hai 🤫🌿",
  "9 ka mood: calm + happy 😌😊",
  "9 smiles = pure joy 😊🌈",
  "9 ka number friendly end lagta hai 🤝😄",
  "9 wali energy soft aur warm hoti hai ☁️🤍",
  "9 ka mantra: let it flow 🌊😄",
  "9 minute break, fresh mind 🔄🧠",
  "9 ka sign: relax, you’re good 👍😊",
  "9 jokes suno, din complete 🤣✔️",
  "9 ka vibe: no stress zone 🚫😌",
  "9 baar deep breath, phir chill 😮‍💨🌿",
  "9 ka mood: simple happiness 😄✨",
  "9 ke saath smile natural hoti hai 😊",
  "9 ka secret: sab pass ho jata hai ⏳🌈"]  }
    };

    input.addEventListener("input", () => {
        const v = input.value.trim();
        if (!v) {
            suggestions.style.display = "none";
            return;
        }

        if (/^[a-zA-Z]$/.test(v) || /^[0-9]$/.test(v)) {
            const key = v.toUpperCase();
            const pool = isNaN(key) ? quotePools.letters[key] : quotePools.numbers[key];
            
            if (!pool) return;
            
                        suggestions.innerHTML = "";
            
            // 👇 NEW LOGIC: Pehle pool ko random mix karega, fir 2 uthayega
            const shuffled = [...pool].sort(() => 0.5 - Math.random());

            shuffled.slice(0, 2).forEach(q => {
                const d = document.createElement("div");
                d.className = "s-item";
                d.textContent = "✨ " + q;
                d.onclick = () => {
                    input.value = q;
                    suggestions.style.display = "none";
                };
                suggestions.appendChild(d);
            });
               /* ================= SEARCH LOGIC (FIX) ================= */
    function performSearch(query) {
        if (!query) return;
        // Yaha tum define kar sakte ho ki search kaise ho (Google, Bing, etc.)
        const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
        window.open(url, "_blank"); // New tab mein kholega
        // window.location.href = url; // Agar same tab mein kholna hai to isse uncomment karo
    }

    // 1. Enter Key Listener
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            performSearch(input.value.trim());
            suggestions.style.display = "none"; // Search ke baad suggestions hata do
        }
    });
           
            suggestions.style.display = "flex";
        } else {
            suggestions.style.display = "none";
        }
    });

})();
