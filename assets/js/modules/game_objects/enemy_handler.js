import { r1d4, r1d6, r1d8, r1d12, r1d20, r1d100 } from "../helper.js";

class EnemyHandler {
	constructor(objectHandler, turnHandler, tileSize = 32, map, monsterObjects, scene) {
		this.scene = scene;
		this.objectHandler = objectHandler;
		this.turnHandler = turnHandler;
		this.tileSize = tileSize;
		this.map = map;
		this.monsterObjects = monsterObjects;
	}
  
	enemyMove(enemyName) {
		console.log("Enemy Move called for", enemyName);
		const monsterName = enemyName.replace(/\d+$/, ""); // Remove numbers from enemyName
		const monsterObject = this.monsterObjects.find(obj => obj.name === monsterName);
		if (!monsterObject) {
		  console.log(`Monster object not found for ${enemyName}`);
		  return;
		}
		console.log("Monster Object for", enemyName, "is", monsterObject);
	  
		this.enemy = this.objectHandler.getObject(enemyName); // Assign this.enemy
	  
		const player = this.objectHandler.getObject("player");
		const deltaX = player.x - this.enemy.x;
		const deltaY = player.y - this.enemy.y;
	  
		// Calculate the distance to the player
		const distanceX = Math.abs(deltaX);
		const distanceY = Math.abs(deltaY);
	  
		// Calculate the maximum allowed distance based on the enemy's range
		const maxDistance = (monsterObject.range + 1) * this.tileSize;
	  
		// Check if the enemy is within the attack range
		if (distanceX <= maxDistance && distanceY <= maxDistance) {
		  // Attack or block logic goes here
		  this.enemy.shouldAttack = true;
		  console.log(`${enemyName} is in range for attack or block`);
		} else {
		  // Move towards the player's position
		  if (
			distanceX > maxDistance - this.tileSize ||
			distanceY > maxDistance - this.tileSize
		  ) {
			// If outside attack range, move towards the player
			if (distanceX > distanceY) {
			  // Move horizontally towards the player
			  this.enemy.x += Math.sign(deltaX) * this.tileSize;
			} else {
			  // Move vertically towards the player
			  this.enemy.y += Math.sign(deltaY) * this.tileSize;
			}
		  }
		  this.enemy.shouldAttack = false; // Reset shouldAttack for next turn
		}
	  
		// If it's the enemy's turn and they should attack, call the attack method
		if (this.turnHandler.currentTurn === enemyName && this.enemy.shouldAttack) {
		  this.attack(enemyName);
		}
	  
		this.turnHandler.consumeTurn();
	  }
	  
	getMonsterObject(enemyName) {
	  // Find the monster object in the monsterObjects array with the same name
	  return this.monsterObjects.find((monster) => monster.name === enemyName);
	}
  
	calculateTileDistance(deltaX, deltaY) {
	  const tileDistanceX = Math.round(Math.abs(deltaX) / this.tileSize);
	  const tileDistanceY = Math.round(Math.abs(deltaY) / this.tileSize);
	  return Math.max(tileDistanceX, tileDistanceY);
	}

	attack(enemyName) {
		const enemy = this.objectHandler.getObject(enemyName);
		const player = this.objectHandler.getObject("player");
	
		// Calculate distance
		const distanceX = Math.abs(player.x - enemy.x) / this.tileSize;
		const distanceY = Math.abs(player.y - enemy.y) / this.tileSize;
	
		// Define the maximum distance for attack range
		const maxDistance = 8 * this.tileSize; // Adjust the value as needed
	
		// Find the corresponding monster object
		const monsterObject = this.monsterObjects.find(
		  (obj) => obj.name === enemyName.replace(/\d+/g, "")
		);
	
		// Check if the enemy is in attack range
		if (distanceX <= maxDistance && distanceY <= maxDistance) {
		  // Attack logic
		  const damageRoll = () => {
			const [dice, modifier] = monsterObject.dice.split("+");
			const [numDice, diceType] = dice.split("d");

			let damage = 0;

			for (let i = 0; i < numDice; i++) {
				damage += eval(`r1d${diceType}()`); // Evaluate the corresponding dice function
			}

			if (modifier) {
				damage += parseInt(modifier);
			}
			this.scene.playerHandler.setHealth(this.scene.playerHandler.health - damage)
				
			console.log(`${enemyName} attacks the player for ${damage} damage.`);
			// Update the player's health or apply the damage to the player here
			// For example: this.objectHandler.getObject("player").health -= damage;
		};
		damageRoll();
		} else {
		  console.log(`${enemyName} is not in attack range.`);
		}
	  }
	
  
	performBlock(enemy) {
	  // Implement the block logic for the enemy
	  // ...
	  console.log(`Enemy ${enemy.name} is blocking!`);
	}
  }

export { EnemyHandler }