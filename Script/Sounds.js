"use strict"

// Game sounds

document.addEventListener('DOMContentLoaded', () => {

// Plays a sound whenever the main Potato (Gif) button is clicked
	const playClickSound = () => {
		const sound = new Audio('Audio/MainPop.mp3');
		sound.play();
	};

    // Allows for overlap by making another instance of the mp3
	const bigPotato = document.getElementById('BigPotato');
	if (bigPotato) {
		bigPotato.addEventListener('click', playClickSound);
	}
});