import { ProgressBar } from "../hud.js";

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
	}

	setHealth(newHealth) {
		this.health = newHealth;
		this.scene.hud.progressBars[0].setProgress(
			ProgressBar.valueToPercentage(
				newHealth,
				0, this.scene.playerHandler.maxHealth
			)
		)
		if (newHealth <= 0) {
			$(location).attr("href", "./death.html");
		}
	}

	getCollisionForMovement(dir) {
		return this.scene.getCollision(dir,
			this.scene.objectHandler.getObject("player").x - this.tileSize,
			this.scene.objectHandler.getObject("player").y
		);
	}

	moveToDoor() {
		console.log("[Player Action] Running")
		const deltaX = this.player.x - this.lastDoorLocation.x;
		const deltaY = this.player.y - this.lastDoorLocation.y;
	  
		// Calculate the distance to the player
		const distanceX = Math.abs(deltaX);
		const distanceY = Math.abs(deltaY);
		console.log(deltaX, deltaY);
	  
		// Calculate the maximum allowed distance based on the enemy's range
		const maxDistance = .5 * this.scene.tileSize;
		console.log(maxDistance)
		// Check if the enemy is within the attack range
		if (distanceX <= maxDistance && distanceY <= maxDistance) {
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
		} else {
			console.log("not at door")
		  // Move towards the doors's position
		  if (
			distanceX != maxDistance - this.tileSize ||
			distanceY != maxDistance - this.tileSize
		  ) {
			console.log("movable range")
			// If outside attack range, move towards the player
			if (distanceX > distanceY) {
				console.log("X Greater")
			  // Move horizontally towards the player
			  if (deltaX < 0) { this.moveLeft(); }
			  else { this.moveRight(); }
			  //this.player.x += Math.sign(deltaX) * this.tileSize;
			} else {
				console.log("Y Greater")
				if (deltaY > 0) { this.moveUp(); }
			  	else { this.moveDown(); }
			  // Move vertically towards the player
			  //this.player.y += Math.sign(deltaY) * this.tileSize;
			}
			// OPTIONAL -> causes enemys to get a turn after running. Remove this if you want to loop running until the player leaves
			// the room to stop enemies having a chance to attack
			this.scene.turnHandler.consumeTurn()
		  }
		  
		}
	}

	moveLeft = () => {
		this.prevDir = "left";
		// Only move the player if the target tile is not a wall
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("left"))) { 
			this.scene.objectHandler.getObject("player").x -= this.movement.speed;
			this.leftTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.moveRight);
		} 
		else { console.log("Nuttin' doin'"); }
	}

	moveRight = () => {
		this.prevDir = "right";
		// Only move the player if the target tile is not a wall
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("right"))) { 
			this.scene.objectHandler.getObject("player").x += this.movement.speed;
			this.rightTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.moveRight);
		} 
		else { console.log("Nuttin' doin'"); }
	}

	moveUp = () => {
		this.prevDir = "up";
		// Only move the player if the target tile is not a wall
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("up"))) { 
			this.scene.objectHandler.getObject("player").y -= this.movement.speed;
			this.upTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.attemptMoveUp);
		} 
		else { console.log("Nuttin' doin'"); }
	}
	
	moveDown = () => {
		this.prevDir = "down";
		// Only move the player if the target tile is not a wall
		if (this.scene.nonCollideIDs.includes(this.getCollisionForMovement("down"))) { 
			this.scene.objectHandler.getObject("player").y += this.movement.speed;
			this.downTimer = this.scene.time.delayedCall(this.movement.movementDelay, this.moveDown);
		} 
		else { console.log("Nuttin' doin'"); }
	}
	
}

export { PlayerHandler }