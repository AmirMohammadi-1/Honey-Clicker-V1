//-----------------------------------------
// REMARKS: This program creates an interactive comb clicker idle game with several components, with the point of
//the game is to increase your pps (comb's per second) and the speed at which you get them. it is a visual
//interactive game with a default 1pps, a big comb you can click to get one comb each time, buildings to increase
//pps, upgrades to multiply how much the pps is increased by the buildings and peroidic Bonsu combs that appear
//every 90 seconds on screen, these comb's add a multiplier to total pps for a certain duration depending on the
//type of comb clicked. there is 3 main aspects of this program, 1. the visual elements handled by the provided
//css and html files
//2. the Button.js file that houses the abstract button class which is what dictates the ability for the user to
//interact with thes screen and what result happens with different buttons (button subclasses).
//3. Counter.js which holds the Counter class that handles the games logic, speed of frame updates and pps.
//
//
//-----------------------------------------

"use strict"

// Global vars for WorkerBee #s, and WorkerBeeBox that is appended too in the main function
let WorkerBeeNum = 0;
const WorkerBeeBox = document.getElementById("WorkerBeeBox");
let swarmAudio = null; // Track swarm sound globally

class Button {
	#name;
	#counter;
	#htmlButton;

	static get TEXT_ATTRIBUTE() { return "-text"; }

	constructor(name, counter) {
		if (this.constructor.name === "Button") {
			throw new Error("cannot make an instance of a button, this is abstract");
		}
		this.#name = name;
		this.#counter = counter;
		this.#htmlButton = document.getElementById(name);
		this.#htmlButton.addEventListener('click', this.clickAction.bind(this));
	}

	updateText(newText) {
		document.getElementById(this.name + Button.TEXT_ATTRIBUTE).innerHTML = newText;
	}

