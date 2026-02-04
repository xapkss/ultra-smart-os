/* =========================================================
   ULTRA SEARCH HUD — FINAL (WITH SAMPLE QUOTES)
   ========================================================= */

(function () {
    if (document.getElementById("os-search-widget")) return;

    /* ================= CSS ================= */
    const style = document.createElement("style");
    style.textContent = `
#os-search-widget{
    --neon: rgba(0,255,255,0.6);
    --neon-soft: rgba(0,255,255,0.25);
    --neon-power: 0.35;

    position: fixed;
    top: 20%; left: 50%;
    transform: translateX(-50%);
    width: 90%; max-width: 650px;
    height: 60px;
    display: flex; align-items: center;
    padding: 0 18px;
    z-index: 999999;

    background: linear-gradient(135deg,
        rgba(20,20,20,0.55),
        rgba(10,10,10,0.35)
    );
    border-radius: 16px;
    border: 1px solid var(--neon-soft);
    backdrop-filter: blur(22px) saturate(140%);
    box-shadow:
        0 0 0 1px var(--neon-soft),
        0 0 calc(40px * var(--neon-power)) var(--neon),
        inset 0 0 20px rgba(255,255,255,0.05);
    transition: box-shadow .08s linear, transform .2s;
    cursor: grab;
}
#os-search-widget.focused{
    box-shadow:
        0 0 0 2px var(--neon),
        0 0 calc(55px * var(--neon-power)) var(--neon);
}
#os-search-widget:active{ cursor:grabbing; transform:scale(.98); }

#os-search-input{
    flex:1; height:100%;
    background:none; border:none; outline:none;
    font-size:18px; color:#fff;
}
#os-search-input::placeholder{ color:rgba(255,255,255,.4); }

#os-suggestions{
    position:absolute; top:70px; left:0;
    width:100%; display:none; flex-direction:column;
    background:rgba(15,15,15,.9);
    backdrop-filter:blur(20px);
    border-radius:12px;
    overflow:hidden;
}
.s-item{
    padding:10px 16px;
    font-size:14.5px;
    line-height:1.35;
    color:rgba(255,255,255,.88);
    border-bottom:1px solid rgba(255,255,255,.06);
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
    cursor:pointer;
}
.s-item:hover{ background:rgba(255,255,255,.08); }

#os-search-widget::after{
    content:"";
    position:absolute;
    right:6px; bottom:6px;
    width:10px; height:10px;
    border-right:2px solid var(--neon);
    border-bottom:2px solid var(--neon);
    opacity:.6;
}`;
    document.head.appendChild(style);

    /* ================= HTML ================= */
    const widget = document.createElement("div");
    widget.id = "os-search-widget";
    widget.innerHTML = `
<input id="os-search-input" placeholder="Type to search..." />
<div id="os-suggestions"></div>`;
    document.body.appendChild(widget);

    const input = widget.querySelector("#os-search-input");
    const box   = widget.querySelector("#os-suggestions");

    /* =====================================================
       📝 SAMPLE QUOTES (EDIT FREELY)
       ===================================================== */
    const quotePools = {
        letters: {
            A: [
                "Aaj bas thoda better ban ja, kaafi hai 💪",
                "Aage ka rasta dheere khulta hai, trust rakh ✨"
            ],
            B: [
                "Bas rukna mat, chahe slow ho 🐢",
                "Break lena theek hai, give up nahi ☕"
            ],
            C: [
                "Calm rehna bhi ek power hai 🧘‍♂️",
                "Consistency mood par nahi chalti ⏱️"
            ]
        },
        numbers: {
            1: [
                "Ek din ya Day One — decide karo 🔥",
                "One step aaj, result kal 👣"
            ],
            5: [
                "5 minute ka break bhi magic karta hai ✨",
                "Smile karo, load kam hoga 😄"
            ]
        }
    };

    /* ================= TIME → MOOD ================= */
    function getCurrentMood() {
        const h = new Date().getHours();
        if (h >= 22 || h < 5) return "night";
        if (h >= 5 && h < 11) return "calm";
        if (h >= 11 && h < 17) return "motivational";
        return "calm";
    }

    function prioritizeQuotes(pool) {
        const mood = getCurrentMood();
        const calm = ["calm","slow","rest","peace","break","trust"];
        const moti = ["fight","better","discipline","focus","step","win"];

        return [...pool].sort((a,b)=>{
            let sa=0,sb=0;
            const A=a.toLowerCase(), B=b.toLowerCase();
            (mood==="night"||mood==="calm"?calm:moti).forEach(k=>{
                if(A.includes(k)) sa+=2;
                if(B.includes(k)) sb+=2;
            });
            return sb-sa+(Math.random()-0.5);
        });
    }

    /* ================= INPUT LOGIC ================= */
    input.onfocus = () => widget.classList.add("focused");
    input.onblur  = () => {
        widget.classList.remove("focused");
        setTimeout(()=>box.style.display="none",200);
    };

    input.addEventListener("input", () => {
        const v = input.value.trim();
        if (!v) { box.style.display="none"; return; }

        if (/^[a-zA-Z]$/.test(v) || /^[0-9]$/.test(v)) {
            const key = v.toUpperCase();
            const pool = isNaN(key)
                ? quotePools.letters[key]
                : quotePools.numbers[key];
            if (!pool) return;

            box.innerHTML="";
            prioritizeQuotes(pool).slice(0,2).forEach(q=>{
                const short = q.length>80 ? q.slice(0,77)+"…" : q;
                const d=document.createElement("div");
                d.className="s-item";
                d.textContent="✨ "+short;
                box.appendChild(d);
            });
            box.style.display="flex";
            return;
        }

        box.style.display="none";
    });

})();
