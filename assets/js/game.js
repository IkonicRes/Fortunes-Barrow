
const baseDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
const r1d4 = () => Math.ceil(Math.random() * 4)
const r1d6 = () => Math.ceil(Math.random() * 6)
const r1d8 = () => Math.ceil(Math.random() * 8)
const r1d10 = () => Math.ceil(Math.random() * 10)
const r1d12 = () => Math.ceil(Math.random() * 12)
const r1d20 = () => Math.ceil(Math.random() * 20)
const r1d100 = () => Math.ceil(Math.random() * 100)

function get_asset_url(assetPath) {
  console.log(baseDir)
  console.log(baseDir + assetPath)
  return baseDir + assetPath;
}

class startLevelOne extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON('level', get_asset_url('/assets/images/tileset/levels/L_01/L_01.json'));
    this.load.spritesheet('fantasyDungeonTilesetTransparent', '/assets/images/tileset/dungeonTiles/fantasyDungeonTilesetTransparent.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('character', '/assets/images/characters/T_char.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    const map = this.make.tilemap({ key: 'level' });
    const tileset = map.addTilesetImage('fantasyDungeonTilesetTransparent', 'fantasyDungeonTilesetTransparent');


    const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
    const overlayLayer = map.createLayer('Overlay', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collision', tileset, 0, 0);
    collisionLayer.setVisible(true);
    var scale = 3
    var playerScale = 2
    terrainLayer.setScale(scale);
    collisionLayer.setScale(scale);
    overlayLayer.setScale(scale);

    map.setCollisionByExclusion([], true, collisionLayer); // Set collision on the collision layer

    var playerStart = [75, 75];
    const character = this.physics.add.sprite(playerStart[0] * 16, playerStart[1] * 16, 'character');
    character.setScale(playerScale);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cameras.main.startFollow(character);

    const speed = 32;
    const movementDelay = 100; // Delay between each movement step in milliseconds

    let leftTimer, rightTimer, upTimer, downTimer;

    // Set the player controller to handle character movement
    const playerController = {
      update: () => {
        const prevX = character.x;
        const prevY = character.y;

        // Movement logic for each arrow key
        const moveLeft = () => {
          character.x -= speed;
          if (this.physics.world.collide(character, collisionLayer)) {
            character.x = prevX;
          }
          leftTimer = this.time.delayedCall(movementDelay, moveLeft);
        };

        const moveRight = () => {
          character.x += speed;
          if (this.physics.world.collide(character, collisionLayer)) {
            character.x = prevX;
          }
          rightTimer = this.time.delayedCall(movementDelay, moveRight);
        };

        const moveUp = () => {
          character.y -= speed;
          if (this.physics.world.collide(character, collisionLayer)) {
            character.y = prevY;
          }
          upTimer = this.time.delayedCall(movementDelay, moveUp);
        };

        const moveDown = () => {
          character.y += speed;
          if (this.physics.world.collide(character, collisionLayer)) {
            character.y = prevY;
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

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: startLevelOne,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false // Set to true for collision debugging
    }
  }
};

const game = new Phaser.Game(config);

console.log(r1d4())
console.log(r1d6())
console.log(r1d8())
console.log(r1d10())
console.log(r1d20())
console.log(r1d100())

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
  console.log(monsterCurrentData.hit_dice)
  // console.log(monsterCurrentData.hit_points)
  var monsterObject = {
      name: monsterCurrentData.name,
      hp: monsterCurrentData.hit_points,
      dice: monsterCurrentData.hit_dice
  }
  console.log(monsterObject)
}

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
})
//   .then(monsterData => console.log(monsterData))
.catch(error => console.error('Error:', error));
  
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

fetch('https://www.dnd5eapi.co/api/spells')
  .then(response => response.json())
  .then(data => {
    // Get a random index from the array of monsters
    const randomIndex = Math.floor(Math.random() * data.results.length);
    // monsterCurrentData = fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
    console.log(randomIndex, data.results)
    // Fetch data for the randomly selected monster
    fetch('https://www.dnd5eapi.co' + data.results[randomIndex].url)
  
     .then(response => response.json())
     .then(spellData => printData(spellData)) 
})
//   .then(monsterData => console.log(monsterData))
.catch(error => console.error('Error:', error));