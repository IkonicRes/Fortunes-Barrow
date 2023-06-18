import { getAssetUrl } from "./modules/helper.js";
import { DoorHandler } from "./modules/doors.js";
import { GameObject, ObjectHandler, getRoomIndex} from "./modules/game_objects.js";
import { TurnHandler } from "./modules/turn_handler.js";
import { HUD } from "./modules/hud.js";
import { PlayerHandler } from "./modules/game_objects/player_handler.js";
import { EnemyHandler } from "./modules/game_objects/enemy_handler.js";
import { DNDApiHandler } from "./modules/api/dnd_api_handler.js";

//Level One
class startLevelOne extends Phaser.Scene {
	objectHandler
	playerHandler
	turnHandler
	doorHandler
	dndApiHandler
	showDebug;
	debugGraphics;
	cursors;
	text;
	terrain;
	collision;
	overlay;
	map;
	inputDelta;
	inputDelay;
	closedDoors;
	prevDir;
	spaceKeyIsPressed;
	gridSize;
	objectHandler;
	doorHandler;
	visitedRooms;
	enemySpawnLocations;
	enemies;
	bInput;
	hud;
	hudVisible;
	turnHandler;
	animatingIntoRoom;
	gridSize = 48;
	currentRoom;
	tileSize = 24

