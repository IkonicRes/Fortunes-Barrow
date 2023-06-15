var repoName = "/Team-Grumbly-Project01"
const baseDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
const r1d4 = () => Math.ceil(Math.random() * 4)
const r1d6 = () => Math.ceil(Math.random() * 6)
const r1d8 = () => Math.ceil(Math.random() * 8)
const r1d10 = () => Math.ceil(Math.random() * 10)
const r1d12 = () => Math.ceil(Math.random() * 12)
const r1d20 = () => Math.ceil(Math.random() * 20)
const r1d100 = () => Math.ceil(Math.random() * 100)

function getAssetUrl(assetPath) { return baseDir + assetPath; }


class DoorHandler {
  constructor(scene) {
    this.mapSize = {
      width: scene.map.width,
      height: scene.map.height
    }
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
      1412: 1414
    }

    this.lockedDoorTypes = {
      1363: 1365,
      1364: 1366,
      1411: 1413,
      1412: 1414
    }
    this.hasKey = true;
  }

  getAdjacentDoors(x, y) {
    let playerSize = 16 * 3;
    // Grid coordinates for the current door tile
    let doorLocation = [Math.floor(x / playerSize), Math.floor(y / playerSize)];
    // Define directions for a 2x2 square around the current door tile
    const directions = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1] ];
    // To store the locations of door tiles
    let doorTiles = [];

    for (let dir of directions) {
        let targetCoords = [doorLocation[0] + dir[0], doorLocation[1] + dir[1]];
        let targetWorldCoords = { x: targetCoords[0] * playerSize, y: targetCoords[1] * playerSize };
        // Check if target coords are within map bounds
        if (targetCoords[0] >= 0 && targetCoords[0] < this.mapSize.width && targetCoords[1] >= 0 && targetCoords[1] < this.mapSize.height) {
            let targetTile = this.scene.collision.getTileAtWorldXY(targetWorldCoords.x, targetWorldCoords.y, false);
            console.log(`Checking tile at (${targetWorldCoords.x}, ${targetWorldCoords.y}) - Index: ${targetTile ? targetTile.index : 'None'}`);
            Object.keys(this.doorTileTypes).forEach(element => {
              if (targetTile && targetTile.index == element) {
                if (Object.keys(this.lockedDoorTypes).includes(targetTile.index.toString())) { if (!this.hasKey) { return } }
                doorTiles.push({ x: targetWorldCoords.x, y: targetWorldCoords.y });
              };
            });
        } else { console.log(`Coordinates (${targetWorldCoords.x}, ${targetWorldCoords.y}) out of map bounds.`); }
    }
    return doorTiles;
  }
}

// OBJECT HANDLER FOR EASIER HANDLING OF MULTIPLE SPRITES
class ObjectHandler {
  constructor() { this.objects = {} }

  addObject(object, name) { this.objects[name] = object; }
  getObject(name) { return this.objects[name] }
  removeObject(name) { this.objects[name].destroy(); delete this.objects[name]; }
  update() { Object.keys(this.objects).forEach(element => { this.objects[element].update(); }); }
}


class startLevelOne extends Phaser.Scene
{
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
    preload () {
      this.objectHandler = new ObjectHandler()
      this.closedDoors = [1367, 1368, 1415, 1416]
      this.nonCollideIDs = [-1, 1409, 1410, 1361, 1362, 1365, 1366, 1413, 1414]
      this.inputDelay = 500;
      const tilemapPath = (getAssetUrl('/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png'));
      this.load.tilemapTiledJSON('map',  getAssetUrl('/assets/images/tileset/levels/L_01/L_1.json'));
      this.load.spritesheet('fantasyDungeonTilesetTransparent', tilemapPath, { frameWidth: 16, frameHeight: 16 });
      this.load.spritesheet('player', getAssetUrl('/assets/images/characters/T_char.png'),
      { frameWidth: 16, frameHeight: 16 }
      );
      this.prevDir = "up"
    }
    
