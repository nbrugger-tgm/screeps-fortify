import { ErrorMapper } from "utils/ErrorMapper";
import { GameState } from "./GameState";
import { CoreBuilding } from "./building/CoreBuilding";
import { Vector } from "./building/Vector";

const state: GameState = GameState.get();
let tick = 1;
const bld = new CoreBuilding(new Vector(15,35),Game.rooms["sim"]);
bld.addMissingConstructions();
console.log("Main init");
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	//state.tick();
	console.log("Stage  :  "+bld.stage);
	if(tick++ % 10 == 0 && bld.stage < 4){
		console.log("Upgrade");
		//bld.upgrade();
	}
	//freeMemory();
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
