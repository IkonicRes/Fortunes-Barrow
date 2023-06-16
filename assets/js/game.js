var repoName = "/Team-Grumbly-Project01"
const baseDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
const r1d4 = () => Math.ceil(Math.random() * 4)
const r1d6 = () => Math.ceil(Math.random() * 6)
const r1d8 = () => Math.ceil(Math.random() * 8)
const r1d10 = () => Math.ceil(Math.random() * 10)
const r1d12 = () => Math.ceil(Math.random() * 12)
const r1d20 = () => Math.ceil(Math.random() * 20)
const r1d100 = () => Math.ceil(Math.random() * 100)

function getAssetUrl(assetPath) {
  // console.log(baseDir)
  // console.log(baseDir + assetPath)
  return baseDir + assetPath;
}

class startLevelOne extends Phaser.Scene {
  preload() {
    const pathname = window.location.pathname
    const rootFolderName = pathname.split('/')[1]
    const tilemapPath = (getAssetUrl('/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png'));
    const charTilemapPath = (getAssetUrl('/assets/images/characters/T_char.png'));
    this.load.tilemapTiledJSON('level', getAssetUrl('/assets/images/tileset/levels/L_01/L_1.json'));
    this.load.spritesheet('fantasyDungeonTilesetTransparent', tilemapPath, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('character', charTilemapPath, { frameWidth: 32, frameHeight: 32 });
  } 

  create() {
    this.map = this.make.tilemap({ key: 'level' });
    this.tileset = this.map.addTilesetImage('fantasyDungeonTilesetTransparent', 'fantasyDungeonTilesetTransparent');

    const terrainLayer = this.map.createLayer('Terrain', this.tileset, 0, 0);
    const overlayLayer = this.map.createLayer('Overlay', this.tileset, 0, 0);
    const collisionLayer = this.map.createLayer('Collision', this.tileset, 0, 0);
    terrainLayer.setVisible(true);
    var scale = 3
    var playerScale = 2
    //terrainLayer.setScale(scale);
    terrainLayer.setScale(scale);
    overlayLayer.setScale(scale);
    collisionLayer.setScale(scale);
    this.map.setCollision([3221226008, 3221226006, 3221226007, 3221226005, 3221226201, 1073742553, 1073742260, 1073742261, 1073742262, 1073742263, 1073742360, 291, 1073742949, 1073742950, 56, 2147483704, 2147483939, 1073742901, 1073742902, 296, 495, 2147483944, 339, 340, 341, 342, 343, 344, 2147483992, 2147483987, 388, 389, 390, 391, 1367, 1368, 1415, 1416]);
   // map.setCollisionByExclusion([], true, collisionLayer); // Set collision on the collision layer

    var playerStart = [75, 75];
    this.player = this.physics.add.sprite(playerStart[0] * 16, playerStart[1] * 16, 'character');
    this.physics.add.existing(this.player);
    this.physics.add.collider(this.player, collisionLayer);
    this.player.setScale(playerScale);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(this.player);

    const speed = 32;
    const movementDelay = 100; // Delay between each movement step in milliseconds

    let leftTimer, rightTimer, upTimer, downTimer;

    // Set the player controller to handle character movement
    const playerController = {
      update: () => {
        const prevX = this.player.x;
        const prevY = this.player.y;

        // Movement logic for each arrow key
        const moveLeft = () => {
          this.player.x -= speed;
          if (this.physics.world.collide(this.player, collisionLayer)) {
            this.player.x = prevX;
          }
          leftTimer = this.time.delayedCall(movementDelay, moveLeft);
        };

        const moveRight = () => {
          this.player.x += speed;
          if (this.physics.world.collide(this.player, collisionLayer)) {
            this.player.x = prevX;
          }
          rightTimer = this.time.delayedCall(movementDelay, moveRight);
        };

        const moveUp = () => {
          this.player.y -= speed;
          if (this.physics.world.collide(this.player, collisionLayer)) {
            this.player.y = prevY;
          }
          upTimer = this.time.delayedCall(movementDelay, moveUp);
        };

        const moveDown = () => {
          this.player.y += speed;
          if (this.physics.world.collide(this.player, collisionLayer)) {
            this.player.y = prevY;
          }
          downTimer = this.time.delayedCall(movementDelay, moveDown);
        };

        if (this.cursors.left.isDown && !leftTimer) {
          moveLeft();
        } else if (!this.cursors.left.isDown && leftTimer) {
          leftTimer.remove();
          leftTimer = null;
        }

        if (this.cursors.right.isDown && !rightTimer) {
          moveRight();
        } else if (!this.cursors.right.isDown && rightTimer) {
          rightTimer.remove();
          rightTimer = null;
        }

        if (this.cursors.up.isDown && !upTimer) {
          moveUp();
        } else if (!this.cursors.up.isDown && upTimer) {
          upTimer.remove();
          upTimer = null;
        }

        if (this.cursors.down.isDown && !downTimer) {
          moveDown();
        } else if (!this.cursors.down.isDown && downTimer) {
          downTimer.remove();
          downTimer = null;
        }
      },
    };
    // Add the player controller to the scene's update list
    this.events.on('update', playerController.update);
  }
}

class Example extends Phaser.Scene
{
    showDebug;
    player;
    debugGraphics;
    cursors;
    text;
    terrain;
    collision;
    overlay;
    map;
    inputDelta;
    inputDelay;
    walls;
    closedDoors;
    prevDir;
    spaceKeyIsPressed;
    gridSize;
    preload ()
    {
        this.walls = [3221226008, 3221226006, 3221226007, 3221226007, 3221226005, 3221226005, 3221226006, 3221226005, 3221226007, 3221226201, 1073742553, 1073742260, 1073742261, 1073742262, 1073742263, 1073742260, 1073742261, 1073742262, 1073742263, 3221226201, 3221226008, 3221226006, 3221226007, 3221226007, 3221226005, 3221226005, 3221226006, 3221226005, 3221226007, 3221226201, 1073742553, 1073742260, 1073742261, 1073742262, 1073742263, 1073742260, 1073742261, 1073742262, 1073742263, 1073742360, 291, 1073742949, 1073742950, 56, 2147483704, 56, 291, 56, 2147483704, 2147483939, 291, 1073742901, 1073742902, 56, 2147483704, 56, 291, 56, 2147483704, 2147483939, 291, 56, 2147483704, 56, 2147483704, 56, 2147483704, 2147483939, 291, 296, 291, 495, 495, 2147483939, 291, 296, 291, 495, 495, 2147483939, 291, 296, 2147483944, 296, 291, 296, 2147483944, 2147483939, 291, 296, 2147483944, 296, 291, 296, 2147483944, 2147483939, 291, 296, 2147483944, 296, 291, 296, 2147483944, 2147483939, 339, 340, 341, 342, 341, 342, 343, 344, 2147483992, 340, 341, 342, 341, 342, 343, 344, 339, 341, 342, 342, 343, 342, 342, 343, 340, 344, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 291, 388, 389, 390, 389, 390, 391, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 291, 389, 390, 390, 391, 390, 390, 391, 388, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483704, 56, 2147483704, 56, 2147483704, 56, 2147483704, 296, 2147483944, 56, 2147483704, 56, 2147483704, 56, 2147483704, 296, 2147483944, 56, 2147483704, 56, 2147483704, 56, 2147483704, 296, 2147483704, 296, 291, 296, 291, 495, 56, 2147483944, 296, 291, 296, 291, 495, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483704, 296, 2147483944, 296, 2147483944, 296, 2147483944, 56, 291, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483704, 56, 2147483704, 296, 2147483944, 296, 291, 56, 2147483944, 56, 2147483704, 56, 2147483704, 296, 2147483944, 296, 2147483944, 56, 2147483704, 56, 2147483704, 56, 2147483704, 296, 2147483704, 495, 296, 291, 296, 291, 56, 2147483944, 495, 296, 291, 296, 291, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483704, 296, 2147483944, 296, 2147483944, 296, 2147483944, 56, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 340, 341, 342, 342, 343, 342, 342, 343, 340, 341, 340, 341, 342, 342, 343, 342, 342, 343, 340, 341, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 2147483992, 340, 341, 342, 341, 342, 343, 2147483987, 291, 389, 390, 390, 391, 390, 390, 391, 388, 296, 291, 389, 390, 390, 391, 390, 390, 391, 388, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483944, 388, 389, 390, 389, 390, 391, 296, 2147483704, 56, 2147483704, 56, 2147483704, 56, 2147483704, 56, 2147483944, 56, 2147483704, 56, 2147483704, 56, 2147483704, 296, 2147483944, 56, 2147483704, 56, 2147483704, 56, 2147483704, 296, 2147483704, 495, 495, 296, 291, 56, 2147483944, 495, 495, 296, 291, 296, 2147483944, 56, 2147483704, 56, 2147483704, 296, 2147483944, 296, 2147483704, 296, 2147483944, 296, 2147483944, 296, 2147483944, 56, 2147483944, 296, 2147483944, 296, 2147483944, 296, 2147483944, 296, 339, 342, 341, 343, 342, 342, 341, 340, 343, 344, 2147483992, 342, 342, 341, 343, 342, 342, 341, 340, 344, 339, 342, 341, 343, 342, 342, 341, 340, 343, 344, 339, 342, 341, 343, 342, 342, 341, 340, 343, 2147483987, 1368, 1367, 1415, 1416, 495]
        this.closedDoors = [1367, 1368, 1415, 1416]
        this.inputDelay = 500;
        const tilemapPath = (getAssetUrl('/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png'));
        this.load.tilemapTiledJSON('map',  getAssetUrl('/assets/images/tileset/levels/L_01/L_1.json'));
        this.load.spritesheet('fantasyDungeonTilesetTransparent', tilemapPath, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player', getAssetUrl('/assets/images/characters/T_char.png'),
         { frameWidth: 16, frameHeight: 16 }
        );
        this.prevDir = "up"
  
    }

