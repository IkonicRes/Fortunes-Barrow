// on click, the restart button will relocate user to index.html
// on click, the mute button will turn music off/on

$(document).ready(function () {
  $("#restart").click(function () {
    window.location.href = "index.html";
  });
  var audio = document.getElementById("death-music");
  var muteButton = $("#mute");

  audio.muted = true; // Initially set the audio to muted
  muteButton.text("🔇"); // Set muteButton to "unmute" state

  // Play the audio on the first user interaction with the page
  $(document).one("click", function () {
    audio.muted = false;
    audio.play();
    muteButton.text("🔊"); // Change the muteButton to "mute" state after audio starts playing
  });

  muteButton.on("click", function (event) {
    event.stopPropagation();

    if (audio.paused) {
      audio.play();
      muteButton.text("🔊");
    } else {
      audio.pause();
      muteButton.text("🔇");
    }
  });

  // Change location on #play button click
  $("#play").on("click", function () {
    $(location).attr("href", "./game.html");
  });
});
