// This function calculates the room index based on the object's position in the scene
function getRoomIndex(objectName, scene) {
  // Get the object from the scene's object handler
  let object = scene.objectHandler.getObject(objectName);
  // Calculate the x and y coordinates of the object in the grid
  let x = Math.floor(object.x / scene.gridSize);
  let y = Math.floor(object.y / scene.gridSize);
  // Calculate the room coordinates based on the object's position
  let roomX = Math.floor(x / 10); // assuming each room is 10 tiles wide
  let roomY = Math.floor(y / 10); // assuming each room is 10 tiles high
  // Create a string that uniquely identifies the room
  return `room_${roomX}_${roomY}`;
}
// Export the getRoomIndex function for external use
export { getRoomIndex };
