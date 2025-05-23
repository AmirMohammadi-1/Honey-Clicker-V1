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

class Button
{
	// CLASS: Button
	//
	//
	// REMARKS: This class is an abstract overarching class that all clickable buttons fall under. allows visual
	//interactive button clicking and each subclass is a different kind of button that can be clicked.
	//
	//
	//-----------------------------------------


	//
	//Instance variables
	//
	#name;
	#counter;
	#htmlButton;
	
	//
	//Class constants
	//
	static get TEXT_ATTRIBUTE() { return "-text"; }
	
	//
	//Constructor
	//
	constructor(name, counter)
	{
		if(this.constructor.name === "Button"){//makes class abstract
			throw new Error("cannot make an instance of a button, this is abstract");
		}
		this.#name = name;
		this.#counter = counter;
		this.#htmlButton = document.getElementById(name);
		// Add a click event listener to the button
		this.#htmlButton.addEventListener('click', this.clickAction.bind(this)); //this has a different meaning in this context, so I need to bind my method to it
	}
	
	//Updating the innerHTML text of the button 
	//(note that not all types of buttons have text, but I placed this here to give that code to you)
	updateText(newText)
	{
		document.getElementById(this.name + Button.TEXT_ATTRIBUTE).innerHTML = newText;
	}
	
	//
	//Accessors below that you might find useful
	//
	get name()
	{
		return this.#name;
	}
	
	get counter()
	{
		return this.#counter;
	}
	
	get htmlButton()
	{
		return this.#htmlButton;
	}

	//abstract class that enables an action when clicked.
	//param: none
	//return: none
	clickAction(){
		throw new Error("the clickAction method is missing");
	}
}


class buyableButton extends Button{
	// CLASS: Button
	//
	//
	// REMARKS: This class is a subclass of Button, meaning it is a clickable object however this is also an abstract
	//class (no instance can be made of this) this is a specificaiton of button meant to buttons that can be pressed
	//to purchase something (an upgrade or building for example).
	//
	//
	//-----------------------------------------

	//instance var:
	#price;
	#basePrice;


	//constructor:
	constructor(name, counter, price) {
		super(name,counter);
		if(this.constructor.name ==="buyableButton"){//makes abstract
			throw new Error("cannot make an instance of a buyable button ");
		}
		this.#price = price;
		this.#basePrice = price;
	}


	subtractCost(){//removes the comb's that were needed to buy
		this.counter.increment(-this.#price);//remove the combs just used to buy the upgrade
	}

	//getters and setters:
	get price(){
		return this.#price;
	}

	set price(value) {
		this.#price = value;
	}

	updatePrice(numOfObject){
		this.#price = this.#basePrice * Math.pow(1.15, numOfObject);
	}

	/*
	increaseCost(numOfObject){
		this.#price = this.#basePrice * Math.pow(1.15, numOfObject);
	}

	 */
}

class ClickingButton extends Button{
	// CLASS: Button
	//
	//
	// REMARKS: This class is a subclass of button, in particular a button that can be used to click over and over again
	//to get comb's directly (big comb button)
	//
	//
	//-----------------------------------------
	static get #CLICK_INCREMENT(){return 1;}//value to increment a comb when clicked


	//constructor:
	constructor(name, counter){
		super(name, counter);
	}


	//purpose: action performed when clicking a button (big comb), adds 1 comb to our inventory and prints to reflect
	//param: none
	//return: none
	clickAction(){
		this.counter.increment(ClickingButton.#CLICK_INCREMENT);//increment up a comb
		this.counter.showMessage("+1");//prints to show a comb was added

		// 5 new pop sounds for the main click action
		const pop1 = new Audio("Audio/Pop1.mp3");
		const pop2 = new Audio("Audio/Pop2.mp3");
		const pop3 = new Audio("Audio/Pop3.mp3");
		const pop4 = new Audio("Audio/Pop4.mp3");
		const pop5 = new Audio("Audio/Pop5.mp3");

		// make an array of pop sounds
		const popSounds = [pop1, pop2, pop3, pop4, pop5];

		// chooses a pop sound from said array randomly
		const chosenSound = popSounds[Math.floor(Math.random() * popSounds.length)];

		// lowers initial volume, then plays for the user
		chosenSound.volume = 0.2;
		chosenSound.play();
	}

	

}

class BuildingButton extends buyableButton{
	// CLASS: BuildingButton
	//
	//
	// REMARKS: This class is a button, but more specifically a button with a purchase related to it so it extends
	//buyableButton. this class allows to buy a building which enhances the pps, each building costs something else
	//and increases cost to buy by a set rate after each purchase
	//
	//
	//-----------------------------------------

	//private instance variables:
	#rate;
	#numberOfBuilding;

	static get #BUILDING_PRICE_INCREASE(){return 1.5}//how much the building increase by

