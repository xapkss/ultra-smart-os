// GitHub: addon-wallpaper.js

// 1. Apna Pic URL yahan daalo
const myWallpaper = "https://github.com/xapkss/ultra-smart-os/blame/93b7e24f1065fd0a72c3317f29f87e9234415ee0/my.mp4";

// 2. System ko command do
UltraOS.log("Addon Connected Successfully!");
UltraOS.setWallpaper(myWallpaper, 'image');

// 3. (Optional) User ko hello bolo
UltraOS.notify("Welcome to Ultra OS 2.0");
