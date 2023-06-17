

function getRoomIndex(objectName, scene) {
    let object = scene.objectHandler.getObject(objectName);
    let x = Math.floor(object.x / scene.gridSize);
    let y = Math.floor(object.y / scene.gridSize);
    let roomX = Math.floor(x / 10); // assuming each room is 10 tiles wide
    let roomY = Math.floor(y / 10); // assuming each room is 10 tiles high
    return `room_${roomX}_${roomY}`; // Create a string that uniquely identifies the room
}





export {
    getRoomIndex
}