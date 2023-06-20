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
  muteButton.text("🔊"); // Set muteButton to "unmute" state

  // Play the audio on the first user interaction with the page
  $(document).one("click", function () {

    audio.muted = false; // Unmute the audio
    audio.play(); // Start playing the audio
    muteButton.text("🔇"); // Change the muteButton to "mute" state after audio starts playing
  });

  muteButton.on("click", function (event) {
    event.stopPropagation();
    // Toggle the audio playback and change the muteButton state accordingly
    if (audio.paused) {
      audio.play();
      
      muteButton.text("🔊");
    } else {
      audio.pause();
      muteButton.text("🔇");
  // Change muteButton to the "unmute" state
      muteButton.text("🔇"); 
    } else {
      audio.pause();
      // Change muteButton to the "mute" state
      muteButton.text("🔊");

    }
  });

  // Event handler for the play button click
  $("#play").on("click", function () {
    // Change the page location to game.html when the play button is clicked
    $(location).attr("href", "./game.html");
  });
});

$("#submit-btn").on("click", function() {
  // Get the text of the input box
  let tName = $("#callsign").val()
  // If name wasn't entered, add a default anonymous name instead.
  if (tName.length <= 1){
      tName = "FunkyAnon"
  }

  // Get the "scores" array from localStorage
  let scoresKey = "scores"; // replace with your actual key
  let scores = JSON.parse(localStorage.getItem(scoresKey));

  // Check if the scores array exists and is not empty
  if (scores && scores.length > 0) {
      // Get the last item from the array
      let lastScore = scores[scores.length - 1];

      // Find the index of '%' character
      let index = lastScore.indexOf('%');

      // Check if '%' character is found in the string
      if (index !== -1) {
          // Replace the string before '%' with tName
          let newScore = tName + lastScore.substring(index);

          // Replace the last score with the updated score
          scores[scores.length - 1] = newScore;

          // Store the updated scores array back to localStorage
          localStorage.setItem(scoresKey, JSON.stringify(scores));
      }
  }
  $(location).attr("href", "./scores.html");
});