    create ()
    {
        var scale = 3
        var playerScale = 2

        this.map = this.add.tilemap('map');

        const terrainLayer = this.map.addTilesetImage('fantasyDungeonTilesetTransparent', 'fantasyDungeonTilesetTransparent', 16, 16);
        this.terrain = this.map.createLayer('Terrain', terrainLayer, 0, 0);
        this.collision = this.map.createLayer('Collision', terrainLayer, 0, 0);
        this.player = this.physics.add.sprite(1200, 1200, 'player')
        this.overlay = this.map.createLayer('Overlay', terrainLayer, 0, 0);

        this.terrain.setScale(scale);
        this.overlay.setScale(scale);
        this.collision.setScale(scale);

        this.collision.setCollisionByExclusion([ -1 ]);

        
        this.player.setScale(playerScale);
        
        this.physics.add.collider(this.player, this.collision);

        this.cameras.main.startFollow(this.player);

        this.debugGraphics = this.add.graphics();
        this.speed = 32;
        this.movementDelay = 100; // Delay between each movement step in milliseconds
    
        let leftTimer, rightTimer, upTimer, downTimer;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
        this.updateText();
        this.prevGridX = Math.floor(this.player.x / this.gridSize);
      this.prevGridY = Math.floor(this.player.y / this.gridSize);
        // console.log(this.map)
        
    }
    boxTrigger (inputFunction) {

      inputFunction
    } 
    getAdjacentDoors(x, y) {
      let playerSize = 16 * 3;
  
      // Grid coordinates for the current door tile
      let doorLocation = [Math.floor(x / playerSize), Math.floor(y / playerSize)];
  
      // Define directions for a 2x2 square around the current door tile
      const directions = [
          [0, 0], // the door tile itself
          [-1, 0], // left
          [1, 0], // right
          [0, -1], // up
          [0, 1], // down
          [-1, -1], // top left
          [-1, 1], // bottom left
          [1, -1], // top right
          [1, 1] // bottom right
      ];
  
      // To store the locations of door tiles
      let doorTiles = [];
  
      for (let dir of directions) {
          let targetCoords = [doorLocation[0] + dir[0], doorLocation[1] + dir[1]];
          let targetWorldCoords = { x: targetCoords[0] * playerSize, y: targetCoords[1] * playerSize };
  
          // Check if target coords are within map bounds
          if (targetCoords[0] >= 0 && targetCoords[0] < this.map.width && targetCoords[1] >= 0 && targetCoords[1] < this.map.height) {
              let targetTile = this.collision.getTileAtWorldXY(targetWorldCoords.x, targetWorldCoords.y, false);
  
              console.log(`Checking tile at (${targetWorldCoords.x}, ${targetWorldCoords.y}) - Index: ${targetTile ? targetTile.index : 'None'}`);
  
              if (targetTile && (targetTile.index == 1367 || targetTile.index == 1368 || targetTile.index == 1415 || targetTile.index == 1416 || targetTile.index == 495)) {
                  let targetLocation = { x: targetWorldCoords.x, y: targetWorldCoords.y };
                  doorTiles.push(targetLocation);
              }
          } else {
              console.log(`Coordinates (${targetWorldCoords.x}, ${targetWorldCoords.y}) out of map bounds.`);
          }
      }
  
      return doorTiles;
  }
  
    
    
    
  swapTiles(doorTiles) {
    // Define the new tile indices that should replace the old ones
    let replacementTiles = {
        1367: 1361,
        1368: 1362,
        1415: 1409,
        1416: 1410,
        495: -1,
    };
    
    // Get the layer containing the tiles you want to swap
    let layer = this.map.getLayer('Collision').tilemapLayer;
    
    for(let doorTile of doorTiles){
        // Calculate tile's coordinates on the grid
        let tileX = Math.floor(doorTile.x / (16 * 3));
        let tileY = Math.floor(doorTile.y / (16 * 3));
        
        // Get the tile at the current coordinates
        let currentTile = layer.tilemap.getTileAt(tileX, tileY, true, 'Collision');
        
        // If the tile is one of the door tiles, replace it with the corresponding new tile
        if(replacementTiles.hasOwnProperty(currentTile.index)){
            layer.putTileAt(replacementTiles[currentTile.index], tileX, tileY);
        }
    }
}
  
    
    
  
  checkInteract() {
    let intObj = this.getCollision(this.prevDir);
    console.log(intObj);
  
    if (intObj == 1367 || intObj == 1368 || intObj == 1415 || intObj == 1416  || intObj == 495){
    console.log("Door!");
    let playerTargetCoords = this.getCollisionCoordinates(this.prevDir);
    let playerSize = 16 * 3;
    let doorLocation = { x: playerTargetCoords[0] * playerSize, y: playerTargetCoords[1] * playerSize };
    // Get player size
    
    
    let playerLocation = { x: Math.floor((this.player.x + playerSize / 2) / playerSize) * playerSize, y: Math.floor((this.player.y + playerSize / 2) / playerSize) * playerSize};
    
    let doorTiles = this.getAdjacentDoors(doorLocation.x, doorLocation.y);
    console.log(doorTiles);

    // Swap door tiles
    this.swapTiles(doorTiles);
}
    else if (intObj == 0 || intObj == -1 || intObj == null || intObj == undefined){
      console.log("other object!")
    }
  }
  
