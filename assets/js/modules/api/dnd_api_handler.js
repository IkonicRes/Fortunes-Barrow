/// DND Fetch calls ///
class DNDApiHandler {
	
    desiredMonsters = ["orc", "skeleton", "goblin"];

	constructor() {
		this.weaponData = [];
		this.spellData = [];
		this.monsterData = [];
		this.monsterObjects = [];
		this.spellObjects = [];
		this.weaponObjects = [];
		this.ranges = {
			orc: 2,
			goblin: 1,
			skeleton: 3
		}
		this.populateData();
	}
	// USED TO BE CALLED getSortData()
	async populateData() {
		try {
			// Wait for each Promise to resolve before moving to the next line
			await this.fetchWeaponData()
			await this.fetchMonsterData(this.desiredMonsters)
			await this.fetchSpellData()
			
			for (let index = 0; index < this.weaponData.length; index++) { this.weaponObjects.push(this.createWeapon(this.weaponData[index])) }
			for (let index = 0; index < this.monsterData.length; index++) { this.monsterObjects.push(this.createMonster(this.monsterData[index])) }
			// note that you were calling createMonster instead of createSpell here
			for (let index = 0; index < this.spellData.length; index++) { this.spellObjects.push(this.createSpell(this.spellData[index])) }
		} catch (error) {
			console.error("Error:", error)
		}
	}

	fetchSpellData() {
		return Promise.all([
			fetch("https://www.dnd5eapi.co/api/spells/mage-armor").then( (response) =>response.json() ),
			fetch("https://www.dnd5eapi.co/api/spells/acid-splash").then( (response) => response.json() ),
			fetch("https://www.dnd5eapi.co/api/spells/detect-magic").then( (response) => response.json() ),
			fetch("https://www.dnd5eapi.co/api/spells/fire-bolt").then( (response) => response.json() ),
			fetch("https://www.dnd5eapi.co/api/spells/heal").then( (response) => response.json() ),
		]).then((data) => {
			this.spellData = data; // Assign the resolved data to the existing spellData variable
		});
	}

	fetchWeaponData() {
		return Promise.all([
			fetch("https://www.dnd5eapi.co/api/equipment/shortbow").then( (response) => response.json() ),
			fetch("https://www.dnd5eapi.co/api/equipment/longsword").then((response) => response.json() ),
			fetch("https://www.dnd5eapi.co/api/equipment/shield").then((response) => response.json() ),
		]).then((data) => {
			this.weaponData = data;
		});
	}

	fetchMonsterData(monsters) {
		return (
			Promise.all([
				fetch("https://www.dnd5eapi.co/api/monsters/" + monsters[0]).then( (response) => response.json() ),
				fetch("https://www.dnd5eapi.co/api/monsters/" + monsters[1]).then( (response) => response.json() ),
				fetch("https://www.dnd5eapi.co/api/monsters/" + monsters[2]).then( (response) => response.json() ),
			])
			.then((data) => {
				this.monsterData = data;
			})
			.catch((error) => console.error("Error:", error))
		);
	}

	createMonster(monsterCurrentData) {
		var monsterName = monsterCurrentData.name.toLowerCase();  // convert name to lower case
	
		var monsterObject = {
			name: monsterName,
			hp: monsterCurrentData.hit_points,
			dice: monsterCurrentData.actions[0].damage[0].damage_dice,
			range: this.ranges[monsterName]  // use the lower case name to fetch the range
		};
		console.log(monsterObject)
		return monsterObject;
	}

	createSpell(spellCurrentData) {
		var spellObject = {
			name: spellCurrentData.name,
			desc: spellCurrentData.desc,
			damage: spellCurrentData.damage || '1d8+3',
			range: spellCurrentData.range,
			duration: spellCurrentData.duration,
		};
		return spellObject;
	}
	

	createWeapon(weaponCurrentData) {
		var weaponObject = {
			name: weaponCurrentData.name,
			damage: weaponCurrentData.damage || '1d8+3',
			range: weaponCurrentData.weapon_range,
		};
		return weaponObject;
	}
}

export { DNDApiHandler }