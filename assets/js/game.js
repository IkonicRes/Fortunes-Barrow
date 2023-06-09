// class MainScene extends Phaser.Scene {
//     preload() {
//         console.log('Preload method called.');
//         let tileSet = get_asset_url('../images/tileset/dungeon_.png');
//         console.log('Tileset URL:', tileSet);
//         this.load.image('tiles', tileSet);
//       }
  
//     create() {
//       const mapData = generateDungeon(); // Generate the dungeon layout
//       const map = this.make.tilemap({ data: mapData, tileWidth: 16, tileHeight: 16 });
//       const tiles = map.addTilesetImage('tiles');
//       const layer = map.createLayer(0, tiles, 0, 0); // Create a layer using createLayer instead
//       layer.setCollisionByExclusion([-1]); // Optional: Set collision properties
  
//       // Rest of your scene code
//     }
//   }

// function get_asset_url(assetPath) {
//     // Replace this with your logic to get the correct URL
//     const baseUrl = '';
//     return baseUrl + assetPath;
//   }

//All dice fuctions
const r1d4 = () => Math.ceil(Math.random() * 4)
const r1d6 = () => Math.ceil(Math.random() * 6)
const r1d8 = () => Math.ceil(Math.random() * 8)
const r1d10 = () => Math.ceil(Math.random() * 10)
const r1d20 = () => Math.ceil(Math.random() * 20)
const r1d100 = () => Math.ceil(Math.random() * 100)


// // Random walk dungeon generation
// function generateDungeon() {
//     const width = 40;
//     const height = 30;
//     const maxWalkSteps = 1000;

//     // Initialize an empty dungeon filled with walls
//     const dungeon = Array(height).fill(0).map(() => Array(width).fill(1));

//     let x = Math.floor(Math.random() * width);
//     let y = Math.floor(Math.random() * height);

//     for(let i = 0; i < maxWalkSteps; i++) {
//         dungeon[y][x] = 0; // Mark the cell as a floor

//         const direction = Math.floor(Math.random() * 4);
//         switch(direction) {
//             case 0: x = Math.max(0, x - 1); break; // left
//             case 1: x = Math.min(width - 1, x + 1); break; // right
//             case 2: y = Math.max(0, y - 1); break; // up
//             case 3: y = Math.min(height - 1, y + 1); break; // down
//         }
//     }

//     return dungeon;
// }

// const config = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     scene: MainScene
// };

// const game = new Phaser.Game(config);




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
  