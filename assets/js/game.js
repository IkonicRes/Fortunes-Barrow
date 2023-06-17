import { getRoomIndex } from "./modules/game_objects.js";

var repoName = "/Team-Grumbly-Project01";
const baseDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
const r1d4 = () => Math.ceil(Math.random() * 4);
const r1d6 = () => Math.ceil(Math.random() * 6);
const r1d8 = () => Math.ceil(Math.random() * 8);
const r1d10 = () => Math.ceil(Math.random() * 10);
const r1d12 = () => Math.ceil(Math.random() * 12);
const r1d20 = () => Math.ceil(Math.random() * 20);
const r1d100 = () => Math.ceil(Math.random() * 100);

function getAssetUrl(assetPath) {
	return baseDir + assetPath;
}

class DoorHandler {
	constructor(scene) {
		this.mapSize = {
			width: scene.map.width,
			height: scene.map.height,
		};
		this.scene = scene;
		this.doorTileTypes = {
			1367: 1361,
			1368: 1362,
			1415: 1409,
			1416: 1410,
			495: -1,
			1363: 1365,
			1364: 1366,
			1411: 1413,
			1412: 1414,
		};
		this.lockedDoorTypes = {
			1363: 1365,
			1364: 1366,
			1411: 1413,
			1412: 1414,
		};
		this.hasKey = false;
	}

	getAdjacentDoors(x, y) {
		let playerSize = 16 * 3;
		// Grid coordinates for the current door tile
		let doorLocation = [Math.floor(x / playerSize), Math.floor(y / playerSize)];
		// Define directions for a 2x2 square around the current door tile
		const directions = [
			[0, 0],
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1],
			[-1, -1],
			[-1, 1],
			[1, -1],
			[1, 1],
		];
		// To store the locations of door tiles
		let doorTiles = [];

		for (let dir of directions)
		{
			let targetCoords = [doorLocation[0] + dir[0], doorLocation[1] + dir[1]];
			let targetWorldCoords = {
				x: targetCoords[0] * playerSize,
				y: targetCoords[1] * playerSize,
			};
			// Check if target coords are within map bounds
			if (
				targetCoords[0] >= 0 &&
				targetCoords[0] < this.mapSize.width &&
				targetCoords[1] >= 0 &&
				targetCoords[1] < this.mapSize.height
			)
			{
				let targetTile = this.scene.collision.getTileAtWorldXY(
					targetWorldCoords.x,
					targetWorldCoords.y,
					false
				);
				console.log(
					`Checking tile at (${targetWorldCoords.x}, ${targetWorldCoords.y
					}) - Index: ${targetTile ? targetTile.index : "None"}`
				);
				Object.keys(this.doorTileTypes).forEach((element) => {
					if (targetTile && targetTile.index == element)
					{
						if (
							Object.keys(this.lockedDoorTypes).includes(
								targetTile.index.toString()
							)
						)
						{
							if (!this.hasKey)
							{
								return;
							}
						}
						doorTiles.push({ x: targetWorldCoords.x, y: targetWorldCoords.y });
					}
				});
			} else
			{
				console.log(
					`Coordinates (${targetWorldCoords.x}, ${targetWorldCoords.y}) out of map bounds.`
				);
			}
		}
		return doorTiles;
	}
}

// OBJECT HANDLER FOR EASIER HANDLING OF MULTIPLE SPRITES
class ObjectHandler {
	constructor(scene) {
		this.objects = {};
		this.scene = scene;
	}

	addObject(object, name) {
		object.setData("name", name);
		this.objects[name] = object;
	}
	getObject(name) {
		return this.objects[name];
	}
	removeObject(name) {
		this.objects[name].destroy();
		delete this.objects[name];
	}
	update() {
		Object.keys(this.objects).forEach((element) => {
			this.objects[element].update();
		});
	}

	getAllEnemies(callback=(key) => {}) {
		let tArray = []
		Object.keys(this.objects).forEach((key) => {
			if (["goblin", "skeleton", "orc"].includes(this.objects[key].texture.key)) {
				tArray.push(key);
				callback(key)
			}
		});
		return tArray;
	}

