// Importing the getRoomIndex function from the game_objects.js module
import { getRoomIndex } from "./modules/game_objects.js";

// Set the repository name and base directory based on the current window location
var repoName = "/Team-Grumbly-Project01";
const baseDir = window.location.pathname.substring(
  0,
  window.location.pathname.lastIndexOf("/")
);
// Define functions for generating random numbers for various dice rolls
const r1d4 = () => Math.ceil(Math.random() * 4);
const r1d6 = () => Math.ceil(Math.random() * 6);
const r1d8 = () => Math.ceil(Math.random() * 8);
const r1d10 = () => Math.ceil(Math.random() * 10);
const r1d12 = () => Math.ceil(Math.random() * 12);
const r1d20 = () => Math.ceil(Math.random() * 20);
const r1d100 = () => Math.ceil(Math.random() * 100);

// Function to get the URL of an asset based on the asset path
function getAssetUrl(assetPath) {
  return baseDir + assetPath;
}

// Function to manage doors in game
class DoorHandler {
  constructor(scene) {
    // Get the width and height of the scene's map
    this.mapSize = {
      width: scene.map.width,
      height: scene.map.height,
    };
    this.scene = scene;
    // Define the mappings for different door tile types
    this.doorTileTypes = {
      1367: 1361, // Mapping for door tile type 1367 to door tile type 1361
      1368: 1362,
      1415: 1409,
      1416: 1410,
      495: -1, // Mapping for door tile type 495 to -1 (no door)
      1363: 1365,
      1364: 1366,
      1411: 1413,
      1412: 1414,
    };
    // Define the mappings for locked door types
    this.lockedDoorTypes = {
      1363: 1365, // Mapping for locked door type 1363 to locked door type 1365
      1364: 1366,
      1411: 1413,
      1412: 1414,
    };
    this.hasKey = false; // Flag to track if the player has a key
  }

  // Function to get the adjacent door tiles based on given coordinates (x, y)
  getAdjacentDoors(x, y) {
    let playerSize = 16 * 3; // Size of the player
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

    // Iterate through each direction
    for (let dir of directions) {
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
      ) {
        // Get the tile at the target world coordinates
        let targetTile = this.scene.collision.getTileAtWorldXY(
          targetWorldCoords.x,
          targetWorldCoords.y,
          false
        );
        console.log(
          `Checking tile at (${targetWorldCoords.x}, ${
            targetWorldCoords.y
          }) - Index: ${targetTile ? targetTile.index : "None"}`
        );
        // Iterate through each door tile type
        Object.keys(this.doorTileTypes).forEach((element) => {
          if (targetTile && targetTile.index == element) {
            // Check if the target tile is a locked door and the player has the key
            if (
              Object.keys(this.lockedDoorTypes).includes(
                targetTile.index.toString()
              )
            ) {
              if (!this.hasKey) {
                return; // Skip this tile if the player doesn't have the key
              }
            }
            // Add the door tile's coordinates to the doorTiles array
            doorTiles.push({ x: targetWorldCoords.x, y: targetWorldCoords.y });
          }
        });
      } else {
        console.log(
          `Coordinates (${targetWorldCoords.x}, ${targetWorldCoords.y}) out of map bounds.`
        );
      }
    }
    return doorTiles; // Return the array of door tile locations
  }
}

// OBJECT HANDLER FOR EASIER HANDLING OF MULTIPLE SPRITES
class ObjectHandler {
  constructor(scene) {
    this.objects = {}; // Stores the objects
    this.scene = scene; // Reference to the scene
  }

  // Add an object to the handler with a given name
  addObject(object, name) {
    object.setData("name", name);
    this.objects[name] = object;
  }

  // Get an object from the handler by its name
  getObject(name) {
    return this.objects[name];
  }

  // Remove an object from the handler by its name
  removeObject(name) {
    this.objects[name].destroy();
    delete this.objects[name];
  }

