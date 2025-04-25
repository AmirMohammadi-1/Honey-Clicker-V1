"use strict";

		//Creating the Counter 
		const counter = new Counter("counter", "cps", "Message Box", 'Reward Box', "Achievement Box", "Reward Box");
		
		//// Creating below a Button object corresponding to each Button created above
		//BigPotato
		const bigPotato = new ClickingButton("HoneyComb", counter);
		
		// The WorkerBee button
		const building0 = new BuildingButton("WorkerBee", counter, 50, 1);

		//The 4 types of buildings
		const building1 = new BuildingButton("Field", counter, 500, 5);
		const building2 = new BuildingButton("Hive", counter, 5000, 25);
		const building3 = new BuildingButton("Apiary", counter, 50000, 50);
		const building4 = new BuildingButton("Green House", counter, 200000, 250);

		const buildings = [building0, building1, building2, building3, building4]
		
		//The 4 types of building upgrades
		const upgrade1 = new UpgradeButton("Pollination", counter, 5000, 1.2, building1);
		const upgrade2 = new UpgradeButton("Hatchery", counter, 50000, 1.2, building2);
		const upgrade3 = new UpgradeButton("Queen Bee", counter, 500000, 1.2, building3);
		const upgrade4 = new UpgradeButton("Bee Keeper", counter, 2000000, 1.2, building4);
		
		const upgrades = [upgrade1, upgrade2, upgrade3, upgrade4]

		//Creating the 5 types of bonus buttons and adding them to the counter

	    counter.addBonusButton(new BonusButton("HoneyPot", counter, 5, 20));

		// Function for allowing HoneyCombBackdrop to fade in at half scroll
		window.addEventListener('scroll', () => {
			const scrollY = window.scrollY;
			const windowHeight = window.innerHeight;
		
			// Fade in honey backdrop
			const fadeStart = windowHeight / 10;
			const fadeEnd = windowHeight;
		
			let opacity = (scrollY - fadeStart) / (fadeEnd - fadeStart);
			opacity = Math.min(Math.max(opacity, 0), 1); // Clamp between 0–1
		
			document.querySelector('.background-layer.honey').style.opacity = opacity;
		  });
		
		function loadGame(buildings, upgrades) {
			buildings.forEach(b => b.loadState());
			upgrades.forEach(b => b.loadState());
		}
		
		function saveGame(buildings, upgrades) {
			buildings.forEach(b => b.saveState());
			upgrades.forEach(b => b.saveState());
		}

		window.addEventListener("load", () => {
			loadGame(buildings, upgrades);
		});
		