	runForEnemiesInRoom(roomIndex, callback=(key) => {}) {
		Object.keys(this.objects).forEach((key) => {
			if (getRoomIndex(key, this.scene) == roomIndex) {
				if (["goblin", "skeleton", "orc"].includes(this.objects[key].texture.key)) {
					callback(key)
				}
			}
		})
	}

	getEnemiesInRoom(roomIndex, callback=(key) => {}) {
		let tArray = []
		Object.keys(this.objects).forEach((key) => {
			if (getRoomIndex(key, this.scene) == roomIndex) {
				if (["goblin", "skeleton", "orc"].includes(this.objects[key].texture.key)) {
					tArray.push(key);
					callback(key)
				}
			}
		})
		return tArray
	}

}

class GameObject {
	constructor(pos, sprite, name, scene) {
		scene.objectHandler.addObject(
			scene.physics.add.sprite(pos[0], pos[1], sprite),
			name
		);
	}
}

class TurnHandler {
	constructor() {
		this.turns = [];
		this.currentTurn = "player";
		this.currentAction = "none";
		this.currentTurnAction = "none";
	}
	
	consumeTurn() {
		let currentTurn = this.turns.shift();
		this.addToTurns(currentTurn);
		this.currentTurn = this.turns[0];
		console.log(this.turns);
		console.log(this.currentTurn);
	}

	setCurrentAction(action) { this.currentAction = action }
	addToTurns(name) { this.turns.push(name); }
	addToNextTurn(name) { this.turns = this.turns.unshift(name); }
}

class startLevelOne extends Phaser.Scene {
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