  // Update all objects in the handler
  update() {
    Object.keys(this.objects).forEach((element) => {
      this.objects[element].update();
    });
  }
  // Function that retrieves all the enemy objects from the this.objects dictionary
  getAllEnemies(callback = (key) => {}) {
    let tArray = []; // Initialize an empty array to store the keys of the enemy objects
    Object.keys(this.objects).forEach((key) => {
      if (
        // Check if the texture key of the current object is "goblin", "skeleton", or "orc"
        ["goblin", "skeleton", "orc"].includes(this.objects[key].texture.key)
      ) {
        tArray.push(key); // Add the key of the enemy object to the array
        callback(key); // Invoke the provided callback function with the key of the enemy object
      }
    });
    return tArray; // Return the array of enemy object keys
  }

  // Function that executes a provided callback function for each enemy object in a specific room
  runForEnemiesInRoom(roomIndex, callback = (key) => {}) {
    Object.keys(this.objects).forEach((key) => {
      // Iterate over the keys of the objects dictionary
      if (getRoomIndex(key, this.scene) == roomIndex) {
        if (
          // Check if the room index of the current object matches the specified room index
          ["goblin", "skeleton", "orc"].includes(this.objects[key].texture.key)
          // Check if the texture key of the current object is "goblin", "skeleton", or "orc"
        ) {
          callback(key); // Invoke the provided callback function with the key of the enemy object
        }
      }
    });
  }

  // Function that retrieves the keys of the enemy objects present in a specific room
  getEnemiesInRoom(roomIndex, callback = (key) => {}) {
    let tArray = []; // Array to store the keys of the enemy objects in the room
    Object.keys(this.objects).forEach((key) => {
      // Iterate over the keys of the objects dictionary
      if (getRoomIndex(key, this.scene) == roomIndex) {
        // Check if the room index of the current object matches the specified room index
        if (
          ["goblin", "skeleton", "orc"].includes(this.objects[key].texture.key)
        ) {
          // Check if the texture key of the current object is "goblin", "skeleton", or "orc"
          tArray.push(key); // Add the key of the enemy object to the tArray
          callback(key); // Invoke the provided callback function with the key of the enemy object
        }
      }
    });
    return tArray; // Return the array containing the keys of the enemy objects in the room
  }
}

class GameObject {
  constructor(pos, sprite, name, scene) {
    // The constructor for the GameObject class.
    // It accepts the position, sprite, name, and scene as parameters.

    // Add the sprite as a physics sprite to the scene at the specified position.
    scene.objectHandler.addObject(
      scene.physics.add.sprite(pos[0], pos[1], sprite),
      name
    );
  }
}

class TurnHandler {
  constructor() {
    // The constructor for the TurnHandler class.
    // It initializes the turns, currentTurn, currentAction, and currentTurnAction properties.

    this.turns = []; // An array to store the turn order.
    this.currentTurn = "player"; // The current turn being executed.
    this.currentAction = "none"; // The current action being performed.
    this.currentTurnAction = "none"; // The action of the current turn.
  }

  consumeTurn() {
    // Method to consume a turn and update the current turn.

    let currentTurn = this.turns.shift(); // Get the first turn from the turns array.
    this.addToTurns(currentTurn); // Add the current turn back to the turns array.
    this.currentTurn = this.turns[0]; // Update the current turn to the next turn in the array.
    console.log(this.turns);
    console.log(this.currentTurn);
  }

  setCurrentAction(action) {
    // Method to set the current action.

    this.currentAction = action; // Set the current action to the specified action.
  }
  addToTurns(name) {
    // Method to add a name to the turns array.

    this.turns.push(name); // Add the specified name to the end of the turns array.
  }
  addToNextTurn(name) {
    // Method to add a name to the beginning of the turns array.

    this.turns = this.turns.unshift(name); // Add the specified name to the beginning of the turns array.
  }
}

class startLevelOne extends Phaser.Scene {
  // The StartLevelOne class extends Phaser.Scene and represents the game scene for level one.

