// GitHub: addon-wallpaper.js

// 1. Apna Pic URL yahan daalo
const myWallpaper = "https://raw.githubusercontent.com/xapkss/ultra-smart-os/main/pic.png";

// 2. System ko command do
UltraOS.log("Addon Connected Successfully!");
UltraOS.setWallpaper(myWallpaper, 'image');

// 3. (Optional) User ko hello bolo
UltraOS.notify("Welcome to Ultra OS 2.0");
