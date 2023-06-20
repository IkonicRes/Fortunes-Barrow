// Wait for the DOM content to be loaded before executing the code
window.addEventListener("DOMContentLoaded", (event) => {
  // Phaser game configuration
  var config = {
    type: Phaser.AUTO, // Use the appropriate renderer (WebGL or Canvas) automatically
    width: 800, // Width of the game canvas
    height: 600, // Height of the game canvas
    scene: {
      preload: preload, // Function for preloading game assets
      create: create, // Function for creating game objects and logic
    },
  };

  function preload() {
    // Preload any assets here if required
    // Load game assets such as images, sounds, and spritesheets
  }

  function create() {
    // Add event listeners to movement buttons
    // Get references to the movement buttons in the DOM
    var upButton = document.getElementById("up-button");
    var downButton = document.getElementById("down-button");
    var leftButton = document.getElementById("left-button");
    var rightButton = document.getElementById("right-button");

    // Attach click event listeners to the movement buttons
    upButton.addEventListener("click", handleUpButtonClick);
    downButton.addEventListener("click", handleDownButtonClick);
    leftButton.addEventListener("click", handleLeftButtonClick);
    rightButton.addEventListener("click", handleRightButtonClick);
  }

  function handleUpButtonClick() {
    // Handle logic for up button click
    // Perform actions when the up button is clicked
    movePlayer("up"); // Call the movePlayer function with the 'up' direction
  }

  function handleDownButtonClick() {
    // Handle logic for down button click
    // Perform actions when the up button is clicked
    movePlayer("down"); // Call the movePlayer function with the 'down' direction
  }

  function handleLeftButtonClick() {
    // Handle logic for left button click
    // Perform actions when the left button is clicked
    movePlayer("left"); // Call the movePlayer function with the 'left' direction
  }

  function handleRightButtonClick() {
    // Handle logic for right button click
    // Perform actions when the right button is clicked
    movePlayer("right"); // Call the movePlayer function with the 'right' direction
  }

  function movePlayer(direction) {
    // Logic to move the player based on the provided direction
    // Implement the game logic for moving the player in the specified direction
  }
});