	get name() { return this.#name; }
	get counter() { return this.#counter; }
	get htmlButton() { return this.#htmlButton; }

	clickAction() {
		throw new Error("the clickAction method is missing");
	}
}

class buyableButton extends Button {
	#price;
	#basePrice;

	constructor(name, counter, price) {
		super(name, counter);
		if (this.constructor.name === "buyableButton") {
			throw new Error("cannot make an instance of a buyable button ");
		}
		this.#price = price;
		this.#basePrice = price;
	}

	subtractCost() {
		this.counter.increment(-this.#price);
	}

	get price() { return this.#price; }
	set price(value) { this.#price = value; }

	updatePrice(numOfObject) {
		this.#price = this.#basePrice * Math.pow(1.15, numOfObject);
	}
}

class ClickingButton extends Button {
	static get #CLICK_INCREMENT() { return 1; }

	constructor(name, counter) {
		super(name, counter);
	}

	clickAction() {
		this.counter.increment(ClickingButton.#CLICK_INCREMENT);
		this.counter.showMessage("+1");

		const sounds = ["Pop1", "Pop2", "Pop3", "Pop4", "Pop5"];
		const chosen = `Audio/${sounds[Math.floor(Math.random() * sounds.length)]}.mp3`;
		const audio = new Audio(chosen);
		audio.volume = 0.2;
		audio.play();
	}
}

class BuildingButton extends buyableButton {
	#rate;
	#numberOfBuilding;

	static get #BUILDING_PRICE_INCREASE() { return 1.5 }

	constructor(name, counter, price, rate) {
		super(name, counter, price);
		this.#rate = rate ?? 1;
		this.#numberOfBuilding = 0;
	}

	saveState() {
		const key = `building_${this.name}`;
		const data = {
			numberOfBuildings: this.#numberOfBuilding,
			price: this.price,
			rate: this.#rate
		}
		localStorage.setItem(key, JSON.stringify(data));
	}

	async loadState(buildings, upgrades) {
		const key = `building_${this.name}`;
		const savedData = localStorage.getItem(key);

		if (savedData) {
			const data = JSON.parse(savedData);
			this.#numberOfBuilding = data.numberOfBuildings;
			this.price = data.price ?? 10;
			this.#rate = data.rate ?? 1;
	 }

		// Always apply rate and update text
		this.counter.updateRate(this.#numberOfBuilding * this.#rate);
		this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost: ${Math.floor(this.price)}<br>Adds: ${Math.floor(this.#rate)} cps`);

		if (this.name === 'WorkerBee') {
			WorkerBeeBox.innerHTML = "";
			WorkerBeeNum = 0;
			for (let i = 0; i < this.#numberOfBuilding; i++) {
				WorkerBeeNum++;
				WorkerBeeBox.insertAdjacentHTML(
					"beforeend",
					`<div class="orbiter" style="--i: ${WorkerBeeNum}"></div>`
				);
				await new Promise(resolve => setTimeout(resolve, 300));
			}
		}
	}

	clickAction() {
		if (this.counter.count >= this.price) {
			this.subtractCost();
			this.#numberOfBuilding++;
			this.counter.updateRate(this.#rate);
			this.updatePrice(this.#numberOfBuilding);

			this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost: ${Math.floor(this.price)}<br>Adds: ${Math.floor(this.#rate)} cps`);

			const sound2 = new Audio('Audio/BeeBuzz.mp3');
			sound2.play();

			if (this.name === "WorkerBee") {
				WorkerBeeNum++;
				WorkerBeeBox.insertAdjacentHTML(
					"beforeend",
					`<div class="orbiter" style="--i: ${WorkerBeeNum}"></div>`
				);
				if (WorkerBeeNum >= 10 && !swarmAudio) {
					swarmAudio = new Audio("Audio/Swarm.mp3");
					swarmAudio.loop = true;
					swarmAudio.play();
				}
			}
			this.saveState();
		}
	}

	increaseRate(multiplier) {
		const addedRate = (this.#numberOfBuilding * multiplier * this.#rate) -
			(this.#numberOfBuilding * this.#rate);
		this.counter.updateRate(Math.floor(addedRate));
		this.#rate *= multiplier;
		this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost: ${Math.floor(this.price)}<br>Adds: ${Math.floor(this.#rate)} cps`);
	}

	get numberOfBuilding() {
		return this.#numberOfBuilding;
	}
}

class UpgradeButton extends buyableButton {
	#numberOfUpgrades;
	#multiplier;
	#buildingButton;

	static get #UPGRADE_COST_INCREASE() { return 1.2; }

	constructor(name, counter, price, multiplier, buildingButton) {
		super(name, counter, price);
		this.#multiplier = multiplier;
		this.#buildingButton = buildingButton;
		this.#numberOfUpgrades = 0;
	}

	saveState(buildings, upgrades) {
		const key = `upgrade_${this.name}`;
		const data = {
			numberOfUpgrades: this.#numberOfUpgrades,
			price: this.price,
			multiplier: this.#multiplier
		}
		localStorage.setItem(key, JSON.stringify(data));
	}

	async loadState(buildings, upgrades) {
		const key = `upgrade_${this.name}`;
		const savedData = localStorage.getItem(key);

		if (savedData) {
			const data = JSON.parse(savedData);
			this.#numberOfUpgrades = data.numberOfUpgrades;
			this.price = data.price ?? this.price;
			this.#multiplier = data.multiplier ?? this.#multiplier;

			for (let i = 0; i < this.#numberOfUpgrades; i++) {
				this.#buildingButton.increaseRate(this.#multiplier);
			}

			this.updateText(`${this.#numberOfUpgrades} ${this.name}<br>Cost: <br> ${Math.floor(this.price)}<br> increases 
				${this.#buildingButton.name} <br> Prod by x${UpgradeButton.#UPGRADE_COST_INCREASE}`);
		}
	}

	clickAction() {
		if (this.counter.count >= this.price && this.#buildingButton.numberOfBuilding >= 1) {
			this.subtractCost();
			this.#numberOfUpgrades++;
			this.updatePrice(this.#numberOfUpgrades);
			this.#buildingButton.increaseRate(this.#multiplier);

			this.updateText(`${this.#numberOfUpgrades} ${this.name}<br>Cost: <br> ${Math.floor(this.price)}<br> increases 
				${this.#buildingButton.name} <br> Prod by x${UpgradeButton.#UPGRADE_COST_INCREASE}`);

			const sound3 = new Audio('Audio/combOverdrive.mp3');
			sound3.play();
			this.saveState();
		}
	}
}

class BonusButton extends Button {
	#multiplier;
	#duration;

	constructor(name, counter, multiplier, duration) {
		super(name, counter);
		this.#multiplier = multiplier;
		this.#duration = duration;
	}

	clickAction() {
		this.showButton();

		const raw = Math.random() * (5 - 1.5) + 1.5;
		const mult = Math.round(raw * 10) / 10;
		const seconds = Math.floor(Math.random() * (60 - 5 + 1)) + 5;

		this.counter.updateMultiplier(mult);
		this.counter.showMessageReward(`multiplying cps by ${mult} for ${seconds} seconds`);

		setTimeout(() => {
			this.counter.updateMultiplier(1 / mult);
		}, seconds * Counter.SECOND_IN_MS);

		this.hideButton();

		const sound4 = new Audio('Audio/PowerUp.mp3');
		sound4.play();
	}

	showButton() {
		this.htmlButton.classList.remove("hidden");
	}

	hideButton() {
		this.htmlButton.classList.add("hidden");
	}
}