  showDebug; // Flag to toggle debug visuals
  debugGraphics; // Graphics object for rendering debug information
  cursors; // Input cursors for player movement
  text; // Text object for displaying game instructions
  terrain; // Terrain layer for the game map
  collision; // Collision layer for handling collisions
  overlay; // Overlay layer for visual effects
  map; // Game map object
  inputDelta; // Delta value for input handling
  inputDelay; // Delay value for input handling
  closedDoors; // Array to store closed doors
  prevDir; // Previous direction of player movement
  spaceKeyIsPressed; // Flag to track space key press
  gridSize; // Grid size for positioning game elements
  objectHandler; // Object handler for managing game objects
  doorHandler; // Door handler for managing doors
  visitedRooms; // Array to track visited rooms
  enemySpawnLocations; // Array to store enemy spawn locations
  enemies; // Array to store enemy game objects
  bInput; // Flag to track player input
  hud; // HUD (Heads-Up Display) object
  hudVisible; // Flag to toggle HUD visibility
  turnHandler; // Turn handler for managing turns
  animatingIntoRoom; // Flag to track room animation
  gridSize = 48; // Default grid size for positioning game elements

  preload() {
    // Preload function to load assets and initialize variables before the scene starts

    this.animatingIntoRoom = false; // Flag to track room animation
    this.objectHandler = new ObjectHandler(this); // Initialize object handler for managing game objects
    this.closedDoors = [1367, 1368, 1415, 1416]; // Array to store closed door IDs
    this.nonCollideIDs = [-1, 1409, 1410, 1361, 1362, 1365, 1366, 1413, 1414]; // Array of IDs for non-collidable tiles
    this.inputDelay = 500; // Delay value for input handling

    // Load tilemap and tileset assets
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

    // Load character spritesheets and icons
    this.load.spritesheet(
      "player",
      getAssetUrl("/assets/images/characters/T_char.png"),
      { frameWidth: 16, frameHeight: 16 }
    );
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
    this.prevDir = "up"; // Set the previous direction of player movement
    this.enemies = ["orc", "goblin", "skeleton"]; // Array to store enemy types

    // Array to store enemy spawn locations for each room
    this.enemySpawnLocations = [
      [
        [12, 3], // Enemy spawn location 1
        [16, 3], // Enemy spawn location 2
        [4, 5], // Enemy spawn location 3
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
    this.bInput = true; // Flag to enable input handling
  }

  create() {
    var scale = 3; // Scale factor for the tilemap
    var playerScale = 2; // Scale factor for the player sprite

    this.map = this.add.tilemap("map"); // Load the tilemap
    this.doorHandler = new DoorHandler(this); // Create a DoorHandler instance
    this.turnHandler = new TurnHandler(); // Create a TurnHandler instance

    const terrainLayer = this.map.addTilesetImage(
      "fantasyDungeonTilesetTransparent",
      "fantasyDungeonTilesetTransparent",
      16,
      16
    );
    this.terrain = this.map.createLayer("Terrain", terrainLayer, 0, 0); // Create the terrain layer
    this.collision = this.map.createLayer("Collision", terrainLayer, 0, 0); // Create the collision layer
    new GameObject([1200, 1200], "player", "player", this); // Create a player GameObject at position [1200, 1200]
    console.log(this.objectHandler);
    this.overlay = this.map.createLayer("Overlay", terrainLayer, 0, 0); // Create the overlay layer
    this.terrain.setScale(scale); // Set the scale of the terrain layer
    this.overlay.setScale(scale); // Set the scale of the overlay layer
    this.collision.setScale(scale); // Set the scale of the collision layer

    this.collision.setCollisionByExclusion([-1]); // Set collision for all tiles except -1 (empty tile)

    this.objectHandler.getObject("player").setScale(playerScale); // Set the scale of the player sprite

    this.physics.add.collider(
      this.objectHandler.getObject("player"),
      this.collision
    ); // Enable collision between the player and the collision layer

    this.cameras.main.startFollow(this.objectHandler.getObject("player")); // Make the camera follow the player

    this.debugGraphics = this.add.graphics(); // Create a graphics object for debugging
    this.speed = 32; // Movement speed
    this.movementDelay = 100; // Delay between each movement step in milliseconds

    let leftTimer, rightTimer, upTimer, downTimer;

    this.cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys for input

    this.text = this.add.text(16, 16, "", {
      fontSize: "20px",
      fill: "#ffffff",
    }); // Create a text object for displaying information
    this.text.setScrollFactor(0); // The text won't scroll with the camera
    this.updateText(); // Update the text content
    this.prevGridX = Math.floor(
      this.objectHandler.getObject("player").x / this.gridSize
    ); // Previous grid X position of the player
    this.prevGridY = Math.floor(
      this.objectHandler.getObject("player").y / this.gridSize
    ); // Previous grid Y position of the player
    this.visitedRooms = ["room_2_2"]; // Array to store visited room names
    this.spawnEnemies(); // Spawn enemies in the level

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
      hudPosition.x + sectionWidth / 3, // Set the X position of the text area based on HUD position and section width
      hudPosition.y + sectionHeight * 2, // Set the Y position of the text area based on HUD position and section height
      "This is sample Dialogue text", // Set the initial text content
      { font: "16px Arial", fill: "#ffffff" } // Define the font and fill color of the text
    );
    textArea.setOrigin(0.5); // Set the origin of the text to the center
    // Set scroll factor to 0 to prevent scrolling and set depth to ensure it's above other elements
    textArea.setScrollFactor(0).setDepth(10000);

    // Button images and setup
    let buttonImages = [
      "actionButtonImage",
      "passButtonImage",
      "runButtonImage",
    ];

    let buttonSpacing = this.scale.height / 3 / 4; // Calculate equal spacing between buttons
    let buttonHeight = buttonSpacing * 0.8; // Calculate the height of each button (80% of spacing)
    let buttons = [];
    buttonImages.forEach((img, i) => {
      let button;
      // Create an image object for each button
      button = this.add
        .image(
          hudPosition.x + sectionWidth * 0.875, // Set the X position of the button based on HUD position and section width
          hudPosition.y + buttonSpacing * i + buttonSpacing / 1, // Set the Y position of the button based on HUD position and button spacing
          img // Set the image for the button
        )
        .setInteractive() // Enable interactivity for the button
        .setDepth(9999); // Set the depth of the button to ensure it's above other elements
      button.setOrigin(0.5); // Set the origin of the button to the center
      button.setDisplaySize(sectionWidth / 6, buttonHeight); // Set the display size of the button based on section width and button height
      button.setScrollFactor(0); // Set scroll factor to 0 to prevent scrolling
      buttons.push(button); // Add the button to the array
    });
    // Button click handlers
    buttons[0].on("pointerdown", () => {
      console.log("Action");
    });
    buttons[1].on("pointerdown", () => {
      this.playerPassTurn();
    });
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
        hudPosition.x + (sectionWidth / 4) * 2.5, // Set the X position of the button based on HUD position and section width
        hudPosition.y + hudHeight / 2, // Set the Y position of the button based on HUD position and HUD height
        cycleImages[currentImageIndex] // Set the initial image of the button
      )
      .setInteractive() // Enable interactivity for the button
      .setDepth(10000); // Set the depth of the button to ensure it's above other elements
    cyclingImageButton.setOrigin(0.5, 0.5); // Set the origin to the middle of the image
    cyclingImageButton.setScale(scaleFactor, scaleFactor); // Set the initial scale factor of the button
    cyclingImageButton.setScrollFactor(0); // Set scroll factor to 0 to prevent scrolling

    // Add the cycling image button to the array of buttons
    buttons.push(cyclingImageButton);

    // Cycle to the next image when the button is clicked
    cyclingImageButton.on("pointerdown", () => {
      currentImageIndex = (currentImageIndex + 1) % cycleImages.length; // Cycle the index to the next image in the list
      cyclingImageButton.setTexture(cycleImages[currentImageIndex]); // Change the image of the button
      cyclingImageButton.setOrigin(0.5, 0.5); // Set the origin to the middle of the new image
      cyclingImageButton.setScale(scaleFactor, scaleFactor); // Apply the scale factor to the new image
    });
    // this.toggleHud()
  }

