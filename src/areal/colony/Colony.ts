import { ColonyStageID } from "./ColonyStage";

export class Colony {
	private sources: RoomPosition[];
	private readonly room: Room;

	constructor(spawner: Room) {
		this.room = spawner;
		this.memory.colonialisized = true;
		this.sources = this.room.find(FIND_SOURCES).map((s)=>s.pos);
	}

	get memory(): RoomMemory {
		return this.room.memory;
	}

	set memory(value) {
		this.room.memory = value;
	}

	static isColony(room: Room): boolean {
		return room.memory.colonialisized;
	}
}
declare global {
	interface RoomMemory {
		colonialisized: boolean;
		stage: ColonyStageID;
	}
}
