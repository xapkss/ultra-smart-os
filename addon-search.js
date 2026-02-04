/* =========================================================
   ULTRA SEARCH HUD — FINAL SINGLE SCRIPT
   ========================================================= */

(function () {
    if (document.getElementById("os-search-widget")) return;

    /* ================= CSS ================= */
    const style = document.createElement("style");
    style.textContent = `
#os-search-widget{
    --neon: rgba(0,255,255,0.6);
    --neon-soft: rgba(0,255,255,0.25);

    position: fixed;
    top: 20%; left: 50%;
    transform: translateX(-50%);
    width: 90%; max-width: 650px;
    height: 60px;
    display: flex; align-items: center;
    padding: 0 18px;

    z-index: 1200; /* NOT TOPMOST */

    background: linear-gradient(135deg,
        rgba(20,20,20,0.55),
        rgba(10,10,10,0.35)
    );
    border-radius: 16px;
    border: 1px solid var(--neon-soft);
    backdrop-filter: blur(22px) saturate(140%);
    box-shadow:
        0 0 0 1px var(--neon-soft),
        0 0 40px var(--neon);
    transition: transform .2s;
    cursor: grab;
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
}

#os-search-widget::after{
    content:"";
    position:absolute;
    right:6px; bottom:6px;
    width:10px; height:10px;
    border-right:2px solid var(--neon);
    border-bottom:2px solid var(--neon);
    opacity:.6;
}

/* Resize Panel */
#os-resize-panel{
    position:fixed;
    inset:0;
    display:none;
    align-items:center;
    justify-content:center;
    background:rgba(0,0,0,.35);
    backdrop-filter:blur(6px);
    z-index:3000;
}
#os-resize-box{
    width:260px;
    padding:20px;
    border-radius:16px;
    background:rgba(20,20,20,.85);
    border:1px solid rgba(255,255,255,.15);
}
#os-resize-box p{
    margin:0 0 10px;
    color:#fff;
    font-size:14px;
}
#os-resize-box input{ width:100%; }
`;
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

    /* ================= RESIZE PANEL ================= */
    const resizePanel = document.createElement("div");
    resizePanel.id = "os-resize-panel";
    resizePanel.innerHTML = `
<div id="os-resize-box">
  <p>Resize Search Bar</p>
  <input type="range" min="320" max="900" value="650">
</div>`;
    document.body.appendChild(resizePanel);

    const resizeSlider = resizePanel.querySelector("input");

    resizeSlider.oninput = () => {
        widget.style.maxWidth = resizeSlider.value + "px";
    };
    resizePanel.onclick = e => {
        if (e.target === resizePanel)
            resizePanel.style.display = "none";
    };

    /* ================= SAMPLE QUOTES ================= */
    const quotePools = {
        letters: {
            A: ["Aaj bas thoda better ban ja 💪", "Aage ka rasta dheere khulta hai ✨"],
            B: ["Bas rukna mat 🐢", "Break lena theek hai ☕"],
            C: ["Calm rehna bhi ek power hai 🧘‍♂️"]
        },
        numbers: {
            1: ["Ek din ya Day One 🔥"],
            5: ["5 minute ka break bhi magic hai ✨"]
        }
    };

    /* ================= TIME + MOOD ================= */
    function getMood(){
        const h=new Date().getHours();
        if(h>=22||h<5) return "night";
        if(h<11) return "calm";
        if(h<17) return "motivational";
        return "calm";
    }

    function prioritize(pool){
        const mood=getMood();
        const calm=["calm","break","slow","trust"];
        const moti=["better","fight","step","win"];
        return [...pool].sort((a,b)=>{
            let sa=0,sb=0;
            const A=a.toLowerCase(),B=b.toLowerCase();
            (mood==="motivational"?moti:calm).forEach(k=>{
                if(A.includes(k)) sa+=2;
                if(B.includes(k)) sb+=2;
            });
            return sb-sa+(Math.random()-.5);
        });
    }

    /* ================= INPUT ================= */
    input.addEventListener("input",()=>{
        const v=input.value.trim();
        if(!v){box.style.display="none";return;}

        if(/^[a-zA-Z]$/.test(v)||/^[0-9]$/.test(v)){
            const key=v.toUpperCase();
            const pool=isNaN(key)?quotePools.letters[key]:quotePools.numbers[key];
            if(!pool) return;
            box.innerHTML="";
            prioritize(pool).slice(0,2).forEach(q=>{
                const d=document.createElement("div");
                d.className="s-item";
                d.textContent="✨ "+q;
                box.appendChild(d);
            });
            box.style.display="flex";
        } else box.style.display="none";
    });

    /* ================= DRAG (DESKTOP + MOBILE) ================= */
    let drag=false,sx,sy,sl,st;

    function dragStart(e){
        if(e.target.tagName==="INPUT") return;
        drag=true;
        const p=e.touches?e.touches[0]:e;
        sx=p.clientX; sy=p.clientY;
        const r=widget.getBoundingClientRect();
        sl=r.left; st=r.top;
        widget.style.transform="none";
        widget.style.left=sl+"px";
        widget.style.top =st+"px";
    }
    function dragMove(e){
        if(!drag) return;
        const p=e.touches?e.touches[0]:e;
        widget.style.left=sl+(p.clientX-sx)+"px";
        widget.style.top =st+(p.clientY-sy)+"px";
    }
    function dragEnd(){ drag=false; }

    widget.addEventListener("mousedown",dragStart);
    widget.addEventListener("touchstart",dragStart,{passive:true});
    document.addEventListener("mousemove",dragMove);
    document.addEventListener("touchmove",dragMove,{passive:true});
    document.addEventListener("mouseup",dragEnd);
    document.addEventListener("touchend",dragEnd);

    /* ================= DOUBLE TAP CORNER → RESIZE ================= */
    let lastTap=0;
    widget.addEventListener("click",e=>{
        const r=widget.getBoundingClientRect();
        const nearCorner=e.clientX>r.right-40 && e.clientY>r.bottom-40;
        const now=Date.now();
        if(nearCorner && now-lastTap<350){
            resizePanel.style.display="flex";
        }
        lastTap=now;
    });

})();