	preload() {
		this.objectHandler = new ObjectHandler(this);
		this.dndApiHandler = new DNDApiHandler()
		this.animatingIntoRoom = false;
		this.closedDoors = [1367, 1368, 1415, 1416];
		this.nonCollideIDs = [-1, 1409, 1410, 1361, 1362, 1365, 1366, 1413, 1414];
		this.inputDelay = 500;
		const tilemapPath = getAssetUrl("/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png");
		this.load.tilemapTiledJSON("map", getAssetUrl("/assets/images/tileset/levels/L_01/L_1.json"));
		this.load.spritesheet("fantasyDungeonTilesetTransparent", tilemapPath, { frameWidth: 16, frameHeight: 16 });
		this.load.spritesheet("player", getAssetUrl("/assets/images/characters/T_char.png"), { frameWidth: 16, frameHeight: 16 });
		this.load.spritesheet("orc",
			getAssetUrl("/assets/images/characters/T_orc.png"),
			{ frameWidth: 16, frameHeight: 16 }
		);
		this.load.spritesheet(
			"goblin",
			getAssetUrl("/assets/images/characters/T_goblin.png"),
			{ frameWidth: 16, frameHeight: 16 }
		);
		this.load.spritesheet(
			"skeleton",
			getAssetUrl("/assets/images/characters/T_skeleton.png"),
			{ frameWidth: 16, frameHeight: 16 }
		);
		this.load.spritesheet(
			"acidSplash",
			getAssetUrl("/assets/images/icons/acidSplash.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"mageArmor",
			getAssetUrl("/assets/images/icons/armore.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"bow",
			getAssetUrl("/assets/images/icons/ArrowBow.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"detectMagic",
			getAssetUrl("/assets/images/icons/delet_Magic.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"firebolt",
			getAssetUrl("/assets/images/icons/fire.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"healing",
			getAssetUrl("/assets/images/icons/healing.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"shield",
			getAssetUrl("/assets/images/icons/shield.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.load.spritesheet(
			"sword",
			getAssetUrl("/assets/images/icons/sword.png"),
			{ frameWidth: 256, frameHeight: 256 }
		);
		this.prevDir = "up";
		this.enemies = ["orc", "goblin", "skeleton"];
		this.enemySpawnLocations = [
			[
				[12, 3],
				[16, 3],
				[4, 5],
			],
			[
				[20, 0],
				[29, 0],
				[24, 0],
			],
			[
				[33, 2],
				[35, 2],
				[34, 3],
			],
			[
				[4, 11],
				[4, 13],
				[4, 15],
			],
			[
				[12, 11],
				[14, 13],
				[16, 15],
			],
			[
				[27, 11],
				[25, 13],
				[24, 14],
			],
			[
				[31, 13],
				[34, 13],
				[37, 13],
			],
			[
				[2, 21],
				[4, 24],
				[6, 22],
			],
			[
				[13, 25],
				[14, 22],
				[16, 25],
			],
			[
				[31, 24],
				[37, 24],
				[34, 21],
			],
			[
				[12, 30],
				[14, 34],
				[17, 30],
			],
			[
				[23, 34],
				[24, 34],
				[25, 34],
			],
			[
				[34, 34],
				[34, 35],
				[34, 36],
			],
		];
		this.bInput = true;
	}

	create() {
		var scale = 3;
		var playerScale = 2;

		this.map = this.add.tilemap("map");
		this.doorHandler = new DoorHandler(this);
		this.turnHandler = new TurnHandler();

		const terrainLayer = this.map.addTilesetImage(
			"fantasyDungeonTilesetTransparent",
			"fantasyDungeonTilesetTransparent",
			16,
			16
		);
		this.terrain = this.map.createLayer("Terrain", terrainLayer, 0, 0);
		this.collision = this.map.createLayer("Collision", terrainLayer, 0, 0);
		new GameObject([1200, 1200], "player", "player", this);
		const player = this.objectHandler.getObject("player")
		player.setScale(playerScale);
		this.playerHandler = new PlayerHandler(player, this)

		this.overlay = this.map.createLayer("Overlay", terrainLayer, 0, 0);
		this.terrain.setScale(scale);
		this.overlay.setScale(scale);
		this.collision.setScale(scale);

		this.collision.setCollisionByExclusion([-1]);

		this.physics.add.collider(
			player,
			this.collision
		);

		this.cameras.main.startFollow(player);

		this.debugGraphics = this.add.graphics();
		this.speed = 32;
		this.movementDelay = 100; // Delay between each movement step in milliseconds

		this.cursors = this.input.keyboard.createCursorKeys();

		this.text = this.add.text(16, 16, "", {
			fontSize: "20px",
			fill: "#ffffff",
		});
		this.text.setScrollFactor(0);
		this.updateText();
		this.visitedRooms = ["room_2_2"];
		this.spawnEnemies();
		this.hud = new HUD(this);
        this.hud.create();
		// Create the HUD as a rectangle covering the bottom third of the viewport
	
		this.hud.toggleHud()
		this.enemyHandler = new EnemyHandler(
			this.objectHandler,
			this.turnHandler,
			this.tileSize,
			this.map,
			this.dndApiHandler.monsterObjects,
			this
		);
	}

	boxTrigger(inputFunction) {
		inputFunction;
	}

	swapTiles(doorTiles) {
		// Get the layer containing the tiles you want to swap
		let layer = this.map.getLayer("Collision").tilemapLayer;
		console.log(doorTiles);
		for (let doorTile of doorTiles)
		{
			// Calculate tile's coordinates on the grid
			let tileX = Math.floor(doorTile.x / (16 * 3));
			let tileY = Math.floor(doorTile.y / (16 * 3));

			// Get the tile at the current coordinates
			let currentTile = layer.tilemap.getTileAt(
				tileX,
				tileY,
				true,
				"Collision"
			);

			// If the tile is one of the door tiles, replace it with the corresponding new tile
			if (this.doorHandler.doorTileTypes[currentTile.index] != undefined)
			{
				layer.putTileAt(
					this.doorHandler.doorTileTypes[currentTile.index],
					tileX,
					tileY
				);
			}
		}
	}

	checkInteract() {
		let intObj = this.getCollision(this.prevDir);
		console.log(intObj);
		if (
			Object.keys(this.doorHandler.doorTileTypes).includes(intObj.toString())
		)
		{
			console.log("Door!");
			let playerTargetCoords = this.getCollisionCoordinates(this.prevDir);
			let playerSize = 16 * 3;
			let doorLocation = {
				x: playerTargetCoords[0] * playerSize,
				y: playerTargetCoords[1] * playerSize,
			};
			this.playerHandler.lastDoorLocation = doorLocation
			let doorTiles = this.doorHandler.getAdjacentDoors(
				doorLocation.x,
				doorLocation.y
			);
			console.log(doorTiles);
			// Swap door tiles
			this.swapTiles(doorTiles);
		} else if ([0, 1, null, undefined].indexOf(intObj) >= 0)
		{
			console.log("other object!");
		}
	}

	getCollisionCoordinates(targetDirection) {
		let playerSize = 16 * 3;
		let halfPlayerSize = playerSize / 2;

		let playerLocation = [
			Math.floor(
				(this.objectHandler.getObject("player").x + halfPlayerSize) / playerSize
			),
			Math.floor(
				(this.objectHandler.getObject("player").y + halfPlayerSize) / playerSize
			),
		];

		let targetCoords = [0, 0];

		if (targetDirection === "up")
		{
			targetCoords = [playerLocation[0], Math.floor(playerLocation[1] - 0.5)];
		} else if (targetDirection === "right")
		{
			targetCoords = [Math.floor(playerLocation[0] + 0.5), playerLocation[1]];
		} else if (targetDirection === "down")
		{
			targetCoords = [playerLocation[0], Math.floor(playerLocation[1] + 0.5)];
		} else if (targetDirection === "left")
		{
			targetCoords = [Math.floor(playerLocation[0] - 0.5), playerLocation[1]];
		}

		return targetCoords;
	}

	spawnEnemies() {
		
		let tEnemy = "";
		for (let index = 0; index < this.enemySpawnLocations.length; index++)
		{
			for (
				let index1 = 0;
				index1 < this.enemySpawnLocations[index].length;
				index1++
			)
			{
				tEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
				console.log(tEnemy);
				let xPos = this.enemySpawnLocations[index][index1][0] * 48; // Multiply by the tile size
				let yPos = this.enemySpawnLocations[index][index1][1] * 52; // Multiply by the tile size
				new GameObject([xPos, yPos], tEnemy, tEnemy + index + index1, this);
				this.objectHandler.getObject(tEnemy + index + index1).setScale(2);
			}
		}
	}

	getCollision(targetDirection) {
		let targetCoords = this.getCollisionCoordinates(targetDirection);
		let index = this.map.layers[1].data[targetCoords[1]][targetCoords[0]].index;
		console.log(index);
		return index;
	}

	playerMove() {
		// LEFT
		if (this.cursors.left.isDown && !this.playerHandler.leftTimer) {
			if (this.bInput) {
				this.playerHandler.moveLeft.bind(this.playerHandler)();
			}
		} else if (!this.cursors.left.isDown && this.playerHandler.leftTimer) {
			this.playerHandler.leftTimer.remove();
			this.playerHandler.leftTimer = null;
		}

		// RIGHT
		if (this.cursors.right.isDown && !this.playerHandler.rightTimer) {
			if (this.bInput) {
				this.playerHandler.moveRight.bind(this.playerHandler)();
			}
		} else if (!this.cursors.right.isDown && this.playerHandler.rightTimer) {
			this.playerHandler.rightTimer.remove();
			this.playerHandler.rightTimer = null;
		}

		// UP
		if (this.cursors.up.isDown && !this.playerHandler.upTimer) {
			if (this.bInput) {
				this.playerHandler.moveUp.bind(this.playerHandler)();
			}
		} else if (!this.cursors.up.isDown && this.playerHandler.upTimer) {
			this.playerHandler.upTimer.remove();
			this.playerHandler.upTimer = null;
		}

		// DOWN
		if (this.cursors.down.isDown && !this.playerHandler.downTimer) {
			if (this.bInput) {
				this.playerHandler.moveDown.bind(this.playerHandler)();
			}
		} else if (!this.cursors.down.isDown && this.playerHandler.downTimer) {
			this.playerHandler.downTimer.remove();
			this.playerHandler.downTimer = null;
		}

		this.currentRoom = getRoomIndex("player", this)
		if (!this.visitedRooms.includes(this.currentRoom))
		{
			this.animatingIntoRoom = true;
			console.log("[Animation] Enter Room started");
			this.visitedRooms.push(this.currentRoom);
			console.log(this.turnHandler.turns);
			switch (this.prevDir)
			{
				case "left": {
					if (this.playerHandler.leftTimer)
					{
						this.playerHandler.leftTimer.remove();
						this.playerHandler.leftTimer = null;
					}
					this.playerHandler.moveLeft();
					this.playerHandler.moveLeft();
				}
				case "right": {
					if (this.playerHandler.rightTimer)
					{
						this.playerHandler.rightTimer.remove();
						this.playerHandler.rightTimer = null;
					}
					this.playerHandler.moveRight();
					this.playerHandler.moveRight();
				}
				case "down": {
					if (this.playerHandler.downTimer)
					{
						this.playerHandler.downTimer.remove();
						this.playerHandler.downTimer = null;
					}
					this.playerHandler.moveDown();
					this.playerHandler.moveDown();
				}
				case "up": {
					if (this.playerHandler.upTimer)
					{
						this.playerHandler.upTimer.remove();
						this.playerHandler.upTimer = null;
					}
					this.playerHandler.moveUp();
					this.playerHandler.moveUp();
				}
			}
			this.time.delayedCall(500, () => {
				this.turnHandler.addToTurns("player");
				this.objectHandler.runForEnemiesInRoom(this.currentRoom, (key) => { this.turnHandler.addToTurns(key) } );
				console.log("[Animation] Enter Room ended");
				this.animatingIntoRoom = false;
			});
		}
	}
	playerInteract() {
		const interact = () => {
			this.checkInteract();
		};
		if (this.cursors.space.isDown && !this.spaceKeyIsPressed) {
			if (this.bInput) { interact.bind(this)(); }
			this.spaceKeyIsPressed = true;
			this.time.delayedCall(500, () => {
				this.spaceKeyIsPressed = false;
			});
		}
	}

	playerAction() {
		switch(this.turnHandler.currentTurnAction) {
			case "move": {
				this.playerMove()
			}
			case "block": {

			}
			case "attack": {

			}
			case "shoot": {

			}
			case "use": {
				this.playerInteract()
			}
			default: return;
		}
	}

	playerRun() {
		this.playerHandler.moveToDoor()
	}

	playerPassTurn() {
		this.turnHandler.consumeTurn()
	}

	update(time, delta) {
		if (this.turnHandler.currentTurn == "player")
		{
			if (!this.animatingIntoRoom)
			{
				if (this.turnHandler.turns.length == 0) { 
					this.playerMove(); 
					this.playerInteract();
				} 
				else if (this.turnHandler.currentAction != "none") {
					switch (this.turnHandler.currentAction) {
						case "action": this.playerAction();
						case "pass": this.playerPassTurn();
						case "run": this.playerRun();
					}
				} else {
					if (this.playerHandler.upTimer != null) { this.playerHandler.upTimer.remove(); this.playerHandler.upTimer = null }
					if (this.playerHandler.downTimer != null) { this.playerHandler.downTimer.remove(); this.playerHandler.downTimer = null }
					if (this.playerHandler.leftTimer != null) { this.playerHandler.leftTimer.remove(); this.playerHandler.leftTimer = null }
					if (this.playerHandler.rightTimer != null) { this.playerHandler.rightTimer.remove(); this.playerHandler.rightTimer = null }
				}
			}
		} else {
			if (!this.animatingIntoRoom) {
				this.enemyHandler.enemyMove(this.turnHandler.turns[0]);
            }
        }	
	}
	  
	updateText() {
		this.text.setText(`Arrow keys to move. Space to interact. Current Turn: ${this.turnHandler.currentTurn}`);
	}

}

export { startLevelOne };