import { getRoomIndex } from "../game_objects.js";
import { ProgressBar } from "../hud.js";
import { r1d4, r1d6, r1d8, r1d12, r1d20, r1d100 } from "../helper.js";

class PlayerHandler {
	constructor(player, scene){
		this.scene = scene
		this.player = player
		this.health = 100;
		this.maxHealth = 100;
		this.movement = {
			speed: 32,
			movementDelay: 100
		}
		this.prevDir = ""
		this.leftTimer, this.rightTimer, this.upTimer, this.downTimer;
		this.lastDoorLocation;
		this.anims;
		this.isBlocking = false;
		this.block = this.block.bind(this);
		this.scoresExist = (localStorage.getItem('scores') !== null)
	}

	setHealth(newHealth) {
		console.log("Am I Blocking", this.isBlocking)
		if (this.isBlocking) {
			console.log("Player blocked the attack!");
			// Calculate the mitigation based on shield's weaponObject.damage
			const [dice, modifier] = this.scene.dndApiHandler.weaponObjects[2].damage.split("+");
			const [numDice, diceType] = dice.split("d");
			let mitigation = 0;
			for (let i = 0; i < numDice; i++) {
				mitigation += eval(`r1d${diceType}()`); // Evaluate the corresponding dice function
			}
			if (modifier) {
				mitigation += parseInt(modifier);
			}
			console.log(`Damage was mitigated by ${mitigation} points.`);
			// Apply mitigation to the newHealth
			newHealth = Math.max(newHealth - mitigation, 0);
			this.isBlocking = false; // Reset the block status
		}
		this.health = newHealth + (this.scene.eXperience / 50);
		console.log(newHealth)
		this.scene.hud.hudComponents[7].setProgress(
			ProgressBar.valueToPercentage(
				newHealth,
				0, this.scene.playerHandler.maxHealth
			)
		)
		this.scene.eXperience = (this.scene.eXperience + r1d8())
		console.log("Experience: ", this.scene.eXperience)
		if (newHealth <= 0) {
			let tName = "FunkyAnon"
			console.log(this.scene.eXperience)
			let tScore = (tName + "%" + this.scene.eXperience)
        	tScores = []
			//Check if the scores exist in localstorage, and if so, parse the data, append the new score, and restringify the data to be updated in local storage
			if (scoresExist){
				JSON.parse(localStorage.getItem("allEntries"))
				tScores = JSON.parse(localStorage.getItem("scores"))
				tScores.push(tScore)
				localStorage.setItem("scores", JSON.stringify(tScores))
        	}
        //Otherwise, push the score to the empty array and stringify/set in local storage
			else{
				tScores.push(tScore)
				localStorage.setItem("scores", JSON.stringify(tScores))
			}
			$(location).attr("href", "./death.html");
		}
	}
	
	block() {
		this.isBlocking = true;
		console.log(`${this.player.name} is preparing to block the next attack.`);
	}

	getCollisionForMovement(dir) {
		return this.scene.getCollision(dir,
			this.scene.objectHandler.getObject("player").x - this.tileSize,
			this.scene.objectHandler.getObject("player").y
		);
	}

	attack(weaponKey) {
		const player = this.scene.objectHandler.getObject("player");
		const weaponObjects = this.scene.dndApiHandler.weaponObjects;
		console.log(weaponKey);
		const weapon = weaponObjects.find(weapon => weapon.name === weaponKey);
		console.log("weapon is: ", weapon)
		if (weaponKey === "shield") {
			this.block()
			console.log("Player is blocking!");
			return;
		}
	
		// Get all enemies
		const enemies = this.scene.objectHandler.getAllEnemies();
	
		// Calculate distances to all enemies
		const enemyDistances = enemies.map(enemy => {
			const distanceX = Math.abs(player.x - enemy.x) / this.tileSize;
			const distanceY = Math.abs(player.y - enemy.y) / this.tileSize;
			return {
				enemy,
				distance: Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) // Pythagorean theorem
			};
		});
	
		// Find closest enemy
		const closestEnemy = enemyDistances.sort((a, b) => a.distance - b.distance)[0];
	
