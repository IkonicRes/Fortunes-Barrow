// This code handles the functionality of the restart and mute buttons.
$(document).ready(function () {
  // Event handler for the restart button click
  $("#restart").click(function () {
    // Relocate the user to index.html when the restart button is clicked
    window.location.href = "index.html";
  });
  // Get the audio element and the mute button element
  var audio = document.getElementById("death-music");
  var muteButton = $("#mute");

  audio.muted = true; // Initially set the audio to muted
  muteButton.text("🔇"); // Set muteButton to "unmute" state

  // Play the audio on the first user interaction with the page
  $(document).one("click", function () {
    audio.muted = false; // Unmute the audio
    audio.play(); // Start playing the audio
    muteButton.text("🔊"); // Change the muteButton to "mute" state after audio starts playing
  });

  muteButton.on("click", function (event) {
    event.stopPropagation();
    // Toggle the audio playback and change the muteButton state accordingly
    if (audio.paused) {
      audio.play();
      // Change muteButton to the "mute" state
      muteButton.text("🔊");
    } else {
      audio.pause();
      // Change muteButton to the "unmute" state
      muteButton.text("🔇");
    }
  });

  // Event handler for the play button click
  $("#play").on("click", function () {
    // Change the page location to game.html when the play button is clicked
    $(location).attr("href", "./game.html");
  });
});
