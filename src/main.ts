import { ErrorMapper } from "utils/ErrorMapper";
import { GameState } from "./GameState";

const state: GameState = GameState.get();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	state.tick();
	freeMemory();
});

function freeMemory() {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
}
