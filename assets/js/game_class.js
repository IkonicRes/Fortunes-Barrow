class Example extends Phaser.Scene {
  showDebug; // Flag to toggle debug visuals
  player; // Reference to the player sprite
  debugGraphics; // Graphics object used for rendering debug visuals
  cursors; // Input cursors
  text; // Text object to display instructions and debug state
  kenny64x64Layer; // Reference to the layer containing tiles of size 64x64 from the "Kenny" tileset
  ground32x32Layer; // Reference to the layer containing tiles of size 32x32 representing the ground
  tree32x64Layer; // Reference to the layer containing tiles of size 32x64 representing trees
  map; // Tilemap object

  preload() {
    // Preload tilemap and images
    this.load.tilemapTiledJSON(
      "map",
      "assets/tilemaps/maps/multiple-tile-sizes-collision.json"
    );

    this.load.image("ground_1x1", "assets/tilemaps/tiles/ground_1x1.png");
    this.load.image("walls_1x2", "assets/tilemaps/tiles/walls_1x2.png");
    this.load.image(
      "kenny_platformer_64x64",
      "assets/tilemaps/tiles/kenny_platformer_64x64.png"
    );
    this.load.image(
      "dangerous-kiss",
      "assets/tilemaps/tiles/dangerous-kiss.png"
    );

    this.load.image("player", "assets/sprites/phaser-dude.png");
  }

  create() {
    // Create the scene
    this.map = this.add.tilemap("map"); // Create a new tilemap based on the "map" JSON data

    // Load tileset images and associate them with specific tilesets in the tilemap
    const groundTiles = this.map.addTilesetImage(
      "ground_1x1", // Name of the tileset in the tilemap data
      "ground_1x1", // Name of the image asset to use for the tileset
      32, // Width of each tile in pixels
      32 // Height of each tile in pixels
    );
    const kennyTiles = this.map.addTilesetImage(
      "kenny_platformer_64x64",
      "kenny_platformer_64x64",
      64,
      64
    );
    const treeTiles = this.map.addTilesetImage(
      "walls_1x2",
      "walls_1x2",
      32,
      64
    );

    // Create tile layers
    this.kenny64x64Layer = this.map.createLayer(
      "Kenny 64x64 Layer", // Name of the layer in the tilemap data
      kennyTiles // Tileset image associated with the layer
    );
    this.ground32x32Layer = this.map.createLayer(
      "Ground 32x32 Layer",
      groundTiles
    );
    this.tree32x64Layer = this.map.createLayer("Tree 32x64 Layer", treeTiles);

    console.log(this.kenny64x64Layer);

    // Set collision properties for layers
    this.ground32x32Layer.setCollisionByExclusion([-1]); // Enable collision for all tiles except those with index -1 (empty)
    this.tree32x64Layer.setCollisionByExclusion([-1]); // Enable collision for all tiles except those with index -1 (empty)
    this.kenny64x64Layer.setCollision([73]); // Enable collision for tiles with index 73

    // Create the player sprite
    this.player = this.physics.add.sprite(500, 300, "player").setBounce(0.1);

    // Set up collision between player and layers
    this.physics.add.collider(this.player, this.ground32x32Layer);
    this.physics.add.collider(this.player, this.kenny64x64Layer);
    this.physics.add.collider(this.player, this.tree32x64Layer);

    // Set camera bounds and follow the player
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.startFollow(this.player); // Set the camera to follow the player

    this.debugGraphics = this.add.graphics(); // Create a graphics object for debugging

    // Toggle debug visuals on key press
    this.input.keyboard.on("keydown-C", (event) => {
      this.showDebug = !this.showDebug; // Toggle the value of the showDebug flag
      this.drawDebug(); // Call the drawDebug() method to update the debug graphics
    });

    // Create an object to handle cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create a text object for displaying information
    this.text = this.add.text(16, 16, "", {
      fontSize: "20px",
      fill: "#ffffff",
    });
    this.text.setScrollFactor(0); // Ensure the text does not scroll with the camera
    this.updateText(); // Update the text content initially
  }

  update(time, delta) {
    // Horizontal movement
    this.player.body.setVelocityX(0); // Reset the horizontal velocity of the player
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-200); // Set the player's velocity to move left
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(200); // Set the player's velocity to move right
    }

    // Jumping
    if (
      (this.cursors.space.isDown || this.cursors.up.isDown) && // Check if the spacebar or up arrow key is pressed
      this.player.body.onFloor() // Check if the player is currently on the floor
    ) {
      this.player.body.setVelocityY(-300); // Set the player's vertical velocity to jump upwards
    }
  }

  drawDebug() {
    this.debugGraphics.clear(); // Clear the debug graphics object
    // Check if debug visuals should be shown
    if (this.showDebug) {
      // Render debug information for the ground layer
      this.ground32x32Layer.renderDebug(this.debugGraphics, {
        tileColor: null, // Color for non-colliding tiles (no color)
        collidingTileColor: new Phaser.Display.Color(211, 36, 255, 100), // Color for colliding tiles
        faceColor: new Phaser.Display.Color(211, 36, 255, 255), // Color for colliding face edges
      });

      // Render debug information for the kenny layer
      this.kenny64x64Layer.renderDebug(this.debugGraphics, {
        tileColor: null, // Non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(244, 255, 36, 100), // Colliding tiles
        faceColor: new Phaser.Display.Color(244, 255, 36, 255), // Colliding face edges
      });

      // Render debug information for the tree layer
      this.tree32x64Layer.renderDebug(this.debugGraphics, {
        tileColor: null, // Non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(36, 255, 237, 100), // Colliding tiles
        faceColor: new Phaser.Display.Color(36, 255, 237, 255), // Colliding face edges
      });
    }

    this.updateText(); // Update the displayed text
  }

  updateText() {
    // Set the text content of the 'this.text' object
    this.text.setText(
      `Arrow keys to move. Space to jump\nPress "C" to toggle debug visuals: ${
        this.showDebug ? "on" : "off"
      }`
    );
  }
}

const config = {
  type: Phaser.WEBGL, // Use WebGL rendering
  width: 800, // Width of the game canvas
  height: 576, // Height of the game canvas
  backgroundColor: "#00000", // Background color of the game
  parent: "phaser-example", // ID of the parent element to attach the game canvas
  pixelArt: true, // Enable pixel art mode for crisp graphics
  physics: {
    default: "arcade", // Use the Arcade Physics system as the default physics engine
    arcade: { gravity: { y: 400 }, debug: true }, // Configure Arcade Physics with gravity and debug options
  },
  scene: Example, // Specify the scene to be used in the game
};

// Create a new Phaser game instance with the specified configuration
const game = new Phaser.Game(config);
