import { r1d4, r1d6, r1d8, r1d12, r1d20, r1d100 } from "../helper.js";
import { GameObject } from "../game_objects.js";



class EnemyHandler {
	constructor(objectHandler, turnHandler, tileSize = 32, map, monsterObjects, scene) {
		this.scene = scene;
		this.monsterObjects = monsterObjects;
		this.spawnEnemies()
		this.objectHandler = objectHandler;
		this.turnHandler = turnHandler;
		this.tileSize = tileSize;
		this.map = map;
	}

	spawnEnemies() {
		let tEnemy = "";
		for (let index = 0; index < this.scene.enemySpawnLocations.length; index++) {
		  for (let index1 = 0; index1 < this.scene.enemySpawnLocations[index].length; index1++) {
			tEnemy = this.scene.enemies[Math.floor(Math.random() * this.scene.enemies.length)];
			let xPos = this.scene.enemySpawnLocations[index][index1][0] * 48; // Multiply by the tile size
			let yPos = this.scene.enemySpawnLocations[index][index1][1] * 52; // Multiply by the tile size
			
			new GameObject([xPos, yPos], tEnemy, tEnemy + index + index1, this.scene)
			.setScale(2);
		  }
		}
	}

	setHealth(newHealth, enemy) {
		let object = this.objectHandler.getObject(enemy);
		newHealth = Math.max(0, Math.min(newHealth, parseInt(object.getData("maxHealth"))));
		object.setData("health", newHealth);
		console.log(newHealth)
		this.scene.hud.setEnemiesInRoom()
		if (newHealth <= 0) {
			object.destroy();
			let tArr = this.scene.turnHandler.turns.filter((element) => {
                return (element != enemy)
            })
			this.turnHandler.turns = tArr[0] != undefined ? tArr : []
			this.objectHandler.removeObject(enemy);
			if (this.turnHandler.turns.length <= 1){
				this.scene.turnHandler.currentAction = "none";
				this.scene.turnHandler.currentTurnAction = "none"
				this.scene.hud.toggleHud()
				this.scene.turnHandler.turns = []
				console.log("turns clearewd")
			}
		}
	}

	checkEnemyForData(enemyName) {
		const monsterName = enemyName.replace(/\d+$/, ""); // Remove numbers from enemyName
		const monsterObject = this.monsterObjects.find(obj => obj.name === monsterName);
		const enemy = this.scene.objectHandler.getObject(enemyName)
		if (enemy.getData("health") == undefined) {
			enemy.setData("health", monsterObject.hp)
			enemy.setData("maxHealth", monsterObject.hp)
			enemy.setData("range", monsterObject.range)
			enemy.setData("damageRoll", monsterObject.dice)
		}
	}
  
	enemyMove(enemyName) {
		console.log("Enemy Move called for", enemyName);
		this.enemy = this.objectHandler.getObject(enemyName); // Assign this.enemy
		const monsterName = enemyName.replace(/\d+$/, ""); // Remove numbers from enemyName
		this.checkEnemyForData(enemyName)
		const monsterObject = {
			health: this.enemy.getData("health"),
			maxHealth: this.enemy.getData("maxHealth"),
			range: this.enemy.getData("range"),
			damageRoll: this.enemy.getData("damageRoll"),
		}
		
		console.log("Monster Object for", enemyName, "is", monsterObject);
	  
		const player = this.objectHandler.getObject("player");
		const deltaX = player.x - this.enemy.x;
		const deltaY = player.y - this.enemy.y;
	  
		// Calculate the distance to the player
		const distanceX = Math.abs(deltaX);
		const distanceY = Math.abs(deltaY);
	  
		// Calculate the maximum allowed distance based on the enemy's range
		const maxDistance = (parseInt(this.enemy.getData("range")) + 1) * this.tileSize;
	  
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
		console.log(this.turnHandler.currentTurn)
		if (this.scene.turnHandler.currentTurn === enemyName && this.enemy.shouldAttack) {
		  this.attack(enemyName);
		}
	  
		this.scene.turnHandler.consumeTurn();
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
	
		// Check if the enemy is in attack range
		if (distanceX <= maxDistance && distanceY <= maxDistance) {
		  // Attack logic
		  const damageRoll = () => {
			const [dice, modifier] = this.enemy.getData("damageRoll").split("+");
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