    create () {
      var scale = 3
      var playerScale = 2
      
      this.map = this.add.tilemap('map');
      this.doorHandler = new DoorHandler(this)

        const terrainLayer = this.map.addTilesetImage('fantasyDungeonTilesetTransparent', 'fantasyDungeonTilesetTransparent', 16, 16);
        this.terrain = this.map.createLayer('Terrain', terrainLayer, 0, 0);
        this.collision = this.map.createLayer('Collision', terrainLayer, 0, 0);
        this.objectHandler.addObject(this.physics.add.sprite(1200, 1200, 'player'), 'player')
        this.overlay = this.map.createLayer('Overlay', terrainLayer, 0, 0);
        this.terrain.setScale(scale);
        this.overlay.setScale(scale);
        this.collision.setScale(scale);

        this.collision.setCollisionByExclusion([ -1 ]);

        
        this.objectHandler.getObject("player").setScale(playerScale);
        
        this.physics.add.collider(this.objectHandler.getObject("player"), this.collision);

        this.cameras.main.startFollow(this.objectHandler.getObject("player"));

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
        this.prevGridX = Math.floor(this.objectHandler.getObject("player").x / this.gridSize);
        this.prevGridY = Math.floor(this.objectHandler.getObject("player").y / this.gridSize);
        
    }

    boxTrigger (inputFunction) { inputFunction } 

  swapTiles(doorTiles) {
    // Get the layer containing the tiles you want to swap
    let layer = this.map.getLayer('Collision').tilemapLayer;
    console.log(doorTiles)
    for(let doorTile of doorTiles){
      // Calculate tile's coordinates on the grid
      let tileX = Math.floor(doorTile.x / (16 * 3));
      let tileY = Math.floor(doorTile.y / (16 * 3));
      
      // Get the tile at the current coordinates
      let currentTile = layer.tilemap.getTileAt(tileX, tileY, true, 'Collision');
      
      // If the tile is one of the door tiles, replace it with the corresponding new tile
      if(this.doorHandler.doorTileTypes[currentTile.index] != undefined){
          layer.putTileAt(this.doorHandler.doorTileTypes[currentTile.index], tileX, tileY);
      }
    }
  }
  
  checkInteract() {
    let intObj = this.getCollision(this.prevDir);
    console.log(intObj);
    if (Object.keys(this.doorHandler.doorTileTypes).includes(intObj.toString())) {
      console.log("Door!");
      let playerTargetCoords = this.getCollisionCoordinates(this.prevDir);
      let playerSize = 16 * 3;
      let doorLocation = { x: playerTargetCoords[0] * playerSize, y: playerTargetCoords[1] * playerSize };
      let doorTiles = this.doorHandler.getAdjacentDoors(doorLocation.x, doorLocation.y);
      console.log(doorTiles);
      // Swap door tiles
      this.swapTiles(doorTiles);
    }
    else if ([0, 1, null, undefined].indexOf(intObj) >= 0) { console.log("other object!") }
  }
  
  getCollisionCoordinates(targetDirection) {
    let playerSize = 16 * 3;
    let halfPlayerSize = playerSize / 2;
  
    let playerLocation = [
        Math.floor((this.objectHandler.getObject("player").x + halfPlayerSize) / playerSize), 
        Math.floor((this.objectHandler.getObject("player").y + halfPlayerSize) / playerSize)
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
    const prevX = this.objectHandler.getObject("player").x;
    const prevY = this.objectHandler.getObject("player").y;
    this.gridSize = 10; // Size of each grid cell
    let playerGridX = Math.floor(this.objectHandler.getObject("player").x / this.gridSize);
    let playerGridY = Math.floor(this.objectHandler.getObject("player").y / this.gridSize);

    const interact = () => { this.checkInteract(); };
    // Movement logic for each arrow key
    const moveLeft = () => {
      // Get the id of the tile the player will be in after moving left
      let leftTileId = this.getCollision("left", this.objectHandler.getObject("player").x - this.tileSize, this.objectHandler.getObject("player").y);
      this.prevDir = "left"
      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(leftTileId)) {
        this.objectHandler.getObject("player").x -= this.speed;
        this.leftTimer = this.time.delayedCall(this.movementDelay, moveLeft);
      } else { console.log("Nuttin' doin'"); }
    };
  
    const moveRight = () => {
      // Get the id of the tile the player will be in after moving right
      let rightTileId = this.getCollision("right", this.objectHandler.getObject("player").x + this.tileSize, this.objectHandler.getObject("player").y);
      this.prevDir = "right"
      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(rightTileId)) {
        this.objectHandler.getObject("player").x += this.speed;
        this.rightTimer = this.time.delayedCall(this.movementDelay, moveRight);
      } else { console.log("Nuttin' doin'"); }
    };

