$(document).ready(function () {
  var audio = document.getElementById("menu-music"); // Get the menu music audio element
  var muteButton = $("#mute"); // Get the mute button element

  audio.muted = true; // Initially set the audio to muted
  muteButton.text("🔊"); // Set muteButton to "unmute" state

  // Play the audio on the first user interaction with the page
  $(document).one("click", function () {
    audio.muted = false; // Unmute the audio
    audio.play(); // Start playing the audio
    muteButton.text("🔇"); // Change the muteButton to "mute" state after audio starts playing
  });

  muteButton.on("click", function (event) {
    event.stopPropagation(); // Prevent event bubbling

    if (audio.paused) {
      audio.play(); // Resume playing the audio
      muteButton.text("🔇"); // Change the muteButton to the "mute" state
    } else {
      audio.pause(); // Pause the audio playback
      muteButton.text("🔊"); // Change the muteButton to the "unmute" state
    }
  });

  // Change location on #play button click
  $("#play").on("click", function () {
    // Change the page location to game.html when the play button is clicked
    $(location).attr("href", "./game.html");
  });
});
