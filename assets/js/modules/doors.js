//Door Handling object
class DoorHandler {
    constructor(scene) {
        this.mapSize = {
            width: scene.map.width,
            height: scene.map.height,
        };
        this.scene = scene;
        this.doorTileTypes = {
            1367: 1361,
            1368: 1362,
            1415: 1409,
            1416: 1410,
            495: -1,
            1363: 1365,
            1364: 1366,
            1411: 1413,
            1412: 1414,
            1077: -1,
            1078: -1,
            1125: -1,
            1126: -1,

        };
        this.lockedDoorTypes = {
            1363: -1,
            1364: -1,
            1411: -1,
            1412: -1,
        };
        this.hasKey = false;
    }

    getAdjacentDoors(x, y) {
        let playerSize = 16 * 3;
        // Grid coordinates for the current door tile
        let doorLocation = [Math.floor(x / playerSize), Math.floor(y / playerSize)];
        // Define directions for a 2x2 square around the current door tile
        const directions = [ [0, 0], [-1, 0],[1, 0],[0, -1], [0, 1], [-1, -1], [-1, 1],[1, -1], [1, 1] ];
        // To store the locations of door tiles
        let doorTiles = [];

        for (let dir of directions) {
            let targetCoords = [doorLocation[0] + dir[0], doorLocation[1] + dir[1]]
            let targetWorldCoords = {
                x: targetCoords[0] * playerSize,
                y: targetCoords[1] * playerSize,
            };
            // Check if target coords are within map bounds
            if (
                targetCoords[0] >= 0 &&
                targetCoords[0] < this.mapSize.width &&
                targetCoords[1] >= 0 &&
                targetCoords[1] < this.mapSize.height
            ) {
                let targetTile = this.scene.collision.getTileAtWorldXY(
                    targetWorldCoords.x,
                    targetWorldCoords.y,
                    false
                );
                console.log(
                    `Checking tile at (${targetWorldCoords.x}, ${targetWorldCoords.y
					}) - Index: ${targetTile ? targetTile.index : "None"}`
                );
               // In the 'forEach' loop where you check the door tiles
                Object.keys(this.doorTileTypes).forEach((element) => {
                    if (targetTile && targetTile.index == element) {
                        // check if the door is in the list of locked doors
                        if (Object.keys(this.lockedDoorTypes).includes(targetTile.index.toString())) {
                            // if the door is locked and the player doesn't have a key, do not add it to the doorTiles array
                            if (!this.hasKey) {
                                console.log(`Door at (${targetWorldCoords.x}, ${targetWorldCoords.y}) is locked and player doesn't have a key.`);
                                return;
                            } else {
                                console.log(`Door at (${targetWorldCoords.x}, ${targetWorldCoords.y}) is locked but player has a key.`);
                            }
                        }
                        // if the door is not locked or if it is locked but the player has a key, add it to the doorTiles array
                        doorTiles.push({
                            x: targetWorldCoords.x,
                            y: targetWorldCoords.y
                        });
                    }
                });

            } else {
                console.log(
                    `Coordinates (${targetWorldCoords.x}, ${targetWorldCoords.y}) out of map bounds.`
                );
            }
        }
        return doorTiles;
    }
}

export {
    DoorHandler
}