    const moveUp = () => {
      // Get the id of the tile the player will be in after moving up
      let upTileId = this.getCollision("up", this.objectHandler.getObject("player").x, this.objectHandler.getObject("player").y - this.tileSize);
      this.prevDir = "up"
      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(upTileId)) {
          this.objectHandler.getObject("player").y -= this.speed;
          this.upTimer = this.time.delayedCall(this.movementDelay, moveUp);
      } else { console.log("Nuttin' doin'"); }
  };

    const moveDown = () => {
      // Get the id of the tile the player will be in after moving down
      let downTileId = this.getCollision("down", this.objectHandler.getObject("player").x, this.objectHandler.getObject("player").y + this.tileSize);
      this.prevDir = "down"
      // Only move the player if the target tile is not a wall
      if (this.nonCollideIDs.includes(downTileId)) {
          this.objectHandler.getObject("player").y += this.speed;
          this.downTimer = this.time.delayedCall(this.movementDelay, moveDown);
      } else { console.log("Nuttin' doin'"); }
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
  scene: startLevelOne,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true // Set to true for collision debugging
    }
  }
};

const game = new Phaser.Game(config);

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
function printData(monsterCurrentData) {
  // console.log(monsterCurrentData.hit_dice)
  // console.log(monsterCurrentData.hit_points)
  var monsterObject = {
      name: monsterCurrentData.name,
      hp: monsterCurrentData.hit_points,
      dice: monsterCurrentData.hit_dice
  }
  // console.log(monsterObject)
}
function printData(spellCurrentData) {
  console.log(spellCurrentData)
  // console.log(monsterCurrentData.hit_points)
  var spellObject = {
      name: spellCurrentData.name,
      desc: spellCurrentData.desc,
      damage: spellCurrentData.damage,
      range: spellCurrentData.range,
      duration: spellCurrentData.duration,
  }
  console.log(spellObject)
}

function fetchMonsterData(){
  fetch('https://www.dnd5eapi.co/api/monsters')
  .then(response => response.json())
  .then(data => {
    // Get a random index from the array of monsters
    const randomIndex = Math.floor(Math.random() * data.results.length);
    // monsterCurrentData = fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
    console.log(randomIndex, data.results)
    // Fetch data for the randomly selected monster
    fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
  
     .then(response => response.json())
     .then(monsterData => printData(monsterData)) 
     return data
})
//   .then(monsterData => console.log(monsterData))
.catch(error => console.error('Error:', error));

}
  
function fetchSpellData(){

  fetch('https://www.dnd5eapi.co/api/spells')
  .then(response => response.json())
  .then(data => {
    // Get a random index from the array of monsters
    const randomIndex = Math.floor(Math.random() * data.results.length);
    // monsterCurrentData = fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
    // console.log(randomIndex, data.results)
    // Fetch data for the randomly selected monster
    fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
  
     .then(response => response.json())
     .then(spellData => printData(spellData)) 
     return data
})

//   .then(monsterData => console.log(monsterData))
.catch(error => console.error('Error:', error));
}

 function fetchWeaponData(){
  Promise.all([fetch('https://www.dnd5eapi.co/api/equipment/shortbow').then (response => response.json()), fetch('https://www.dnd5eapi.co/api/equipment/longsword').then (response => response.json()),fetch('https://www.dnd5eapi.co/api/equipment/shield').then (response => response.json())])
  .then(data => {console.log(data)
                return this.data})
  }
// fetchWeaponData()
// fetchMonsterData()
// fetchSpellData()

const desiredData = {
  monsters: [], 
  weapons: ["shortbow"],
  spells: []
}

function getSortData(){
  var weaponData = fetchWeaponData()
  var monsterData = fetchMonsterData()
  var spellData = fetchSpellData()
  console.log(weaponData)
  for (let index = 0; index < weaponData.length; index++) {
    if (desiredData.weapons.includes (weaponData[index])) 
    console.log("here")
  }
}
getSortData()