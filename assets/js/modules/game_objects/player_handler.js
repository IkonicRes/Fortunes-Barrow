import { getRoomIndex } from "../game_objects.js";
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
		this.anims;

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