	preload() {
		this.animatingIntoRoom = false;
		this.objectHandler = new ObjectHandler(this);
		this.closedDoors = [1367, 1368, 1415, 1416];
		this.nonCollideIDs = [-1, 1409, 1410, 1361, 1362, 1365, 1366, 1413, 1414];
		this.inputDelay = 500;
		const tilemapPath = getAssetUrl("/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png");
		this.load.tilemapTiledJSON("map", getAssetUrl("/assets/images/tileset/levels/L_01/L_1.json"));
		this.load.spritesheet("fantasyDungeonTilesetTransparent", tilemapPath, { frameWidth: 16, frameHeight: 16 });
		this.load.spritesheet("player", getAssetUrl("/assets/images/characters/T_char.png"), { frameWidth: 16, frameHeight: 16 });
		this.load.spritesheet(
			"orc",
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
		console.log(this.objectHandler);
		this.overlay = this.map.createLayer("Overlay", terrainLayer, 0, 0);
		this.terrain.setScale(scale);
		this.overlay.setScale(scale);
		this.collision.setScale(scale);

		this.collision.setCollisionByExclusion([-1]);

		this.objectHandler.getObject("player").setScale(playerScale);

		this.physics.add.collider(
			this.objectHandler.getObject("player"),
			this.collision
		);

		this.cameras.main.startFollow(this.objectHandler.getObject("player"));

		this.debugGraphics = this.add.graphics();
		this.speed = 32;
		this.movementDelay = 100; // Delay between each movement step in milliseconds

		let leftTimer, rightTimer, upTimer, downTimer;

		this.cursors = this.input.keyboard.createCursorKeys();

		this.text = this.add.text(16, 16, "", {
			fontSize: "20px",
			fill: "#ffffff",
		});
		this.text.setScrollFactor(0);
		this.updateText();
		this.prevGridX = Math.floor(
			this.objectHandler.getObject("player").x / this.gridSize
		);
		this.prevGridY = Math.floor(
			this.objectHandler.getObject("player").y / this.gridSize
		);
		this.visitedRooms = ["room_2_2"];
		this.spawnEnemies();

		// Create the HUD as a rectangle covering the bottom third of the viewport
		// Define section height based on the HUD size
		this.hud = this.add.graphics();
		this.hud.fillStyle(0x000000, 0.8); // Black color with 80% opacity
		this.hud.fillRect(
			0,
			(this.scale.height * 2) / 3,
			this.scale.width,
			this.scale.height / 3
		);
		this.hud.setScrollFactor(0); // The HUD won't scroll with the camera
		// HUD position
		let hudPosition = { x: 0, y: (this.scale.height * 2) / 3 }; // HUD starts at 2/3 of the height
		let hudHeight = this.scale.height / 3;
		let sectionHeight = hudHeight / 4;
		// Define the size of the progress bars
		let progressBarDimensions = { width: 200, height: 20 };

		// Define section height based on the HUD size
		let sectionWidth = this.scale.width; // full width of HUD// height of HUD divided into four sections

		// Create progress bars
		let progressBars = ["progressBar1", "progressBar2", "progressBar3"].map(
			(bar, i) => {
				let progressBar = this.add.graphics();
				progressBar.fillStyle(0xffffff);
				progressBar.fillRect(
					hudPosition.x,
					hudPosition.y +
					sectionHeight * i +
					progressBarDimensions.height / 0.5,
					progressBarDimensions.width,
					progressBarDimensions.height
				);
				progressBar.setScrollFactor(0);
				return progressBar;
			}
		);

		// Image names and setup
		let imageNames = ["orc", "goblin", "skeleton"];
		let images = imageNames.map((name, i) => {
			let image = this.add
				.image(
					hudPosition.x + sectionWidth / 6,
					hudPosition.y + sectionHeight * i + sectionHeight / 1.2,
					name
				)
				.setDepth(9999);
			image.setOrigin(0.5);
			image.setScrollFactor(0);
			return image;
		});

		// Text area setup
		let textArea = this.add.text(
			hudPosition.x + sectionWidth / 3,
			hudPosition.y + sectionHeight * 2,
			"This is sample Dialogue text",
			{ font: "16px Arial", fill: "#ffffff" }
		);
		textArea.setOrigin(0.5);
		textArea.setScrollFactor(0).setDepth(10000); // ensure it's above other elements

		// Button images and setup
		let buttonImages = [
			"actionButtonImage",
			"passButtonImage",
			"runButtonImage",
		];

		let buttonSpacing = this.scale.height / 3 / 4; // Equal spaces for buttons
		let buttonHeight = buttonSpacing * 0.8; // Height of each button (80% of the space, for example)
		let buttons = [];
		buttonImages.forEach((img, i) => {
			let button;
			// The buttons are set to the quarter of the width of the HUD and have the same height
			button = this.add
				.image(
					hudPosition.x + sectionWidth * 0.875,
					hudPosition.y + buttonSpacing * i + buttonSpacing / 1,
					img
				)
				.setInteractive()
				.setDepth(9999);
			button.setOrigin(0.5);
			button.setDisplaySize(sectionWidth / 6, buttonHeight);
			button.setScrollFactor(0);
			buttons.push(button);
		});
		// Button click handlers
		buttons[0].on("pointerdown", () => {
			console.log("Action");
		});
		buttons[1].on("pointerdown", ()=> { this.playerPassTurn() });
		buttons[2].on("pointerdown", () => {
			console.log("Run");
		});

		// Create the cycling image button separately
		// List of images to cycle through
		let cycleImages = [
			"acidSplash",
			"mageArmor",
			"bow",
			"detectMagic",
			"firebolt",
			"healing",
			"shield",
			"sword",
		];
		let currentImageIndex = 0;

		// Determine the scale factor
		let scaleFactor = 0.9;

		// Create the cycling image button separately
		let cyclingImageButton = this.add
			.image(
				hudPosition.x + (sectionWidth / 4) * 2.5,
				hudPosition.y + hudHeight / 2,
				cycleImages[currentImageIndex]
			)
			.setInteractive()
			.setDepth(10000);
		cyclingImageButton.setOrigin(0.5, 0.5); // Set the origin to the middle of the image
		cyclingImageButton.setScale(scaleFactor, scaleFactor); // Use setScale() method
		cyclingImageButton.setScrollFactor(0);

		// Add the cycling image button to the array of buttons
		buttons.push(cyclingImageButton);

		// Cycle to the next image when the button is clicked
		cyclingImageButton.on("pointerdown", () => {
			currentImageIndex = (currentImageIndex + 1) % cycleImages.length; // Cycle index
			cyclingImageButton.setTexture(cycleImages[currentImageIndex]); // Change image
			cyclingImageButton.setOrigin(0.5, 0.5); // Set the origin to the middle of the new image
			cyclingImageButton.setScale(scaleFactor, scaleFactor); // Apply the scale factor to the new image
		});
		// this.toggleHud()
	}

	boxTrigger(inputFunction) {
		inputFunction;
	}

	toggleHud() {
		// If the HUD is currently visible, hide it
		if (this.hudVisible)
		{
			this.tweens.add({
				targets: [this.hud, this.hudText],
				y: this.scale.height, // Move the HUD to below the bottom of the viewport
				duration: 500, // 500ms transition duration
				ease: "Power2",
			});
		}
		// If the HUD is currently hidden, show it
		else
		{
			this.tweens.add({
				targets: [this.hud, this.hudText],
				y: (this.scale.height * 2) / 3, // Move the HUD to the bottom third of the viewport
				duration: 500, // 500ms transition duration
				ease: "Power2",
			});
		}

		// Toggle the HUD visibility
		this.hudVisible = !this.hudVisible;
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
		const moveLeft = () => {
			// Get the id of the tile the player will be in after moving left
			let leftTileId = this.getCollision(
				"left",
				this.objectHandler.getObject("player").x - this.tileSize,
				this.objectHandler.getObject("player").y
			);
			this.prevDir = "left";
			// Only move the player if the target tile is not a wall
			if (this.nonCollideIDs.includes(leftTileId))
			{
				this.objectHandler.getObject("player").x -= this.speed;
				this.leftTimer = this.time.delayedCall(this.movementDelay, moveLeft);
			} else
			{
				console.log("Nuttin' doin'");
			}
		};

		const moveRight = () => {
			// Get the id of the tile the player will be in after moving right
			let rightTileId = this.getCollision(
				"right",
				this.objectHandler.getObject("player").x + this.tileSize,
				this.objectHandler.getObject("player").y
			);
			this.prevDir = "right";
			// Only move the player if the target tile is not a wall
			if (this.nonCollideIDs.includes(rightTileId))
			{
				this.objectHandler.getObject("player").x += this.speed;
				this.rightTimer = this.time.delayedCall(this.movementDelay, moveRight);
			} else
			{
				console.log("Nuttin' doin'");
			}
		};

		const moveUp = () => {
			// Get the id of the tile the player will be in after moving up
			let upTileId = this.getCollision(
				"up",
				this.objectHandler.getObject("player").x,
				this.objectHandler.getObject("player").y - this.tileSize
			);
			this.prevDir = "up";
			// Only move the player if the target tile is not a wall
			if (this.nonCollideIDs.includes(upTileId))
			{
				this.objectHandler.getObject("player").y -= this.speed;
				this.upTimer = this.time.delayedCall(this.movementDelay, moveUp);
			} else
			{
				console.log("Nuttin' doin'");
			}
		};

		const moveDown = () => {
			// Get the id of the tile the player will be in after moving down
			let downTileId = this.getCollision(
				"down",
				this.objectHandler.getObject("player").x,
				this.objectHandler.getObject("player").y + this.tileSize
			);
			this.prevDir = "down";
			// Only move the player if the target tile is not a wall
			if (this.nonCollideIDs.includes(downTileId))
			{
				this.objectHandler.getObject("player").y += this.speed;
				this.downTimer = this.time.delayedCall(this.movementDelay, moveDown);
			} else
			{
				console.log("Nuttin' doin'");
			}
		};
		if (this.cursors.left.isDown && !this.leftTimer)
		{
			if (this.bInput)
			{
				moveLeft.bind(this)();
			}
		} else if (!this.cursors.left.isDown && this.leftTimer)
		{
			this.leftTimer.remove();
			this.leftTimer = null;
		}

		if (this.cursors.right.isDown && !this.rightTimer)
		{
			console.log(this.bInput);
			if (this.bInput)
			{
				moveRight.bind(this)();
			}
		} else if (!this.cursors.right.isDown && this.rightTimer)
		{
			this.rightTimer.remove();
			this.rightTimer = null;
		}
		if (this.cursors.up.isDown && !this.upTimer)
		{
			if (this.bInput)
			{
				moveUp.bind(this)();
			}
		} else if (!this.cursors.up.isDown && this.upTimer)
		{
			this.upTimer.remove();
			this.upTimer = null;
		}
		if (this.cursors.down.isDown && !this.downTimer)
		{
			if (this.bInput)
			{
				moveDown.bind(this)();
			}
		} else if (!this.cursors.down.isDown && this.downTimer)
		{
			this.downTimer.remove();
			this.downTimer = null;
		}
		let currentRoom = getRoomIndex("player", this);
		if (!this.visitedRooms.includes(currentRoom))
		{
			this.animatingIntoRoom = true;
			console.log("[Animation] Enter Room started");
			this.visitedRooms.push(currentRoom);
			console.log(this.turnHandler.turns);
			switch (this.prevDir)
			{
				case "left": {
					if (this.leftTimer)
					{
						this.leftTimer.remove();
						this.leftTimer = null;
					}
					moveLeft();
				}
				case "right": {
					if (this.rightTimer)
					{
						this.rightTimer.remove();
						this.rightTimer = null;
					}
					moveRight();
				}
				case "down": {
					if (this.downTimer)
					{
						this.downTimer.remove();
						this.downTimer = null;
					}
					moveDown();
				}
				case "up": {
					if (this.upTimer)
					{
						this.upTimer.remove();
						this.upTimer = null;
					}
					moveUp();
				}
			}
			this.time.delayedCall(300, () => {
				this.turnHandler.addToTurns("player");
				this.objectHandler.runForEnemiesInRoom(currentRoom, (key) => { this.turnHandler.addToTurns(key) } );
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
	}

	playerPassTurn() {
		this.turnHandler.consumeTurn()
	}

	update(time, delta) {
		let gameCursors = this.cursors;
		const prevX = this.objectHandler.getObject("player").x;
		const prevY = this.objectHandler.getObject("player").y;

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
					if (this.upTimer != null) { this.upTimer.remove(); this.upTimer = null }
					if (this.downTimer != null) { this.downTimer.remove(); this.downTimer = null }
					if (this.leftTimer != null) { this.leftTimer.remove(); this.leftTimer = null }
					if (this.rightTimer != null) { this.rightTimer.remove(); this.rightTimer = null }
				}
			}
		} else {
			if (!this.animatingIntoRoom) {
				// ENEMY TURN LOGIC
				this.turnHandler.consumeTurn();
			}
		}
	}

	updateText() {
		this.text.setText(`Arrow keys to move. Space to interact.`);
	}
}

const config = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	scene: startLevelOne,
	physics: {
		default: "arcade",
		arcade: {
			debug: true, // Set to true for collision debugging
		},
	},
};