  getCollisionCoordinates(targetDirection) {
    let playerSize = 16 * 3;
    let halfPlayerSize = playerSize / 2;
  
    let playerLocation = [
        Math.floor((this.player.x + halfPlayerSize) / playerSize), 
        Math.floor((this.player.y + halfPlayerSize) / playerSize)
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
    console.log(index);
    return index;
  }
  
  
  
  
  
  

  update(time, delta) {
    const prevX = this.player.x;
    const prevY = this.player.y;
    this.gridSize = 10; // Size of each grid cell
    let playerGridX = Math.floor(this.player.x / this.gridSize);
    let playerGridY = Math.floor(this.player.y / this.gridSize);

    
    const interact = () => {
      this.checkInteract();
    };
        // Movement logic for each arrow key
        const moveLeft = () => {
          // Get the id of the tile the player will be in after moving left
          let leftTileId = this.getCollision("left", this.player.x - this.tileSize, this.player.y);
          this.prevDir = "left"
          // Only move the player if the target tile is not a wall
          if (!this.walls.includes(leftTileId)) {
              this.player.x -= this.speed;
              this.leftTimer = this.time.delayedCall(this.movementDelay, moveLeft);
          } else {
              console.log("Nuttin' doin'");
          }
      };
      
        const moveRight = () => {
          // Get the id of the tile the player will be in after moving right
          let rightTileId = this.getCollision("right", this.player.x + this.tileSize, this.player.y);
          this.prevDir = "right"
          // Only move the player if the target tile is not a wall
          if (!this.walls.includes(rightTileId)) {
            this.player.x += this.speed;
            this.rightTimer = this.time.delayedCall(this.movementDelay, moveRight);
          } else {
            console.log("Nuttin' doin'");
          }
        };

        const moveUp = () => {
          // Get the id of the tile the player will be in after moving up
          let upTileId = this.getCollision("up", this.player.x, this.player.y - this.tileSize);
          this.prevDir = "up"
          // Only move the player if the target tile is not a wall
          if (!this.walls.includes(upTileId)) {
              this.player.y -= this.speed;
              this.upTimer = this.time.delayedCall(this.movementDelay, moveUp);
          } else {
              console.log("Nuttin' doin'");
          }
      };

        const moveDown = () => {
          // Get the id of the tile the player will be in after moving down
          let downTileId = this.getCollision("down", this.player.x, this.player.y + this.tileSize);
          this.prevDir = "down"
          // Only move the player if the target tile is not a wall
          if (!this.walls.includes(downTileId)) {
              this.player.y += this.speed;
              this.downTimer = this.time.delayedCall(this.movementDelay, moveDown);
          } else {
              console.log("Nuttin' doin'");
          }
      };

        if (this.cursors.left.isDown && !this.leftTimer) {
          moveLeft();
        } else if (!this.cursors.left.isDown && this.leftTimer) {
          this.leftTimer.remove();
          this.leftTimer = null;
        }

        if (this.cursors.right.isDown && !this.rightTimer) {
          moveRight();
        } else if (!this.cursors.right.isDown && this.rightTimer) {
          this.rightTimer.remove();
          this.rightTimer = null;
        }

        if (this.cursors.up.isDown && !this.upTimer) {
          moveUp();
        } else if (!this.cursors.up.isDown && this.upTimer) {
          this.upTimer.remove();
          this.upTimer = null;
        }

        if (this.cursors.down.isDown && !this.downTimer) {
          moveDown();
        } else if (!this.cursors.down.isDown && this.downTimer) {
          this.downTimer.remove();
          this.downTimer = null;
        }
        if (this.cursors.space.isDown && !this.spaceKeyIsPressed) {
          interact();
          this.spaceKeyIsPressed = true;
          this.time.delayedCall(500, () => {
            this.spaceKeyIsPressed = false;
          });
       
        if (playerGridX !== this.prevGridX || playerGridY !== this.prevGridY) {
          console.log("Hey, you're finally awake...");
          this.prevGridX = playerGridX;
          this.prevGridY = playerGridY;
      }
  }
      }
      
    

    updateText ()
    {
        this.text.setText(
            `Arrow keys to move. Space to jump\nPress "C" to toggle debug visuals: ${this.showDebug ? 'on' : 'off'}`
        );
    }
}

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: Example,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true // Set to true for collision debugging
    }
  }
};

