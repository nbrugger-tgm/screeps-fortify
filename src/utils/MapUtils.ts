import { SerializableRoomPosition } from "./misc";

export class MapUtils {
	public static getSuroundingTiles(core: SerializableRoomPosition, radius = 1): SerializableRoomPosition[] {
		let x = core.x, y = core.y;
		let tiles: SerializableRoomPosition[] = [];

		for (let nx = x - radius; nx < x + radius; nx++) {
			tiles.push({ x: nx,y: y + radius,roomName: core.roomName});
		}
		for (let nx = x - radius + 1; nx < x + radius + 1; nx++) {
			tiles.push({ x: nx,y: y - radius,roomName: core.roomName});
		}

		for (let ny = y - radius + 1; ny < y + radius + 1; ny++) {
			tiles.push({ x: x + radius,y: ny,roomName: core.roomName});
		}
		for (let ny = y - radius; ny < y + radius; ny++) {
			tiles.push({ x: x - radius,y: ny,roomName: core.roomName});
		}
		return tiles;
	}
}
