import { getAssetUrl } from "./modules/helper.js";
import { DoorHandler } from "./modules/doors.js";
import {
  GameObject,
  ObjectHandler,
  getRoomIndex,
} from "./modules/game_objects.js";
import { TurnHandler } from "./modules/turn_handler.js";
import { HUD } from "./modules/hud.js";
import { PlayerHandler } from "./modules/game_objects/player_handler.js";
import { EnemyHandler } from "./modules/game_objects/enemy_handler.js";
import { DNDApiHandler } from "./modules/api/dnd_api_handler.js";
import { ProgressBar } from "./modules/hud.js";
import { Riddler } from "./questions.js";

//Level One
class startLevelOne extends Phaser.Scene {
	objectHandler;
	playerHandler;
	turnHandler;
	doorHandler;
	dndApiHandler;
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
	spaceKeyIsPressed;
	gridSize;
	enemySpawnLocations;
	enemies;
	bInput;
	hud;
	animatingIntoRoom;
	gridSize = 48;
	playerTileset;
	eXperience;
	PLAYER_FRAME_RATE;
	bRiddling;
	riddler;
	sortedRiddle;
	bHasKey;
	zoomLevel;

	preload() {
		this.objectHandler = new ObjectHandler(this);
		this.dndApiHandler = new DNDApiHandler();
    this.dndApiHandler.populateData()
		this.animatingIntoRoom = false;
		this.closedDoors = [1367, 1368, 1415, 1416];
		this.nonCollideIDs = [-1, 1409, 1410, 1361, 1362, 1365, 1366, 1413, 1414];
		this.inputDelay = 500;
		const tilemapPath = getAssetUrl(
			"/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png"
		);
		this.load.tilemapTiledJSON(
			"map",
			getAssetUrl("/assets/images/tileset/levels/L_01/L_1.json")
		);
		this.load.spritesheet("fantasyDungeonTilesetTransparent", tilemapPath, {
			frameWidth: 16,
			frameHeight: 16,
		});
		this.load.spritesheet(
			"playerAtlas",
			"assets/images/characters/playerAtlas.png",
			{ frameWidth: 32, frameHeight: 32 }
		);
		this.PLAYER_FRAME_RATE = 10;
		this.riddler = new Riddler();
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
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"mageArmor",
			getAssetUrl("/assets/images/icons/armore.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"bow",
			getAssetUrl("/assets/images/icons/ArrowBow.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"detectMagic",
			getAssetUrl("/assets/images/icons/delet_Magic.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"firebolt",
			getAssetUrl("/assets/images/icons/fire.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"healing",
			getAssetUrl("/assets/images/icons/healing.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"shield",
			getAssetUrl("/assets/images/icons/shield.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
		this.load.spritesheet(
			"sword",
			getAssetUrl("/assets/images/icons/sword.png"),
			{ frameWidth: 1024, frameHeight: 1024 }
		);
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
		this.eXperience = 0;
		this.bHasKey = false;
    this.inQuiz = false;
	}

  create() {
    var scale = 3;
    var playerScale = 2;
    this.sortedRiddle = this.getRiddle();
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
    const player = this.objectHandler.getObject("player");
    player.setScale(playerScale);
    this.playerHandler = new PlayerHandler(player, this);
    this.anims.create({
      key: "left",
      frames: [
        { key: "playerAtlas", frame: 165 },
        { key: "playerAtlas", frame: 166 },
        { key: "playerAtlas", frame: 167 },
        { key: "playerAtlas", frame: 168 },
        { key: "playerAtlas", frame: 169 },
        { key: "playerAtlas", frame: 170 },
        { key: "playerAtlas", frame: 171 },
        { key: "playerAtlas", frame: 172 },
      ],
      frameRate: this.PLAYER_FRAME_RATE,
      repeat: 0,
    });

    this.anims.create({
      key: "right",
      frames: [
        { key: "playerAtlas", frame: 229 },
        { key: "playerAtlas", frame: 230 },
        { key: "playerAtlas", frame: 231 },
        { key: "playerAtlas", frame: 232 },
        { key: "playerAtlas", frame: 233 },
        { key: "playerAtlas", frame: 234 },
        { key: "playerAtlas", frame: 235 },
        { key: "playerAtlas", frame: 236 },
      ],
      frameRate: this.PLAYER_FRAME_RATE,
      repeat: 0,
    });

    this.anims.create({
      key: "up",
      frames: [
        { key: "playerAtlas", frame: 133 },
        { key: "playerAtlas", frame: 134 },
        { key: "playerAtlas", frame: 135 },
        { key: "playerAtlas", frame: 136 },
        { key: "playerAtlas", frame: 137 },
        { key: "playerAtlas", frame: 138 },
        { key: "playerAtlas", frame: 139 },
        { key: "playerAtlas", frame: 140 },
      ],
      frameRate: this.PLAYER_FRAME_RATE,
      repeat: 0,
    });

    this.anims.create({
      key: "down",
      frames: [
        { key: "playerAtlas", frame: 197 },
        { key: "playerAtlas", frame: 198 },
        { key: "playerAtlas", frame: 199 },
        { key: "playerAtlas", frame: 200 },
        { key: "playerAtlas", frame: 201 },
        { key: "playerAtlas", frame: 202 },
        { key: "playerAtlas", frame: 203 },
        { key: "playerAtlas", frame: 204 },
      ],
      frameRate: this.PLAYER_FRAME_RATE,
      repeat: 0,
    });

    this.anims.create({
      key: "stop-left",
      frames: [{ key: "playerAtlas", frame: 172 }],
    });
    this.anims.create({
      key: "stop-right",
      frames: [{ key: "playerAtlas", frame: 236 }],
    });
    this.anims.create({
      key: "stop-up",
      frames: [{ key: "playerAtlas", frame: 140 }],
    });
    this.anims.create({
      key: "stop-down",
      frames: [{ key: "playerAtlas", frame: 204 }],
    });
    this.overlay = this.map.createLayer("Overlay", terrainLayer, 0, 0);
    this.terrain.setScale(scale);
    this.overlay.setScale(scale);
    this.collision.setScale(scale);

    this.collision.setCollisionByExclusion([-1]);

    this.physics.add.collider(player, this.collision);

    // Create a texture with 32x32 px frames

    this.cameras.main.startFollow(player);
    player.anims.play("up");
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
    this.spawnEnemies();
    this.hud = new HUD(this);
    this.hud.create();
    // Create the HUD as a rectangle covering the bottom third of the viewport

    this.enemyHandler = new EnemyHandler(
      this.objectHandler,
      this.turnHandler,
      this.gridSize,
      this.map,
      this.dndApiHandler.monsterObjects,
      this
    );
  }

	getTileAt(x, y, layer) {
		return this.map.getLayer(layer).tilemapLayer.tilemap.getTileAt(
			Math.floor(x / (16 * 3)),
			Math.floor(y / (16 * 3)),
			true,
			layer
		);
	}

	boxTrigger(inputFunction) {
		inputFunction;
	}

	swapTiles(doorTiles) {
		for (let doorTile of doorTiles) {
			// Get the tile at the current coordinates
			let tileX = Math.floor(doorTile.x / (16 * 3))
			let tileY = Math.floor(doorTile.y / (16 * 3))
			let currentTile = this.getTileAt(doorTile.x, doorTile.y, "Collision")
			// If the tile is one of the door tiles, replace it with the corresponding new tile
			if (this.doorHandler.doorTileTypes[currentTile.index] != undefined) {
				this.map.getLayer("Collision").tilemapLayer.putTileAt(
					this.doorHandler.doorTileTypes[currentTile.index],
					tileX,
					tileY
				);
			}
		}
	}

	checkInteract() {
		let doorTiles = []; // Initialize doorTiles here
		let intObj = this.getCollision(this.playerHandler.prevDir);
		if (
		Object.keys(this.doorHandler.doorTileTypes).includes(intObj.toString())
		) {
		let playerTargetCoords = this.getCollisionCoordinates(
			this.playerHandler.prevDir
		);
		let playerSize = 16 * 3;
		let doorLocation = {
			x: playerTargetCoords[0] * playerSize,
			y: playerTargetCoords[1] * playerSize,
		};
		this.playerHandler.lastDoorLocation = doorLocation;
		doorTiles = this.doorHandler.getAdjacentDoors(
			doorLocation.x,
			doorLocation.y
		);
		} else if ([0, 1, null, undefined].indexOf(intObj) >= 0) {
		console.log("other object!");
		}

		// Use doorTiles here
		if (Object.keys(this.doorHandler.lockedDoorTypes).includes(intObj.toString())) {
			console.log("Locked door detected");
			if (this.bHasKey) {
				console.log("Key found, swapping tiles");
				// Swap door tiles
				this.swapTiles(doorTiles);
			} else {
				console.log("No key found, updating text area");
				this.hud.textArea.setText("This door is locked! Maybe there's a key somewhere...");
			} 
		} else {
			console.log("Not a locked door, swapping tiles");
			
			if (doorTiles.some(r => [1077, 1078, 1125, 1126].indexOf(this.getTileAt(r.x, r.y, "Collision").index) >= 0)) 
			{
				this.time.delayedCall(500, () => {
					this.playerHandler.endGame()
				});
			}
			this.swapTiles(doorTiles);
			
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

    if (targetDirection === "up") {
      targetCoords = [playerLocation[0], Math.floor(playerLocation[1] - 0.5)];
    } else if (targetDirection === "right") {
      targetCoords = [Math.floor(playerLocation[0] + 0.5), playerLocation[1]];
    } else if (targetDirection === "down") {
      targetCoords = [playerLocation[0], Math.floor(playerLocation[1] + 0.5)];
    } else if (targetDirection === "left") {
      targetCoords = [Math.floor(playerLocation[0] - 0.5), playerLocation[1]];
    }

    return targetCoords;
  }

  spawnEnemies() {
    // let tEnemy = "";
    // for (let index = 0; index < this.enemySpawnLocations.length; index++) {
    //   for (
    //     let index1 = 0;
    //     index1 < this.enemySpawnLocations[index].length;
    //     index1++
    //   ) {
    //     tEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
    //     let xPos = this.enemySpawnLocations[index][index1][0] * 48; // Multiply by the tile size
    //     let yPos = this.enemySpawnLocations[index][index1][1] * 52; // Multiply by the tile size
    //     new GameObject([xPos, yPos], tEnemy, tEnemy + index + index1, this).setScale(2);
    //   }
    // }
  }

  getCollision(targetDirection) {
    let targetCoords = this.getCollisionCoordinates(targetDirection);
    let index = this.map.layers[1].data[targetCoords[1]][targetCoords[0]].index;
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
    if (this.playerHandler.currentRoom != getRoomIndex("player", this)) {
		this.playerHandler.currentRoom = getRoomIndex("player", this)
		if (this.objectHandler.getEnemiesInRoom(this.playerHandler.currentRoom).length <= 0) { return }
      	this.animatingIntoRoom = true;
      	console.log("[Animation] Enter Room started");
	  
		this.playerHandler.lastDoorLocation = {
			x: this.playerHandler.player.x,
			y: this.playerHandler.player.y
		}
		// this.hud.toggleHud()
		switch (this.playerHandler.prevDir) {
			case "left": {
			if (this.playerHandler.leftTimer) {
				this.playerHandler.leftTimer.remove();
				this.playerHandler.leftTimer = null;
			}
			this.playerHandler.moveLeft();
			this.playerHandler.moveLeft();
			}
			case "right": {
			if (this.playerHandler.rightTimer) {
				this.playerHandler.rightTimer.remove();
				this.playerHandler.rightTimer = null;
			}
			this.playerHandler.moveRight();
			this.playerHandler.moveRight();
			}
			case "down": {
			if (this.playerHandler.downTimer) {
				this.playerHandler.downTimer.remove();
				this.playerHandler.downTimer = null;
			}
			this.playerHandler.moveDown();
			this.playerHandler.moveDown();
			}
			case "up": {
			if (this.playerHandler.upTimer) {
				this.playerHandler.upTimer.remove();
				this.playerHandler.upTimer = null;
			}
			this.playerHandler.moveUp();
			this.playerHandler.moveUp();
			}
		}
		this.time.delayedCall(500, () => {
			this.objectHandler.runForEnemiesInRoom(this.playerHandler.currentRoom, (key) => {
			this.turnHandler.addToTurns(key);
			});
			this.turnHandler.addToNextTurn("player");
			console.log("[Animation] Enter Room ended");
			this.hud.setEnemiesInRoom();
			console.log(this.turnHandler.turns)
			if (this.playerHandler.currentRoom == "room_0_3" && !this.bRiddling) {
			console.log("A Quiz!");
			this.bRiddling = true;
			this.hud.getTextArea().setText(this.sortedRiddle.riddle.riddle);
			this.bHasKey = true;
			}
			this.animatingIntoRoom = false;
			this.hud.toggleHud()
		});
	} 
	}

  getRiddle() {
    this.riddler.start().then((riddle) => {
      this.sortedRiddle = riddle;
    });
  }

  playerInteract() {
    const interact = () => {
      this.checkInteract();
    };
    if (this.cursors.space.isDown && !this.spaceKeyIsPressed) {
      if (this.bInput) {
        interact.bind(this)();
      }
      this.spaceKeyIsPressed = true;
      this.time.delayedCall(500, () => {
        this.spaceKeyIsPressed = false;
      });
    }
  }

  playerAction() {
    switch (this.turnHandler.currentTurnAction) {
      case "move": {
        this.playerMove();
      }
      case "block": {
      }
      case "attack": {
      }
      case "shoot": {
      }
      case "use": {
        this.playerInteract();
      }
    }
	this.turnHandler.consumeTurn();
  }

  playerRun() {
    if (this.turnHandler.turns.length != 0) {
      this.playerHandler.moveToDoor();
    }
  }

  update(time, delta) {
    if (
      this.turnHandler.turns[0] == "player" ||
      this.turnHandler.turns.length == 0
    ) {
      if (!this.animatingIntoRoom) {
        if (this.turnHandler.turns.length == 0) {
          this.playerMove();
          this.playerInteract();
        } else if (this.turnHandler.currentAction != "none") {
			console.log(this.turnHandler.currentAction)
          switch (this.turnHandler.currentAction) {
            case "action":
              this.playerAction();
            case "pass":
              this.turnHandler.consumeTurn();
            case "run":
              this.playerRun();
          }
        }
         else {
          if (this.cursors.left.isDown && !this.playerHandler.leftTimer) {
            if (this.bInput) {
              this.playerHandler.moveLeft.bind(this.playerHandler)();
              this.turnHandler.consumeTurn()
            }
          } else if (!this.cursors.left.isDown && this.playerHandler.leftTimer) {
            this.playerHandler.leftTimer.remove();
            this.playerHandler.leftTimer = null;
          }

          // RIGHT
          if (this.cursors.right.isDown && !this.playerHandler.rightTimer) {
            if (this.bInput) {
              this.playerHandler.moveRight.bind(this.playerHandler)();
              this.turnHandler.consumeTurn()
            }
          } else if (!this.cursors.right.isDown && this.playerHandler.rightTimer) {
            this.playerHandler.rightTimer.remove();
            this.playerHandler.rightTimer = null;
          }

          // UP
          if (this.cursors.up.isDown && !this.playerHandler.upTimer) {
            if (this.bInput) {
              this.playerHandler.moveUp.bind(this.playerHandler)();
              this.turnHandler.consumeTurn()
            }
          } else if (!this.cursors.up.isDown && this.playerHandler.upTimer) {
            this.playerHandler.upTimer.remove();
            this.playerHandler.upTimer = null;
          }

          // DOWN
          if (this.cursors.down.isDown && !this.playerHandler.downTimer) {
            if (this.bInput) {
              this.playerHandler.moveDown.bind(this.playerHandler)();
              this.turnHandler.consumeTurn()
            }
          } else if (!this.cursors.down.isDown && this.playerHandler.downTimer) {
            this.playerHandler.downTimer.remove();
            this.playerHandler.downTimer = null;
          }
        }
      }
      
      if (
        this.cursors.left.isUp &&
        this.cursors.right.isUp &&
        this.cursors.up.isUp &&
        this.cursors.down.isUp
      ) {
        if (this.anims.currentAnim) {
          const currentKey = this.anims.currentAnim.key;
          const direction = currentKey.split("-")[1]; // Get the direction from the key of the current animation
          this.anims.play("stop-" + direction, true);
        }
      }
    } else {
      if (this.objectHandler.getEnemiesInRoom(getRoomIndex("player", this)).length >= 1) {
        
        this.hud.setEnemiesInRoom();
        if (!this.animatingIntoRoom) {
          this.enemyHandler.enemyMove(this.turnHandler.turns[0]);
          setTimeout(() => {
            this.scene.resume();
          }, 200);
          this.scene.pause();
        }
        
      } else {
        if (this.hud.hudVisible) {
          this.scene.tweens.add({
            targets: this.hud.hudComponents,
            duration: 500,    
            ease: "Power2",
            onComplete: () => {
              this.hud.hudComponents.forEach((component) => {
                component.setVisible(false);
              });
            },
          });
        }
      }
    }
    this.hud.hudComponents[8].setProgress(
      ProgressBar.valueToPercentage(this.eXperience, 0, 9999)
      );
      if (this.currentRoom == "room_0_3"){
        console.log("In Quiz room!")
      }
    }

  updateText() {
    this.text.setText(
      `Arrow keys to move. Space to interact. Current Turn: ${this.turnHandler.currentTurn}`
    );
  }
}

export { startLevelOne };
