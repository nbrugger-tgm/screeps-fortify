import {ErrorMapper} from "utils/ErrorMapper";
import {GameState} from "./GameState";
import {CoreBuilding} from "./building/CoreBuilding";

const state: GameState = GameState.get();
console.log("Main init");
let ticks = 0;
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	ticks++;
	state.tick();
	if (ticks % 60 === 0) freeMemory();
});
//@ts-ignore
global.CoreBuilding = CoreBuilding;

function freeMemory() {
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
}