  boxTrigger(inputFunction) {
    inputFunction;
  }

  // Toggle the visibility of the HUD
  toggleHud() {
    // If the HUD is currently visible, hide it
    if (this.hudVisible) {
      this.tweens.add({
        targets: [this.hud, this.hudText],
        y: this.scale.height, // Move the HUD to below the bottom of the viewport
        duration: 500, // 500ms transition duration
        ease: "Power2",
      });
    }
    // If the HUD is currently hidden, show it
    else {
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
    for (let doorTile of doorTiles) {
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
      if (this.doorHandler.doorTileTypes[currentTile.index] != undefined) {
        layer.putTileAt(
          this.doorHandler.doorTileTypes[currentTile.index],
          tileX,
          tileY
        );
      }
    }
  }

  // Check for interaction with objects in the game
  checkInteract() {
    // Get the object that the player is colliding with based on the previous direction
    let intObj = this.getCollision(this.prevDir);
    console.log(intObj);

    // Check if the collision object corresponds to a door
    if (
      Object.keys(this.doorHandler.doorTileTypes).includes(intObj.toString())
    ) {
      console.log("Door!");

      // Get the coordinates of the player's collision with the door
      let playerTargetCoords = this.getCollisionCoordinates(this.prevDir);
      let playerSize = 16 * 3;

      // Calculate the location of the door based on the player's collision coordinates
      let doorLocation = {
        x: playerTargetCoords[0] * playerSize,
        y: playerTargetCoords[1] * playerSize,
      };

      // Get the adjacent door tiles based on the door location
      let doorTiles = this.doorHandler.getAdjacentDoors(
        doorLocation.x,
        doorLocation.y
      );
      console.log(doorTiles);
      // Swap the door tiles
      this.swapTiles(doorTiles);
      // If the collision object is not a door, check for other objects
    } else if ([0, 1, null, undefined].indexOf(intObj) >= 0) {
      console.log("other object!");
    }
  }

  // Get the collision coordinates based on the target direction
  getCollisionCoordinates(targetDirection) {
    let playerSize = 16 * 3;
    let halfPlayerSize = playerSize / 2;

    // Calculate the player's current location
    let playerLocation = [
      Math.floor(
        (this.objectHandler.getObject("player").x + halfPlayerSize) / playerSize
      ),
      Math.floor(
        (this.objectHandler.getObject("player").y + halfPlayerSize) / playerSize
      ),
    ];

    let targetCoords = [0, 0];

    // Calculate the target coordinates based on the target direction
    if (targetDirection === "up") {
      targetCoords = [playerLocation[0], Math.floor(playerLocation[1] - 0.5)];
    } else if (targetDirection === "right") {
      targetCoords = [Math.floor(playerLocation[0] + 0.5), playerLocation[1]];
    } else if (targetDirection === "down") {
      targetCoords = [playerLocation[0], Math.floor(playerLocation[1] + 0.5)];
    } else if (targetDirection === "left") {
      targetCoords = [Math.floor(playerLocation[0] - 0.5), playerLocation[1]];
    }

    return targetCoords; // Return the target coordinates
  }

  // Spawn enemies on designated locations
  spawnEnemies() {
    let tEnemy = ""; // Temporary variable to store enemy type
    // Iterate over the enemy spawn locations
    for (let index = 0; index < this.enemySpawnLocations.length; index++) {
      // Iterate over each sub-array within the enemy spawn locations
      for (
        let index1 = 0;
        index1 < this.enemySpawnLocations[index].length;
        index1++
      ) {
        // Randomly select an enemy type from the enemies arrays
        tEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
        console.log(tEnemy);

        // Calculate the x and y positions for the enemy spawn
        let xPos = this.enemySpawnLocations[index][index1][0] * 48; // Multiply by the tile size
        let yPos = this.enemySpawnLocations[index][index1][1] * 52; // Multiply by the tile size

        // Create a new game object (enemy) at the specified position
        new GameObject([xPos, yPos], tEnemy, tEnemy + index + index1, this);

        // Scale the enemy object
        this.objectHandler.getObject(tEnemy + index + index1).setScale(2);
      }
    }
  }

  // Retrieve the collision index at the target direction
  getCollision(targetDirection) {
    // Get the collision coordinates based on the target direction
    let targetCoords = this.getCollisionCoordinates(targetDirection);

    // Get the tile index from the collision layer at the target coordinates
    let index = this.map.layers[1].data[targetCoords[1]][targetCoords[0]].index;
    console.log(index); // Log the index for debugging purposes

    // Return the index
    return index;
  }

  // Function to handle player movement to the left
  playerMove() {
    const moveLeft = () => {
      // Get the id of the tile the player will be in after moving left
      let leftTileId = this.getCollision(
        "left",
        this.objectHandler.getObject("player").x - this.tileSize,
        this.objectHandler.getObject("player").y
      );
      this.prevDir = "left"; // Set the previous direction to "left"

      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(leftTileId)) {
        this.objectHandler.getObject("player").x -= this.speed; // Move the player to the left
        this.leftTimer = this.time.delayedCall(this.movementDelay, moveLeft); // Schedule the next movement step
      } else {
        console.log("Nuttin' doin'"); // Log a message if the target tile is a wall
      }
    };

    // Function to handle player movement to the right
    const moveRight = () => {
      // Get the id of the tile the player will be in after moving right
      let rightTileId = this.getCollision(
        "right",
        this.objectHandler.getObject("player").x + this.tileSize,
        this.objectHandler.getObject("player").y
      );
      this.prevDir = "right"; // Set the previous direction to "right"

      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(rightTileId)) {
        this.objectHandler.getObject("player").x += this.speed; // Move the player to the right
        this.rightTimer = this.time.delayedCall(this.movementDelay, moveRight); // Schedule the next movement step
      } else {
        console.log("Nuttin' doin'"); // Log a message if the target tile is a wall
      }
    };

