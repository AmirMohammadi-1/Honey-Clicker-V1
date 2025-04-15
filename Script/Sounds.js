"use strict"

// Game sounds

document.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = new Audio('Audio/NCRLofi.mp3');
    backgroundMusic.volume = 0; // Start silent
    backgroundMusic.loop = true;

    // Gradually fade in to target volume
    const fadeInMusic = () => {
        let currentVolume = 0;
        const targetVolume = 0.1;
        const step = 0.01;
        const intervalTime = 200;

        backgroundMusic.play();

        const fadeIn = setInterval(() => {
            if (currentVolume < targetVolume) {
                currentVolume += step;
                backgroundMusic.volume = Math.min(currentVolume, targetVolume);
            } else {
                clearInterval(fadeIn);
            }
        }, intervalTime);
    };
    fadeInMusic();


    // Click sound for the potato button
    const playClickSound = () => {
        const sound = new Audio('Audio/MainPop.mp3');
        sound.play();
    };

    const bigPotato = document.getElementById('BigPotato');
    if (bigPotato) {
        bigPotato.addEventListener('click', playClickSound);
    }
});
