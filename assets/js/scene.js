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
	enemySpawnLocations;
	enemies;
	bInput;
	hud;
	animatingIntoRoom;
	gridSize = 48;
	eXperience;
	riddler;
	zoomLevel;

	preload() {
		this.riddler = new Riddler();
    this.riddler.sortedRiddle = this.getRiddle();
		this.objectHandler = new ObjectHandler(this);
		this.animatingIntoRoom = false;
		this.closedDoors = [1367, 1368, 1415, 1416];
		this.nonCollideIDs = [-1, 1409, 1410, 1361, 1362, 1365, 1366, 1413, 1414];
		this.inputDelay = 500;
		const tilemapPath = getAssetUrl("/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png");
		this.load.tilemapTiledJSON("map", getAssetUrl("/assets/images/tileset/levels/L_01/L_1.json"));
		this.load.spritesheet("fantasyDungeonTilesetTransparent", tilemapPath, {frameWidth: 16, frameHeight: 16});

    // Loads player spritesheet and animations from json file
		this.load.spritesheet("playerAtlas", "assets/images/characters/playerAtlas.png", { frameWidth: 32, frameHeight: 32 });
    // JSON file name must match the first parameter of this.load.spritesheet()
    this.load.animation('playerAtlasAnimations', 'assets/playerAtlas.json')
		this.load.spritesheet(
			"orc",
			getAssetUrl("/assets/images/characters/T_orc.png"),
			{ frameWidth: 16, frameHeight: 16 }
		);
		this.load.spritesheet(
			"choiceButton",
			getAssetUrl("/assets/images/icons/choice.png"),
			{ frameWidth: 256, frameHeight: 112 }
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
		this.load.spritesheet(
			"Action",
			getAssetUrl("/assets/images/icons/Action.png"),
			{ frameWidth: 225, frameHeight: 70 }
    );
    this.load.spritesheet(
      "Pass",
      getAssetUrl("/assets/images/icons/Pass.png"),
      { frameWidth: 225, frameHeight: 70 }
    );
    this.load.spritesheet(
      "Run",
      getAssetUrl("/assets/images/icons/Run.png"),
      { frameWidth: 225, frameHeight: 70 }
		);
		this.enemies = ["orc", "goblin", "skeleton"];
		this.enemySpawnLocations = [
		[
			[12, 3],
			[16, 3],
			[13, 4],
		],
		[
			[20, 2],
			[29, 3],
			[24, 2],
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
    this.inQuiz = false;
	}

  async create() {
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
    new GameObject([1200, 1200], "playerAtlas", "player", this);
    const player = this.objectHandler.getObject("player");
    player.setScale(playerScale);
    this.playerHandler = new PlayerHandler(player, this);

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
    this.hud = new HUD(this);
    this.hud.create();
    // Create the HUD as a rectangle covering the bottom third of the viewport

		this.dndApiHandler = new DNDApiHandler();
    this.dndApiHandler.populateData()
    this.enemyHandler = new EnemyHandler(
      this.objectHandler,
      this.turnHandler,
      this.gridSize,
      this.map,
      this.dndApiHandler.monsterObjects,
      this
    );
    
  }

	getTileAt(x, y, layer="Collision") {
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
		if ( Object.keys(this.doorHandler.doorTileTypes).includes(intObj.toString())) {
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
		  this.updateDialogueText("This doesnt seem to do anything...");
		}

		// Use doorTiles here
		if (Object.keys(this.doorHandler.lockedDoorTypes).includes(intObj.toString())) {
			if (this.doorHandler.hasKey) {
				// Swap door tiles
				this.swapTiles(doorTiles);
			} else {
				this.updateDialogueText("This door is locked! Maybe there's a key somewhere...");
			} 
		} else {
			this.updateDialogueText("You unlock the door");
			if (doorTiles.some(r => [1077, 1078, 1125, 1126].indexOf(this.getTileAt(r.x, r.y).index) >= 0)) 
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

  getCollision(targetDirection) {
    let targetCoords = this.getCollisionCoordinates(targetDirection);
    let index = this.map.layers[1].data[targetCoords[1]][targetCoords[0]].index;
    return index;
  }

  playerMove() {
    this.checkInputs()
    if (this.playerHandler.currentRoom != getRoomIndex("player", this)) {
      this.playerHandler.currentRoom = getRoomIndex("player", this)
      if (this.objectHandler.getEnemiesInRoom(this.playerHandler.currentRoom).length <= 0) { return }
      
      console.log("[Animation] Enter Room started");
      this.animatingIntoRoom = true;
      this.playerHandler.lastDoorLocation = {
        x: this.playerHandler.player.x,
        y: this.playerHandler.player.y
      }

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
        this.animatingIntoRoom = false;
        if (this.riddler.bRiddling) {
          this.riddler.bRiddling = false;
          this.hud.hideButtons()
        } else {
          if (this.turnHandler.turns.length >= 1) this.hud.toggleHud();
        }
      });
    } 
	}

  async getRiddle() {
    await this.riddler.start()
    .then((riddle) => {
      this.riddler.sortedRiddle = riddle;
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
      case "move": this.playerMove(); break;
      case "use": this.playerInteract(); break;
    }
    if (this.healingSpellCooldown > 0) { this.healingSpellCooldown--; }
	  this.turnHandler.consumeTurn();
  }

  // START PLAYER MOVING TOWARD THE LAST ENTERED DOOR
  playerRun() { if (this.turnHandler.turns.length != 0) { this.playerHandler.moveToDoor(); } }

  // HELPER => USED TO EASILY UPDATE THE DIALOGUE DURING GAMEPLAY
  updateDialogueText(inputText) { this.hud.getTextArea().setText(inputText) }

  // SHOWS THE UI FOR RIDDLES AND SETS THE TEXT FOR THE ANSWERS
  showRiddle() {
    setTimeout(() => {
      console.log(this.riddler.sortedRiddle)
      // LOOPING BEHAVIOUR TO ENSURE THE RIDDLE IS LOADED (PHASER DOESNT RESPECT AWAIT)
      if (this.riddler.sortedRiddle.riddle != undefined) {
        this.updateDialogueText(this.riddler.sortedRiddle.riddle.riddle)
        for(let index = 0; index < 4; index++){
          this.hud.texts[index].component.setText(this.riddler.sortedRiddle.wrongAnswers[index]).updateText()
        }
        this.hud.showButtons()
      } else {
        this.showRiddle()
      }
    }, 2000)
  }

  update(time, delta) {
    if (!this.riddler.bRiddling && !this.doorHandler.hasKey){
      if (this.playerHandler.currentRoom == "room_0_3") {
        this.riddler.bRiddling = true
        if (!this.hud.hudVisible) {
          this.hud.toggleHud()
        }
        this.updateDialogueText("Welcome to my abode, lost one..... If you wish to leave this place, I alone hold the key. Answer my riddle and gain your freedom.")
        this.showRiddle()
      }
    } else {
      if (this.riddler.sortedRiddle.riddle != undefined) {
        if (this.riddler.selectedAnswer.toLowerCase() == this.riddler.sortedRiddle.riddle.answer.toLowerCase()){
          this.updateDialogueText("Congratulations, wanderer.. You have earned your escape. Now leave me...")
          this.doorHandler.hasKey = true;
        }
        if (this.riddler.selectedAnswer.toLowerCase() != "") {
          if (this.riddler.selectedAnswer.toLowerCase() != this.riddler.sortedRiddle.riddle.answer.toLowerCase()){
            if (this.hud.getTextArea().text != "That answer is incorrect. Beware you are trapped here until you get this correct.") {
              this.updateDialogueText("That answer is incorrect. Beware you are trapped here until you get this correct.")
            }
          }
        }
      }
    }
    if (this.doorHandler.hasKey) {
      if (this.hud.riddleVisible) {
        setTimeout(() => {
          if (this.turnHandler.turns.length <= 1) { this.hud.toggleHud(); }
          this.hud.hideButtons();
        }, 2000);
        this.hud.riddleVisible = false;
      }
    }
    if (!this.riddler.bRiddling) {
      if (
        this.turnHandler.turns[0] == "player" ||
        this.turnHandler.turns.length == 0
      ) {
        if (!this.animatingIntoRoom) {
          if (this.turnHandler.turns.length == 0) {
            this.playerMove();
            this.playerInteract();
          } else if (this.turnHandler.currentAction != "none") {
            this.updateDialogueText("It is your turn.")
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
            this.updateDialogueText("It is your turn.")
            this.checkInputs()
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
            }, 1000);
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
    }
    
    
    this.hud.hudComponents[8].setProgress(
      ProgressBar.valueToPercentage(this.eXperience, 0, 9999));
    }

  checkInputs() {
    // LEFT
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

export { startLevelOne };
