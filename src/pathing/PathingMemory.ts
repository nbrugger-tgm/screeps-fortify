import { MapUtils } from "../utils/MapUtils";
import { SerializableRoomPosition, toRoomPosition, toSerializableRoomPosition } from "../utils/misc";

const unpassableObjects: LookConstant[] = [
	LOOK_STRUCTURES,
	LOOK_CONSTRUCTION_SITES,
	LOOK_RUINS
];
export type PathingMemory = {
	targetFieldIndex?: [SerializableRoomPosition, { [key: number]: SerializableRoomPosition[] }][];
	routeCache?: PathNode[][];
	occupiedTargets?: [SerializableRoomPosition, boolean][];
}

export class PathingBrain {
	/**
	 * Stores positions around an object that can be used to reach the object from a certain range
	 * Map<target, Map<range, surroundingTiles>>
	 * @private
	 */
	private targetFieldIndex: Map<SerializableRoomPosition, { [key: number]: SerializableRoomPosition[] }>;
	/**
	 * Map<FROM,Map<TO,STEPS>>
	 * @private
	 */
	private routeCache: PathNode[][];
	private occupiedTargets: Map<SerializableRoomPosition, boolean>;
	private save() {
		this.memory.targetFieldIndex = Array.from(this.targetFieldIndex);
		this.memory.routeCache = this.routeCache;
		this.memory.occupiedTargets = Array.from(this.occupiedTargets);
	}
	constructor(private memory: PathingMemory) {
		this.targetFieldIndex = new Map(memory.targetFieldIndex ?? []);
		this.routeCache = memory.routeCache ?? [];
		this.occupiedTargets = new Map(memory.occupiedTargets ?? []);
		this.save();
	}

	private static calculateRoute(from: RoomPosition, to: RoomPosition): PathNode[] | undefined {
		let result = PathFinder.search(from, to);
		if (result.incomplete) {
			return undefined;
		}
		let path = [];
		let nodes = result.path;
		let lastNode = from;
		for (const node of nodes) {
			if (lastNode != node) {
				path.push({
					direction: lastNode.getDirectionTo(node),
					targetTile: node,
					from: lastNode
				});
			}
			lastNode = node;
		}
		return path;
	}

	/**
	 * Uses caching and special logic to find a path to a target
	 * @return undefined if the target is not reachable or occupied
	 */
	public getRoute(from: RoomPosition, to: RoomPosition, radius = 0): PathNode[] | undefined {
		let toPos = toRoomPosition(to);
		let fromPos = toRoomPosition(from);
		while (radius > 0) {
			let destinations = this.getDesinations(toPos, radius).filter(p => this.isFree(p));
			if (destinations.length > 0) {
				toPos = toRoomPosition(this.getDesinations(toPos, radius)[0]);
				break;
			}
			radius--;
		}

		if (!this.isFree(toPos)) {
			return undefined;
		}

		//find (sub)path in cache
		for (let route of this.routeCache) {
			let containsFrom = false;
			for (let i = 0; i < route.length; i++) {
				let node = route[i];
				if (_.isEqual(node.from,fromPos)) {
					containsFrom = true;
					route = route.slice(i);
				}
			}
			if (!containsFrom) {
				continue;
			}
			for (let i = 0; i < route.length; i++) {
				let node = route[i];
				if (_.isEqual(node.targetTile,toPos)) {
					return route.slice(0, i + 1);
				}
			}
		}

		//no suitable subroute found - calculate new route
		let calculatedRoute = PathingBrain.calculateRoute(fromPos, toPos);
		this.routeCache.push(calculatedRoute ?? []);
		this.save();
		return calculatedRoute;
	}

	//position cant be used as path endpoint
	public lock(pos: SerializableRoomPosition) {
		this.occupiedTargets.set(pos, true);
		this.save()
	}

	public unlock(pos: SerializableRoomPosition) {
		this.occupiedTargets.set(pos, false);
		this.save();
	}

	public moveTowards(me: Creep, to: RoomPosition, radius = 1): MoveResult {
		let memory = me.memory.pathing;
		if (!memory) memory = me.memory.pathing = {};
		if (me.pos.isEqualTo(to)) {
			console.log("moveTowards: already at target", me.name, to,me.pos);
			this.unlock(to);
			memory.route = undefined;
			return MoveResult.REACHED_TARGET;
		}
		let route = memory.route;
		if (!route) {
			route = this.getRoute(me.pos, to, radius);
			memory.route = route;
		}
		if (!route) {
			return MoveResult.UNREACHABLE;
		}
		if(me.name == "Harvester85.48883396016862"){
			for (const pathNode of route) {
				Game.rooms[pathNode.from.roomName].visual.rect(toRoomPosition(pathNode.from),1,1)
			}
		}
		this.lock(to);

		let myNode = false;
		for (const pathNode of route) {
			if(me.name == "Harvester85.48883396016862"){
				console.log("compare to",JSON.stringify(pathNode.from),"and",JSON.stringify(toSerializableRoomPosition(me.pos)));
			}
			if (equalPositions(pathNode.from, me.pos)) {
				myNode = true;
				continue;
			}
			if (myNode) {
				me.move(pathNode.direction);
				break;
			}
		}
		if(!myNode) {
			if(me.name == "Harvester85.48883396016862")
				console.log("Did not find myself ",me.name," on any node", JSON.stringify(toSerializableRoomPosition(me.pos)));
			this.unlock(to)
			memory.route = undefined;
		}
		return MoveResult.MOVED;
	}

	private getDesinations(target: SerializableRoomPosition, radius: number): SerializableRoomPosition[] {
		let objMap = this.targetFieldIndex.get(target);
		if (objMap !== undefined) {
			let arr = objMap[radius];
			if (arr === undefined) {
				arr = MapUtils.getSuroundingTiles(target, radius);
				objMap[radius] = arr;
			}
			return arr;
		} else {
			let surroundingFreeTiles = MapUtils.getSuroundingTiles(target, radius).filter(
				e => Game.rooms[e.roomName].lookAt(toRoomPosition(e)).filter(struc => unpassableObjects.includes(struc.type) || struc.terrain == "wall").length == 0
			);
			let map:{[key: number]: SerializableRoomPosition[]} = {};
			map[radius] = surroundingFreeTiles;
			this.targetFieldIndex.set(target, map);
			this.save();
			return surroundingFreeTiles;
		}
	}

	private isFree(pos: SerializableRoomPosition): boolean {
		return this.occupiedTargets.get(pos)??true;
	}
}
function equalPositions(a: SerializableRoomPosition, b: SerializableRoomPosition): boolean {
	return a.x == b.x && a.y == b.y && a.roomName == b.roomName;
}
type CreepPathingMemory = {
	route?: PathNode[];
}

declare global {
	interface CreepMemory {
		pathing?: CreepPathingMemory;
	}
}

export enum MoveResult {
	REACHED_TARGET,
	MOVED,
	UNREACHABLE
}

export type Route = {
	from: SerializableRoomPosition;
	to: SerializableRoomPosition;
}

export type PathNode = {
	direction: DirectionConstant;
	targetTile: SerializableRoomPosition;
	from: SerializableRoomPosition;
}