const game = new Phaser.Game(config);

// console.log(r1d4())
// console.log(r1d6())
// console.log(r1d8())
// console.log(r1d10())
// console.log(r1d20())
// console.log(r1d100())

$(document).ready(function() {
    var audio = document.getElementById('menu-music');
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
    beginButton.one('click', function() {
      playAudio();
    });
  
    muteButton.on("click", function(event) {
      event.stopPropagation();
  
      if (audio.paused) {
        audio.play();
        muteButton.text("🔇");
      } else {
        audio.pause();
        muteButton.text("🔊");
      }
    });
  
    // Change location on #play button click
    $("#play").on("click", function() {
      $(location).attr('href', './game.html');
    });
  });



/// DND Fetch calls ///
function createMonster(monsterCurrentData) {
  // console.log(monsterCurrentData.hit_dice)
  // console.log(monsterCurrentData.hit_points)
  var monsterObject = {
      name: monsterCurrentData.name,
      hp: monsterCurrentData.hit_points,
      dice: monsterCurrentData.actions[0].damage[0].damage_dice
  }
  return monsterObject
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
  }
  return spellObject
}

function createWeapon(weaponCurrentData) {
  var weaponObject = {
      name: weaponCurrentData.name,
      damage: weaponCurrentData.damage,
      range: weaponCurrentData.weapon_range,
  }
  return weaponObject
}

