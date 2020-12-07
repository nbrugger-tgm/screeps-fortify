export class GameUtils {
	static getRooms(): Room[] {
		return this.getObjectAsList(Game.rooms);
	}

	static getSpawners(): StructureSpawn[] {
		return this.getObjectAsList(Game.spawns);
	}

	private static getObjectAsList(obj: any): any[] {
		let rooms = [];
		for (let room in obj) {
			rooms.push(obj[room]);
		}
		return rooms;
	}
}