    // Function to handle player movement upwards
    const moveUp = () => {
      // Get the id of the tile the player will be in after moving up
      let upTileId = this.getCollision(
        "up",
        this.objectHandler.getObject("player").x,
        this.objectHandler.getObject("player").y - this.tileSize
      );
      this.prevDir = "up"; // Set the previous direction to "up"

      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(upTileId)) {
        this.objectHandler.getObject("player").y -= this.speed; // Move the player upwards
        this.upTimer = this.time.delayedCall(this.movementDelay, moveUp); // Schedule the next movement step
      } else {
        console.log("Nuttin' doin'"); // Log a message if the target tile is a wall
      }
    };

    // Function to handle player movement downwards
    const moveDown = () => {
      // Get the id of the tile the player will be in after moving down
      let downTileId = this.getCollision(
        "down",
        this.objectHandler.getObject("player").x,
        this.objectHandler.getObject("player").y + this.tileSize
      );
      this.prevDir = "down"; // Set the previous direction to "down"

      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(downTileId)) {
        this.objectHandler.getObject("player").y += this.speed; // Move the player downwards
        this.downTimer = this.time.delayedCall(this.movementDelay, moveDown); // Schedule the next movement step
      } else {
        console.log("Nuttin' doin'"); // Log a message if the target tile is a wall
      }
    };

    // Check for keyboard input and handle player movement in different directions
    if (this.cursors.left.isDown && !this.leftTimer) {
      if (this.bInput) {
        moveLeft.bind(this)(); // Call moveLeft function when the left arrow key is pressed
      }
    } else if (!this.cursors.left.isDown && this.leftTimer) {
      this.leftTimer.remove();
      this.leftTimer = null;
    }

    if (this.cursors.right.isDown && !this.rightTimer) {
      console.log(this.bInput);
      if (this.bInput) {
        moveRight.bind(this)(); // Call moveRight function when the right arrow key is pressed
      }
    } else if (!this.cursors.right.isDown && this.rightTimer) {
      this.rightTimer.remove();
      this.rightTimer = null;
    }
    if (this.cursors.up.isDown && !this.upTimer) {
      if (this.bInput) {
        moveUp.bind(this)(); // Call moveUp function when the up arrow key is pressed
      }
    } else if (!this.cursors.up.isDown && this.upTimer) {
      this.upTimer.remove();
      this.upTimer = null;
    }
    if (this.cursors.down.isDown && !this.downTimer) {
      if (this.bInput) {
        moveDown.bind(this)(); // Call moveDown function when the down arrow key is pressed
      }
    } else if (!this.cursors.down.isDown && this.downTimer) {
      this.downTimer.remove();
      this.downTimer = null;
    }

    // Check if the player has entered a new room and perform room transition animation
    let currentRoom = getRoomIndex("player", this); // Get the current room index where the player is located
    if (!this.visitedRooms.includes(currentRoom)) {
      // Check if the current room has not been visited before
      this.animatingIntoRoom = true; // Set the flag to indicate that the room transition animation is in progress
      console.log("[Animation] Enter Room started");
      this.visitedRooms.push(currentRoom); // Add the current room to the list of visited rooms
      console.log(this.turnHandler.turns);

      // Handle movement animation based on the previous direction
      switch (this.prevDir) {
        case "left": {
          if (this.leftTimer) {
            this.leftTimer.remove();
            this.leftTimer = null;
          }
          moveLeft();
        }
        case "right": {
          if (this.rightTimer) {
            this.rightTimer.remove();
            this.rightTimer = null;
          }
          moveRight();
        }
        case "down": {
          if (this.downTimer) {
            this.downTimer.remove();
            this.downTimer = null;
          }
          moveDown();
        }
        case "up": {
          if (this.upTimer) {
            this.upTimer.remove();
            this.upTimer = null;
          }
          moveUp();
        }
      }

      // Add a delay before updating turns and ending the room transition animation
      this.time.delayedCall(300, () => {
        this.turnHandler.addToTurns("player"); // Add the player to the list of turns
        this.objectHandler.runForEnemiesInRoom(currentRoom, (key) => {
          this.turnHandler.addToTurns(key); // Add the enemies in the room to the list of turns
        });
        console.log("[Animation] Enter Room ended");
        this.animatingIntoRoom = false; // Set the flag to indicate that the room transition animation has ended
      });
    }
  }

  playerInteract() {
    const interact = () => {
      this.checkInteract(); // Call the checkInteract() method to perform interaction logic
    };
    if (this.cursors.space.isDown && !this.spaceKeyIsPressed) {
      // Check if the space key is pressed and not held down
      if (this.bInput) {
        // Check if the input is enabled
        interact.bind(this)(); // Call the interact() function in the context of the current object
      }
      this.spaceKeyIsPressed = true; // Set the flag to indicate that the space key is pressed
      this.time.delayedCall(500, () => {
        this.spaceKeyIsPressed = false; // Reset the flag after a delay of 500ms to allow for a new key press
      });
    }
  }

  playerAction() {
    switch (this.turnHandler.currentTurnAction) {
      case "move": {
        this.playerMove(); // Call the playerMove() method to handle player movement
      }
      case "block": {
        // Handle the "block" action (implementation code not shown)
      }
      case "attack": {
        // Handle the "attack" action (implementation code not shown)
      }
      case "shoot": {
        // Handle the "shoot" action (implementation code not shown)
      }
      case "use": {
        this.playerInteract(); // Call the playerInteract() method to handle player interaction
      }
      default:
        return; // If none of the expected actions match, return from the function
    }
  }

  playerRun() {}

  playerPassTurn() {
    this.turnHandler.consumeTurn(); // Consume the current turn for the player
  }

  update(time, delta) {
    let gameCursors = this.cursors;
    const prevX = this.objectHandler.getObject("player").x;
    const prevY = this.objectHandler.getObject("player").y;

    // Check if it's the player's turn and not currently animating into a new room
    if (this.turnHandler.currentTurn == "player") {
      if (!this.animatingIntoRoom) {
        // If no other entities have turns, allow player movement and interaction
        if (this.turnHandler.turns.length == 0) {
          this.playerMove();
          this.playerInteract();
          // If there are other entities with turns, handle the current player action
        } else if (this.turnHandler.currentAction != "none") {
          switch (this.turnHandler.currentAction) {
            case "action":
              this.playerAction(); // Handle the player's action
            case "pass":
              this.playerPassTurn(); // Pass the turn to the next entity
            case "run":
              this.playerRun(); // Handle the player running action
          }
          // If there are no turns and no current action, clear movement timers
        } else {
          if (this.upTimer != null) {
            this.upTimer.remove();
            this.upTimer = null;
          }
          if (this.downTimer != null) {
            this.downTimer.remove();
            this.downTimer = null;
          }
          if (this.leftTimer != null) {
            this.leftTimer.remove();
            this.leftTimer = null;
          }
          if (this.rightTimer != null) {
            this.rightTimer.remove();
            this.rightTimer = null;
          }
        }
      }
      // If it's not the player's turn and not currently animating into a new room, handle enemy turn logic
    } else {
      if (!this.animatingIntoRoom) {
        // ENEMY TURN LOGIC: Consume the turn for the current enemy
        this.turnHandler.consumeTurn();
      }
    }
  }

  updateText() {
    this.text.setText(`Arrow keys to move. Space to interact.`);
  }
}

