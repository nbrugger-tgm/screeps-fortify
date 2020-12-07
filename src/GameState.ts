import { Colony } from "./areal/Colony";
import { GameUtils } from "./utils/GameUtils";


export class GameState {
	private colonies: Colony[];

	constructor(rooms: Room[]) {
		this.colonies = [];
		for (const room of rooms) {
			this.colonies.push(new Colony(room));
		}
	}

	static get(): GameState {
		let rooms = GameUtils.getRooms();
		if (rooms.length === 1) {
			let room = rooms[0];
			if (Colony.isColony(room)) {
				return GameState.readState(rooms);
			} else
				return new GameState([rooms[0]]);
		} else {
			return GameState.readState(rooms);
		}
	}

	private static readState(rooms: Room[]): GameState {
		let colonies :Array<Room> = [];
		for (const room of rooms) {
			if (Colony.isColony(room)) {
				colonies.push(room);
			}
		}
		return new GameState(colonies);
	}

	tick() {
		console.log(JSON.stringify(this.colonies[0].memory.colonialisized));
	}
}
