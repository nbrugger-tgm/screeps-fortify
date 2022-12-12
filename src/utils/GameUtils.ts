import {getObjectAsList} from "./misc";

export class GameUtils {
	static getRooms(): Room[] {
		return getObjectAsList(Game.rooms);
	}

	static getSpawners(): StructureSpawn[] {
		return getObjectAsList(Game.spawns);
	}


}