const config = {
  type: Phaser.AUTO, // Use the optimal renderer for the user's device
  width: 1280, // Width of the game canvas
  height: 720, // Height of the game canvas
  scene: startLevelOne, // The initial scene to be loaded
  physics: {
    default: "arcade", // Use the Arcade Physics system as the default
    arcade: {
      debug: true, // Set to true to enable collision debugging
    },
  },
};

const game = new Phaser.Game(config);

$(document).ready(function () {
  // Get the audio element and the mute button using jQuery
  var audio = document.getElementById("menu-music");
  var muteButton = $("#mute");

  // Get the begin button and set the initial state
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

  // Event handler for the mute button
  muteButton.on("click", function (event) {
    event.stopPropagation();

    if (audio.paused) {
      audio.play();
      muteButton.text("🔇"); // Change the muteButton to "mute" state
    } else {
      audio.pause();
      muteButton.text("🔊"); // Change the muteButton to "unmute" state
    }
  });

  // Change location on #play button click
  $("#play").on("click", function () {
    $(location).attr("href", "./game.html");
  });
});

/// DND Fetch calls ///
// Function to create a monster object from the fetched data
function createMonster(monsterCurrentData) {
  // console.log(monsterCurrentData.hit_dice)
  // console.log(monsterCurrentData.hit_points)

  // Create a monster object with relevant properties
  var monsterObject = {
    name: monsterCurrentData.name,
    hp: monsterCurrentData.hit_points,
    dice: monsterCurrentData.actions[0].damage[0].damage_dice,
  };
  return monsterObject;
  // console.log(monsterObject)
}

