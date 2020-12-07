import { MapUtils } from "../utils/MapUtils";


export class PathingMemory {
	private targetFieldIndex: Map<RoomPosition, Map<number, RoomPosition[]>> = new Map<RoomPosition, Map<number, RoomPosition[]>>();
	/**
	 * Map<FROM,Map<TO,ARRAY<Steps>>>
	 * @private
	 */
	private routeCache: Map<RoomPosition, Map<RoomPosition, Array<PathNode>>> = new Map();
	private occupiedTargets: Map<RoomPosition, boolean> = new Map();

	private static calculateRoute(from: RoomPosition, to: RoomPosition): Array<PathNode> {
		let result = PathFinder.search(from, to);
		if (result.incomplete) {
			throw Error("No path to find");
		}
		let path = [];
		let nodes = result.path;
		let lastNode = from;
		for (const node of nodes) {
			if (lastNode != node) {
				path.push(new PathNode(node, lastNode.getDirectionTo(node)));
			}
			lastNode = node;
		}
		return path;
	}

	public index(object: Locateable, ...radius: Array<number>): void {
		if (radius.length === 0)
			radius = [1];

		let fields: Map<number, Array<RoomPosition>> = new Map();
		for (const r of radius) {
			fields.set(r, MapUtils.getSuroundingTiles(object.pos, r));
		}
		this.targetFieldIndex.set(object.pos, fields);
	}

	public occupie(pos: RoomPosition): void {
		for (const entry of this.targetFieldIndex) {
			let radio: Map<number, RoomPosition[]> = entry[1];
			let key = entry[0];
			for (let entry of radio) {
				let arr: RoomPosition[] = entry[1];
				let index = arr.indexOf(pos);
				if (index != -1) {
					arr = arr.splice(index, 1);
					radio.set(entry[0], arr);
					break;
				}
			}
			this.targetFieldIndex.set(key, radio);
		}
		for (const [from, toMap] of this.routeCache) {
			for (const [to, route] of toMap) {
				if (route.map((e) => e.targetTile).includes(pos)) {
					toMap.delete(to);
				}
			}
		}
	}

	public getDesinations(target: RoomPosition, radius: number): RoomPosition[] {
		let objMap = this.targetFieldIndex.get(target);
		if (objMap !== undefined) {
			let arr = objMap.get(radius);
			if (arr === undefined) {
				arr = MapUtils.getSuroundingTiles(target, radius);
				objMap.set(radius, arr);
			}
			return arr;
		} else {
			let arr = MapUtils.getSuroundingTiles(target, radius);
			let map = new Map<number, RoomPosition[]>();
			map.set(radius, arr);
			this.targetFieldIndex.set(target, map);
			return arr;
		}
	}

	public getRoute(from: RoomPosition, to: RoomPosition, radius = 0): Array<PathNode> {
		if (radius > 0) {
			to = this.getDesinations(to, radius)[0];
		}
		if (this.routeCache.has(from)) {
			let fromFilteredRoutes = this.routeCache.get(from);
			// @ts-ignore
			if (fromFilteredRoutes.has(to)) {
				// @ts-ignore
				return this.readCache(from, to);
			} else {
				let route: Array<PathNode> = PathingMemory.calculateRoute(from, to);
				// @ts-ignore
				fromFilteredRoutes.set(to, route);
				return route;
			}
		} else {
			let route: Array<PathNode> = PathingMemory.calculateRoute(from, to);
			let fromFilteredRoutes = new Map<RoomPosition, Array<PathNode>>();
			fromFilteredRoutes.set(to, route);
			this.routeCache.set(from, fromFilteredRoutes);
			return route;
		}
	}

	public lock(pos: RoomPosition) {
		this.occupiedTargets.set(pos, true);
	}

	public isFree(pos: RoomPosition): boolean {
		return !this.occupiedTargets.get(pos);
	}

	public unlock(pos: RoomPosition) {
		this.occupiedTargets.set(pos, false);
	}

	private containsRoute(from: RoomPosition, to: RoomPosition) {
		// @ts-ignore
		return this.routeCache.has(from) && this.routeCache.get(from).has(to);
	}

	private readCache(from: RoomPosition, to: RoomPosition): Array<[number, RoomPosition]> {
		// @ts-ignore
		return this.routeCache.get(from).get(to);
	}

}

export interface Locateable {
	pos: RoomPosition;
}

export class Route implements IRoute {
	public from: RoomPosition;
	public to: RoomPosition;

	constructor(from: RoomPosition, to: RoomPosition) {
		this.from = from;
		this.to = to;
	}
}

export interface IRoute {
	from: RoomPosition;
	to: RoomPosition;
}

export interface IPathNode {
	direction: DirectionConstant;
	targetTile: RoomPosition;
}

export class PathNode implements IPathNode {
	direction: DirectionConstant;
	targetTile: RoomPosition;

	constructor(node: RoomPosition, directionTo: DirectionConstant) {
		this.direction = directionTo;
		this.targetTile = node;
	}

}
