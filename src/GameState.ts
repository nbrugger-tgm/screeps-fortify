import {Colony} from "./areal/colony/Colony";
import {GameUtils} from "./utils/GameUtils";


export class GameState {


	constructor(
		private colonies: Colony[]
	) {
	}

	static get(): GameState {
		let rooms = GameUtils.getRooms();
		if (rooms.length === 1) {
			let room = rooms[0];
			if (Colony.isColony(room))
				return new GameState([Colony.useColony(room)]);
			else
				return new GameState([Colony.collonize(room)]);
		} else {
			return new GameState(rooms.filter(Colony.isColony).map((r) => Colony.useColony(r)));
		}
	}

	tick() {
		for (let colony of this.colonies) {
			colony.tick();
		}
	}
}