const game = new Phaser.Game(config);

$(document).ready(function () {
	var audio = document.getElementById("menu-music");
	var muteButton = $("#mute");
	var beginButton = $("#begin");

	audio.muted = true; // Initially set the audio to muted
	muteButton.text("🔊"); // Set muteButton to "unmute" state

	// Function to handle playing the audio
	function playAudio() {
		audio.muted = false;
		audio.play();
		muteButton.text("🔇"); // Change the muteButton to "mute" state after audio starts playing
	}

	// Play the audio on the first click of the #begin button
	beginButton.one("click", function () {
		playAudio();
	});

	muteButton.on("click", function (event) {
		event.stopPropagation();

		if (audio.paused)
		{
			audio.play();
			muteButton.text("🔇");
		} else
		{
			audio.pause();
			muteButton.text("🔊");
		}
	});

	// Change location on #play button click
	$("#play").on("click", function () {
		$(location).attr("href", "./game.html");
	});
});

/// DND Fetch calls ///
function createMonster(monsterCurrentData) {
	// console.log(monsterCurrentData.hit_dice)
	// console.log(monsterCurrentData.hit_points)
	var monsterObject = {
		name: monsterCurrentData.name,
		hp: monsterCurrentData.hit_points,
		dice: monsterCurrentData.actions[0].damage[0].damage_dice,
	};
	return monsterObject;
	// console.log(monsterObject)
}
function createSpell(spellCurrentData) {
	// console.log(monsterCurrentData.hit_points)
	var spellObject = {
		name: spellCurrentData.name,
		desc: spellCurrentData.desc,
		damage: spellCurrentData.damage,
		range: spellCurrentData.range,
		duration: spellCurrentData.duration,
	};
	return spellObject;
}

