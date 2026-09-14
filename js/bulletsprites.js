"use strict";

/*
==============================================================
 BULLET SPRITES
 script.js creates bullet1/bullet2/bullet3 as Component instances
 somewhere I can't see. This waits for them to exist, then applies
 your real artwork, so you don't have to dig through that file.

 bullet1 and bullet3 (the two spread shots) use bullet1.png; bullet2
 (the center shot) uses bullet2.png. Swap the paths below if you'd
 rather they all match.
==============================================================
*/
(function () {
    var attempts = 0;
    var MAX_ATTEMPTS = 100; // ~10s at 100ms polling, then give up quietly

    function applySprite(bullet, path) {
        if (!bullet) return;
        if (!bullet.image) {
            bullet.image = new Image();
            bullet.imageLoaded = false;
            bullet.image.onload = function () { bullet.imageLoaded = true; };
        }
        bullet.image.src = path;
    }

    var poll = setInterval(function () {
        attempts++;

        var ready = typeof bullet1 !== 'undefined' && bullet1 &&
                    typeof bullet2 !== 'undefined' && bullet2 &&
                    typeof bullet3 !== 'undefined' && bullet3;

        if (ready) {
            applySprite(bullet1, "images/bullet/bullet1.png");
            applySprite(bullet2, "images/bullet/bullet2.png");
            applySprite(bullet3, "images/bullet/bullet1.png");
            clearInterval(poll);
            console.log("[BULLET SPRITES] Applied bullet artwork.");
        } else if (attempts >= MAX_ATTEMPTS) {
            clearInterval(poll);
            console.warn("[BULLET SPRITES] Gave up waiting for bullet1/2/3 - they may be created differently than expected in script.js.");
        }
    }, 100);
})();