var desiredSpells = ["Mage Armor" , "Acid Splash" , ]
var weaponData = []
var spellData = []

var desiredMonsters = ["orc" , "skeleton" , "goblin"]
var monsterData = []

function fetchMonsterData(monsters){
  return Promise.all([
  fetch('https://www.dnd5eapi.co/api/monsters/' + monsters[0])
  .then(response => response.json()),
  fetch('https://www.dnd5eapi.co/api/monsters/' + monsters[1])
  .then(response => response.json()),
  fetch('https://www.dnd5eapi.co/api/monsters/' + monsters[2])
  .then(response => response.json())
  ]).then(data => {
     monsterData = data;
     console.log(monsterData)
     return monsterData
})
//   .then(monsterData => console.log(monsterData))
.catch(error => console.error('Error:', error));

}
  
function fetchWeaponData() {
  return Promise.all([
    fetch('https://www.dnd5eapi.co/api/equipment/shortbow').then(response => response.json()),
    fetch('https://www.dnd5eapi.co/api/equipment/longsword').then(response => response.json()),
    fetch('https://www.dnd5eapi.co/api/equipment/shield').then(response => response.json())
  ]).then(data => {
    weaponData = data;
    return data;
  });
}
function fetchSpellData() {
  return Promise.all([
    fetch('https://www.dnd5eapi.co/api/spells/mage-armor').then(response => response.json()),
    fetch('https://www.dnd5eapi.co/api/spells/acid-splash').then(response => response.json()),
    fetch('https://www.dnd5eapi.co/api/spells/detect-magic').then(response => response.json()),
    fetch('https://www.dnd5eapi.co/api/spells/fire-bolt').then(response => response.json()),
    fetch('https://www.dnd5eapi.co/api/spells/heal').then(response => response.json())
  ]).then(data => {
    spellData = data; // Assign the resolved data to the existing spellData variable
    return data;
  });
}
var spellObjects = []
var weaponObjects = []
var monsterObjects = []
function getSortData() {
  for (let index = 0; index < spellData.length; index++) {
    spellObjects.push(createSpell(spellData[index]))
  }
  console.log(spellObjects)
  for (let index = 0; index < weaponData.length; index++) {
    weaponObjects.push(createWeapon(weaponData[index]))
  }
  console.log(weaponObjects)
  for (let index = 0; index < monsterData.length; index++) {
    monsterObjects.push(createMonster(monsterData[index]))
  }
  console.log(monsterObjects)
}