		// Check if the closest enemy is within the weapon's range
		if (closestEnemy.distance <= weapon.range) {
			// Attack logic
			const damageRoll = () => {
				const [dice, modifier] = weapon.damage.split("+");
				const [numDice, diceType] = dice.split("d");
	
				let damage = 0;
	
				for (let i = 0; i < numDice; i++) {
					damage += eval(`r1d${diceType}()`); // Evaluate the corresponding dice function
				}
	
				if (modifier) {
					damage += parseInt(modifier);
				}
	
				// Apply damage to the enemy
				closestEnemy.enemy.health -= damage;
				console.log(`${player.name} attacks ${closestEnemy.enemy.name} for ${damage} damage using ${weaponKey}.`);
			};
			damageRoll();
		} else {
			console.log(`${closestEnemy.enemy.name} is not in attack range.`);
		}
	}
	
	
	moveToDoor() {
		if (this.lastDoorLocation != undefined) {
			console.log("[Player Action] Running")
			const deltaX = this.player.x - this.lastDoorLocation.x;
			const deltaY = this.player.y - this.lastDoorLocation.y;
		  
			// Calculate the distance to the player
			const distanceX = Math.abs(deltaX);
			const distanceY = Math.abs(deltaY);
			console.log(deltaX, deltaY);
		  
			// Calculate the maximum allowed distance based on the enemy's range
			const maxDistance = 1 * this.scene.gridSize/2;
			console.log(maxDistance)
			// Check if the enemy is within the attack range
			if (distanceX <= maxDistance && distanceY <= maxDistance) {
				let roomIndex = getRoomIndex("player", this.scene)
				console.log(`Infront of door`);
				if (deltaX != 0) {
					if (deltaX < 0) { this.moveLeft(); }
					else { this.moveRight(); }
				}
				if (deltaY != 0) {
					if (deltaY > 0) { this.moveUp(); }
					else { this.moveDown(); }	
				}
				this.scene.turnHandler.turns = []
				this.scene.hud.toggleHud()
				this.scene.visitedRooms = this.scene.visitedRooms.filter(function(e) { return e !== roomIndex })
				console.log("turns clearewd")
				
				// HERE IS WHERE TURN BASED COMBAT ENDS AFTER RUNNING 
			} else {
				console.log("not at door")
			  // Move towards the doors's position
			  if (
				distanceX != maxDistance - this.tileSize ||
				distanceY != maxDistance - this.tileSize
			  ) {
				console.log("movable range")
				// If outside attack range, move towards the player
				if (distanceY <= -16) {
					console.log("test")
					this.scene.turnHandler.turns = []
				} else {
					if (distanceX > distanceY) {
						console.log("X Greater")
					// Move horizontally towards the player
					if (deltaX < 0) { this.moveLeft(); }
					else { this.moveRight(); }
					} else {
						console.log("Y Greater")
						if (deltaY > 0) { this.moveUp(); }
						else { this.moveDown(); }
					}
					this.scene.turnHandler.turns = ["player"]
				}
			  }
			}
		}
	}

	moveLeft = () => {
		this.prevDir = "left";
		const player = this.scene.objectHandler.getObject("player");
    	// Only move the player if the target tile is not a wall
    	player.anims.play('left', true);
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("left"))) { 
			this.scene.objectHandler.getObject("player").x -= this.movement.speed;
			this.leftTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.moveLeft);
		} 
		else { console.log("Nuttin' doin'"); }
	}

	moveRight = () => {
		this.prevDir = "right";
		const player = this.scene.objectHandler.getObject("player");
		// Only move the player if the target tile is not a wall
		player.anims.play('right', true);
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("right"))) { 
			this.scene.objectHandler.getObject("player").x += this.movement.speed;
			this.rightTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.moveRight);
		} 
		else { console.log("Nuttin' doin'"); }
	}

	moveUp = () => {
		this.prevDir = "up";
		const player = this.scene.objectHandler.getObject("player");
		// Only move the player if the target tile is not a wall
		player.anims.play('up', true);
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("up"))) { 
			this.scene.objectHandler.getObject("player").y -= this.movement.speed;
			this.upTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.attemptMoveUp);
		} 
		else { console.log("Nuttin' doin'"); }
	}
	
	moveDown = () => {
		this.prevDir = "down";
		const player = this.scene.objectHandler.getObject("player");
		// Only move the player if the target tile is not a wall
		player.anims.play('down', true);
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("down"))) { 
			this.scene.objectHandler.getObject("player").y += this.movement.speed;
			this.downTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.moveDown);
		} 
		else { console.log("Nuttin' doin'"); }
	}

}

export { PlayerHandler }