	//constructor:
	constructor(name, counter, price, rate){
		super(name, counter, price);
		this.#rate = rate;
		this.#numberOfBuilding = 0;//counter for how many buildings there are
	}

	// Save state function for building buttons
	saveState(){
		// set building key for future reference
		const key = `building_${this.name}`;

		// set data for referral using localStorage.getItem ...
		const data = {
			numberOfBuildings: this.#numberOfBuilding,
			price: this.price,
			rate: this.#rate
		}
		localStorage.setItem(key, JSON.stringify(data));
	}

	// Load state function for fetching building button info
	async loadState(buildings, upgrades) {
		// fetch key corresponding to given name
		const key = `building_${this.name}`;

		// search localStorage for the saved data
		const savedData = localStorage.getItem(key);

		// if localStorage returns true, update data accordingly... if not, reset to default below
		if (savedData) {
			const data = JSON.parse(savedData);
			this.#numberOfBuilding = data.numberOfBuildings;
			this.price = data.price;
			this.#rate = data.rate;
			this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost: ${Math.floor(this.price)}<br>Adds: ${this.#rate.toFixed(0)} cps`);
		} else {
			// re-apply the rate based on how many were purchased
			this.counter.updateRate(this.#numberOfBuilding * this.#rate);

			// update display text
			this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost: ${Math.floor(this.price)}<br>Adds: ${this.#rate.toFixed(0)} cps`);
		}

		if (this.name == 'WorkerBee') {
			if (this.#numberOfBuilding > 1) {
				for (let i = 0; i < this.#numberOfBuilding; i++) {
					WorkerBeeNum++;
					WorkerBeeBox.insertAdjacentHTML(
						"beforeend",
						`<div class="orbiter" style="--i: ${WorkerBeeNum}"></div>`
					);
					await new Promise(resolve => setTimeout(resolve, 300)); // delay bee spawning
				}
				
			}
			// WorkerBeeBox global var is called, and a new "orbiter" (WorkerBee) is appended to the end of the box
			
		}

		
	}


	//performs an action when clicked, that is purchase the building, increase pps and increase building cost based
	//on the buildings instance variables and how many buildings there are.
	//param: none
	//return: none
	clickAction(){
		if(this.counter.count >= this.price) {//if the user has enough comb's the buy the building
			
			this.subtractCost();
			this.#numberOfBuilding++;//increase the number of buildings
			this.counter.updateRate(this.#rate);//update the rate at which combs are being produced per sec.
			this.updatePrice(this.#numberOfBuilding);//updates the price of building


			//update the buttons text
			this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost:
			${Math.floor(this.price)}<br>Adds: ${Math.floor(this.#rate)} cps`);

			const sound2 = new Audio('Audio/BeeBuzz.mp3');
        	sound2.play();

			if (this.name == "WorkerBee") { // "spawns" a WorkerBee!

				WorkerBeeNum++; // Increment WorkerBeeNum

				// WorkerBeeBox global var is called, and a new "orbiter" (WorkerBee) is appended to the end of the box
				WorkerBeeBox.insertAdjacentHTML(
					"beforeend",
					`<div class="orbiter" style="--i: ${WorkerBeeNum}"></div>` // Dynamically adds more WorkerBees based on number of global bees
				  );

				// Check for "swarm" threshold, and play audio accordingly
				if (WorkerBeeNum >= 10) {
					const swarm = new Audio("Audio/Swarm.mp3");
					swarm.loop = true;
					swarm.play();
				}
			}

			this.saveState();
		} 
	}


	//purpose: method to increase the rate of a building, effectivly applying a multiplier to the each buildings pps
	//this method is meant to be called by outside methods
	//param: multplier meants to multiply the rate of the building
	//return: none
	increaseRate(multiplier){
		//update rate via multiplying by numBuilding*multiplier*rate - numBuilding*rate
		//because if someone wishes to add another upgrade later down the line with a diff multiplier
		this.counter.updateRate(Math.floor((this.#numberOfBuilding * multiplier * this.#rate) -
			this.#numberOfBuilding * this.#rate));

		this.#rate *= multiplier;//increases the rate how much it costs.
		//updates text to reflect
		this.updateText(`${this.#numberOfBuilding} ${this.name}<br>Cost: ${Math.floor(this.price)}<br>Adds: ${this.#rate.toFixed(0)} cps`);

	}

	get numberOfBuilding(){
		return this.#numberOfBuilding;
	}

}


class UpgradeButton extends buyableButton{
	// CLASS: upgradeButton
	//
	//
	// REMARKS: This class is a buyableButton that allows an upgrade to the a buildings pps to be purchased. after a
	//purchase of this the cost of the next upgrade greatly increases.
	//
	//
	//-----------------------------------------
	//instance variables:
	#numberOfUpgrades;//how many upgrades have occured
	#multiplier;//how much the pps gets increased by
	#buildingButton;//building that gets upgraded

	static get #UPGRADE_COST_INCREASE(){return 1.2;}//how much the upgrade cost increase after each purcahse

	//constructor:
	constructor(name, counter, price, multiplier, buidingButton){
		super(name, counter, price);
		this.#multiplier = multiplier;
		this.#buildingButton = buidingButton;
		this.#numberOfUpgrades = 0;//possibly useful for future programmers how many times somethings been upgraded.
	}

	// Save state function for upgrade buttons
	saveState(buildings, upgrades){
		// set upgrade key for future reference
		const key = `upgrade_${this.name}`;

		// set data for referral using localStorage.getItem ...
		const data = {
			numberOfUpgrades: this.#numberOfUpgrades,
			price: this.price,
			multiplier: this.#multiplier
		}
		localStorage.setItem(key, JSON.stringify(data));
	}

	// Load state function for fetching upgrade button info
	async loadState(buildings, upgrades) {
		// fetch key corresponding to given name
		const key = `upgrade_${this.name}`;

		// search localStorage for the saved data
		const savedData = localStorage.getItem(key);

		// if localStorage returns true, update data accordingly...
		if (savedData) {
			const data = JSON.parse(savedData);
			this.#numberOfUpgrades = data.numberOfUpgrades;
			this.price = data.price ?? this.price;
			this.#multiplier = data.multiplier ?? this.#multiplier;

			// DO NOT reapply multiplier effect to the building again!
			// The rate is already stored/restored inside BuildingButton.loadState()

			// prints out the new button for upgrades reflecting the saved values:
			this.updateText(`${this.#numberOfUpgrades} ${this.name}<br>Cost: ${Math.floor(this.price)}<br> increases 
				${this.#buildingButton.name} <br> Prod by x${UpgradeButton.#UPGRADE_COST_INCREASE}`);
		}
	}

	//purpose: action to be performed when the button is clicked, that is buy the upgrade, remove the cost of combs,
	//increase the rate of the upgraded building and increase the cost of the next upgrade.
	//param: none
	//return: none
	clickAction(){
		if((this.counter.count >= this.price) && (this.#buildingButton.numberOfBuilding >= 1)) {//checks if the user has enough to buy upgrade
			
			this.subtractCost();//subtracts the cost from our total

			this.#numberOfUpgrades++;//increments the number of upgrades to reflect the purchase
			this.updatePrice(this.#numberOfUpgrades);//update the price of upgrade

			this.#buildingButton.increaseRate(this.#multiplier);//increase the rate of the building

			//prints out the new button for upgrades reflecting the changes:
			this.updateText(`${this.#numberOfUpgrades} ${this.name}<br>Cost: ${Math.floor(this.price)}<br> increases 
				${this.#buildingButton.name} <br> Prod by x${UpgradeButton.#UPGRADE_COST_INCREASE}`);
				
			const sound3 = new Audio('Audio/combOverdrive.mp3');
			sound3.play();
			this.saveState();	
		}
	}
}
 

class BonusButton extends Button{
	// CLASS: BonusButton
	//
	//
	// REMARKS: This class is Button, this class represents a button that applies a bonus modifier when clicked given a
	//passed duration, however the button only appears for a short interval and disappears and reappears after a longer
	//interval (90 seconds)
	//
	//
	//-----------------------------------------

	//instance variables:
	#multiplier;//how much the pps gets increased by
	#duration;//how long the effect lasts

	//constructor:
	constructor(name, counter, multiplier, duration) {
		super(name, counter);
		this.#multiplier = multiplier;
		this.#duration = duration;
	}


	//purpose: action performed after button has been clicked, hides button after being clicked, increases the total
	//pps for a short duration then reverts back to normal.
	//param: none
	//return: none
	clickAction(){
		this.showButton()//reveals the button
		//this.counter.updateMultiplier(this.#multiplier);//increases the multiplier


		let rawMultiplier = Math.random() * (5 - 1.5) + 1.5;
		let mult = Math.round(rawMultiplier * 10) / 10;
		let seconds = Math.floor(Math.random() * (60 - 5 + 1)) + 5;

		this.counter.updateMultiplier(mult);//increases the multiplier

		//shows a message for how much and how long the pps gets increased
		this.counter.showMessageReward(`multiplying cps by ${mult} for ${seconds} seconds`);

		//timer to have the increase pps stop after a certain duration
		setTimeout(() => {this.counter.updateMultiplier(1/mult);},
			seconds * Counter.SECOND_IN_MS);
		this.hideButton(); //hides the button

		const sound4 = new Audio('Audio/PowerUp.mp3');
		sound4.play();
	}

	//to make button visible:
	//param: none
	//return: none
	showButton() {
		this.htmlButton.classList.remove("hidden");
	}

	//to make the button not visible:
	//param: none
	//return: none
	hideButton() {
		this.htmlButton.classList.add("hidden");
	}
}