// Function to create a spell object from the fetched data
function createSpell(spellCurrentData) {
  // console.log(monsterCurrentData.hit_points)

  // Create a spell object with relevant properties
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
  // Create a weapon object with relevant properties
  var weaponObject = {
    name: weaponCurrentData.name,
    damage: weaponCurrentData.damage,
    range: weaponCurrentData.weapon_range,
  };
  return weaponObject;
}

// Array of desired spell names
var desiredSpells = ["Mage Armor", "Acid Splash"];

// Arrays to store fetched data
var weaponData = [];
var spellData = [];
var monsterData = [];

// Array of desired monster names
var desiredMonsters = ["orc", "skeleton", "goblin"];

// Function to fetch monster data for the desired monsters
function fetchMonsterData(monsters) {
  // Perform multiple fetch requests using Promise.all
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
        // Perform multiple fetch requests using Promise.all
        monsterData = data;
        console.log(monsterData);
        return monsterData;
      })
      //   .then(monsterData => console.log(monsterData))
      .catch((error) => console.error("Error:", error))
  );
}

// Function to fetch weapon data
function fetchWeaponData() {
  // Perform multiple fetch requests using Promise.all
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
    // Store the fetched weapon data in the weaponData array
    weaponData = data;
    return data;
  });
}

// Function to fetch spell data
function fetchSpellData() {
  // Perform multiple fetch requests using Promise.all
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
    // Store the fetched spell data in the spellData array
    spellData = data; // Assign the resolved data to the existing spellData variable
    return data;
  });
}
// <<<<<<< feature/objectRequests
// Create empty arrays to store spell, weapon, and monster objects
var spellObjects = [];
var weaponObjects = [];
var monsterObjects = [];

// Function to get and sort spell data
function getSortData() {
  // Iterate over the spellData array
  for (let index = 0; index < spellData.length; index++) {
    // Create spell objects using the createSpell function and add them to the spellObjects array
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
