
import { startLevelOne } from "./scene.js";

var repoName = "/Team-Grumbly-Project01";

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


//Game Config
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
//Pre-game logic
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

		if (audio.paused) {
			audio.play();
			muteButton.text("🔇");
		} else {
			audio.pause();
			muteButton.text("🔊");
		}
	});

	// Change location on #play button click
	$("#play").on("click", function () {
		$(location).attr("href", "./game.html");
	});

	
});
