/* ==============================
   ULTRA SMART OS – ADDON MODULE
   Feature: Persistent Wallpaper
   Storage: LocalStorage
   Base HTML: UNTOUCHED
================================ */

(function () {
    const imgEl = document.getElementById('bg-img');
    const vidEl = document.getElementById('bg-vid');
    const picker = document.getElementById('file-picker');

    if (!imgEl || !vidEl || !picker) return;

    /* ---------- LOAD SAVED WALLPAPER ON START ---------- */
    window.addEventListener('load', () => {
        const savedType = localStorage.getItem('usos-type');
        const savedData = localStorage.getItem('usos-data');

        if (!savedType || !savedData) return;

        if (savedType === 'image') {
            imgEl.src = savedData;
            imgEl.classList.add('active-bg');
            vidEl.classList.remove('active-bg');
        }

        if (savedType === 'video') {
            vidEl.src = savedData;
            vidEl.classList.add('active-bg');
            imgEl.classList.remove('active-bg');
            vidEl.play();
        }
    });

    /* ---------- SAVE NEW WALLPAPER ---------- */
    picker.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            if (file.type.startsWith('image/')) {
                localStorage.setItem('usos-type', 'image');
                localStorage.setItem('usos-data', reader.result);
            }

            if (file.type.startsWith('video/')) {
                localStorage.setItem('usos-type', 'video');
                localStorage.setItem('usos-data', reader.result);
            }
        };

        reader.readAsDataURL(file);
    });

})();
