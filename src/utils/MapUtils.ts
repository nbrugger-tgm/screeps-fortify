export class MapUtils {
	public static getSuroundingTiles(core: RoomPosition, radius = 1): RoomPosition[] {
		let x = core.x, y = core.y;
		let sideLength = 1 + radius * 2;
		let tiles: RoomPosition[] = [];
		let room = Game.rooms[core.roomName];
		for (let i = 0; i < sideLength; i++) {
			tiles.push(new RoomPosition(x - 1, y, core.roomName));
		}
		for (let i = 0; i < sideLength; i++) {
			tiles.push(new RoomPosition(x, y - 1, core.roomName));
		}
		for (let i = 0; i < sideLength; i++) {
			tiles.push(new RoomPosition(x + 1, y, core.roomName));
		}
		for (let i = 0; i < sideLength - 1; i++) {
			tiles.push(new RoomPosition(x, y + 1, core.roomName));
		}
		return tiles;
	}
}
