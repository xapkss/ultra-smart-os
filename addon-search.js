/* =========================================================
   ULTRA SEARCH HUD — FINAL (SM / MD / LG RESIZE)
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
    width: 90%;
    max-width: 650px; /* MEDIUM DEFAULT */
    height: 60px;
    display: flex; align-items: center;
    padding: 0 18px;

    z-index: 1200;

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
    cursor: grab;
}
#os-search-widget:active{
    cursor:grabbing;
    transform:scale(.98);
}

#os-search-input{
    flex:1;
    height:100%;
    background:none;
    border:none;
    outline:none;
    font-size:18px;
    color:#fff;
}
#os-search-input::placeholder{
    color:rgba(255,255,255,.4);
}

#os-suggestions{
    position:absolute;
    top:70px; left:0;
    width:100%;
    display:none;
    flex-direction:column;
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

/* ===== Resize Panel ===== */
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
    padding:18px;
    border-radius:16px;
    background:rgba(20,20,20,.9);
    border:1px solid rgba(255,255,255,.15);
}
#os-resize-box p{
    margin:0 0 12px;
    color:#fff;
    font-size:14px;
    text-align:center;
}
.os-size-btns{
    display:flex;
    gap:10px;
}
.os-size-btns button{
    flex:1;
    padding:10px;
    border-radius:10px;
    border:none;
    background:#222;
    color:#fff;
    font-size:14px;
    cursor:pointer;
}
.os-size-btns button:hover{
    background:#333;
}
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
  <p>Search Bar Size</p>
  <div class="os-size-btns">
    <button data-size="small">Small</button>
    <button data-size="medium">Medium</button>
    <button data-size="large">Large</button>
  </div>
</div>`;
    document.body.appendChild(resizePanel);

    resizePanel.onclick = e => {
        if (e.target === resizePanel)
            resizePanel.style.display = "none";
    };

    resizePanel.querySelectorAll("button").forEach(btn=>{
        btn.onclick = ()=>{
            const size = btn.dataset.size;
            if (size === "small") widget.style.maxWidth = "420px";
            if (size === "medium") widget.style.maxWidth = "650px";
            if (size === "large") widget.style.maxWidth = "900px";
            resizePanel.style.display = "none";
        };
    });

    /* ================= SAMPLE QUOTES ================= */
    const quotePools = {
        letters: {
            A: ["Aaj bas thoda better ban ja 💪"],
            B: ["Bas rukna mat 🐢"],
            C: ["Calm rehna bhi ek power hai 🧘‍♂️"]
        },
        numbers: {
            1: ["Ek din ya Day One 🔥"],
            5: ["5 minute ka break bhi magic hai ✨"]
        }
    };

    /* ================= INPUT ================= */
    input.addEventListener("input",()=>{
        const v=input.value.trim();
        if(!v){ box.style.display="none"; return; }

        if(/^[a-zA-Z]$/.test(v)||/^[0-9]$/.test(v)){
            const key=v.toUpperCase();
            const pool=isNaN(key)?quotePools.letters[key]:quotePools.numbers[key];
            if(!pool) return;
            box.innerHTML="";
            pool.slice(0,2).forEach(q=>{
                const d=document.createElement("div");
                d.className="s-item";
                d.textContent="✨ "+q;
                box.appendChild(d);
            });
            box.style.display="flex";
        } else box.style.display="none";
    });

    /* ================= DRAG ================= */
    let drag=false,sx,sy,sl,st;
    function dragStart(e){
        if(e.target.tagName==="INPUT") return;
        drag=true;
        const p=e.touches?e.touches[0]:e;
        sx=p.clientX; sy=p.clientY;
        const r=widget.getBoundingClientRect();
        sl=r.left; st=r.top;
        widget.style.left=sl+"px";
        widget.style.top=st+"px";
        widget.style.transform="none";
    }
    function dragMove(e){
        if(!drag) return;
        const p=e.touches?e.touches[0]:e;
        widget.style.left=sl+(p.clientX-sx)+"px";
        widget.style.top=st+(p.clientY-sy)+"px";
    }
    function dragEnd(){ drag=false; }

    widget.addEventListener("mousedown",dragStart);
    widget.addEventListener("touchstart",dragStart,{passive:true});
    document.addEventListener("mousemove",dragMove);
    document.addEventListener("touchmove",dragMove,{passive:true});
    document.addEventListener("mouseup",dragEnd);
    document.addEventListener("touchend",dragEnd);

    /* ================= DOUBLE TAP CORNER → RESIZE PANEL ================= */
    let lastTap=0;
    widget.addEventListener("click",e=>{
        const r=widget.getBoundingClientRect();
        const nearCorner = e.clientX > r.right-40 && e.clientY > r.bottom-40;
        const now = Date.now();
        if (nearCorner && now-lastTap < 350) {
            resizePanel.style.display="flex";
        }
        lastTap = now;
    });

})();