function createWeapon(weaponCurrentData) {
	var weaponObject = {
		name: weaponCurrentData.name,
		damage: weaponCurrentData.damage,
		range: weaponCurrentData.weapon_range,
	};
	return weaponObject;
}

var desiredSpells = ["Mage Armor", "Acid Splash"];
var weaponData = [];
var spellData = [];

var desiredMonsters = ["orc", "skeleton", "goblin"];
var monsterData = [];

function fetchMonsterData(monsters) {
	return (
		Promise.all([
			fetch("https://www.dnd5eapi.co/api/monsters/" + monsters[0]).then(
				(response) => response.json()
			),
			fetch("https://www.dnd5eapi.co/api/monsters/" + monsters[1]).then(
				(response) => response.json()
			),
			fetch("https://www.dnd5eapi.co/api/monsters/" + monsters[2]).then(
				(response) => response.json()
			),
		])
			.then((data) => {
				monsterData = data;
				console.log(monsterData);
				return monsterData;
			})
			//   .then(monsterData => console.log(monsterData))
			.catch((error) => console.error("Error:", error))
	);
}

function fetchWeaponData() {
	return Promise.all([
		fetch("https://www.dnd5eapi.co/api/equipment/shortbow").then((response) =>
			response.json()
		),
		fetch("https://www.dnd5eapi.co/api/equipment/longsword").then((response) =>
			response.json()
		),
		fetch("https://www.dnd5eapi.co/api/equipment/shield").then((response) =>
			response.json()
		),
	]).then((data) => {
		weaponData = data;
		return data;
	});
}
function fetchSpellData() {
	return Promise.all([
		fetch("https://www.dnd5eapi.co/api/spells/mage-armor").then((response) =>
			response.json()
		),
		fetch("https://www.dnd5eapi.co/api/spells/acid-splash").then((response) =>
			response.json()
		),
		fetch("https://www.dnd5eapi.co/api/spells/detect-magic").then((response) =>
			response.json()
		),
		fetch("https://www.dnd5eapi.co/api/spells/fire-bolt").then((response) =>
			response.json()
		),
		fetch("https://www.dnd5eapi.co/api/spells/heal").then((response) =>
			response.json()
		),
	]).then((data) => {
		spellData = data; // Assign the resolved data to the existing spellData variable
		return data;
	});
}
// <<<<<<< feature/objectRequests
var spellObjects = [];
var weaponObjects = [];
var monsterObjects = [];
function getSortData() {
	for (let index = 0; index < spellData.length; index++)
	{
		spellObjects.push(createSpell(spellData[index]));
	}
	console.log(spellObjects);
	// =======

	// function getSortData(){
	//   var weaponData = fetchWeaponData()
	//   var monsterData = fetchMonsterData()
	//   var spellData = fetchSpellData()
	//   console.log(weaponData)
	// >>>>>>> main
	//   for (let index = 0; index < weaponData.length; index++) {
	//     weaponObjects.push(createWeapon(weaponData[index]))
	//   }
	//   console.log(weaponObjects)
	//   for (let index = 0; index < monsterData.length; index++) {
	//     monsterObjects.push(createMonster(monsterData[index]))
	//   }
	//   console.log(monsterObjects)
}
