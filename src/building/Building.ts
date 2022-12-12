import {Vector} from "./Vector";

export abstract class Building {
	abstract stages: (BuildableStructureConstant | undefined)[][][];
	abstract anchorPoints: Vector[];
	private readonly location: Vector;

	constructor(location: Vector, room: Room) {
		this.location = location;
		this._room = room;
		this._stage = 0;
		console.log("Construct building");
	}

	get layout(): (BuildableStructureConstant | undefined)[][] {
		return this.stages[this._stage];
	}

	get anchorPoint(): Vector {
		return this.anchorPoints[this._stage];
	}

	private _stage: number;

	get stage(): number {
		return this._stage;
	}

	private _room: Room;

	get room(): string {
		return this._room.name;
	}

	set room(value: string) {
		this._room = Game.rooms[value];
	}

	get completed(): boolean {
		let done = true;
		let layout = this.layout;
		let anchorPoint = this.anchorPoint;
		let cornerPos = new Vector(this.location.x - anchorPoint.x, this.location.y - anchorPoint.y);
		let areal = this._room.lookAtArea(cornerPos.y, cornerPos.x, cornerPos.y + layout.length, cornerPos.x + layout[0].length);
		for (let yOffset = 0; yOffset < layout.length; yOffset++) {
			let row = layout[yOffset];
			for (let xOffset = 0; xOffset < row.length; xOffset++) {
				let tile = row[xOffset];
				if (tile == undefined)
					continue;
				let results = areal[cornerPos.x + xOffset][cornerPos.y + yOffset];
				let found = false;
				for (let object of results) {
					// @ts-ignore
					found = found || ((object.type == LOOK_STRUCTURES) && object[object.type].structureType == tile);
				}
				done = done && found;
			}
		}
		return done;
	}

	public upgrade() {
		console.log("bev " + this._stage);
		this._stage = this._stage + 1;
		console.log("after " + this._stage);
		this.addMissingConstructions();
	}

	public addMissingConstructions(): void {
		let layout = this.layout;
		let anchorPoint = this.anchorPoint;
		let cornerPos = new Vector(this.location.x - anchorPoint.x, this.location.y - anchorPoint.y);
		console.log("Corner : " + JSON.stringify(cornerPos))
		let areal = this._room.lookAtArea(cornerPos.y, cornerPos.x, cornerPos.y + layout.length, cornerPos.x + layout[0].length);
		for (let yOffset = 0; yOffset < layout.length; yOffset++) {
			let row = layout[yOffset];
			for (let xOffset = 0; xOffset < row.length; xOffset++) {
				let tile = row[xOffset];
				if (tile == undefined)
					continue;
				let results = areal[cornerPos.y + yOffset][cornerPos.x + xOffset];
				let found = false;
				for (let object of results) {
					// @ts-ignore
					found = found || ((object.type == LOOK_STRUCTURES || object.type == LOOK_CONSTRUCTION_SITES) && object[object.type].structureType == tile);
				}
				if (!found) {
					let err = this._room.createConstructionSite(cornerPos.x + xOffset, cornerPos.y + yOffset, tile);
					if (err == ERR_INVALID_TARGET) {
						for (let object of results) {
							if (object.type == LOOK_CONSTRUCTION_SITES) {
								// @ts-ignore
								object.constructionSite.remove();
							} else if (object.type == LOOK_STRUCTURES) {
								// @ts-ignore
								object.structure.destroy();
							}
						}
						err = this._room.createConstructionSite(cornerPos.x + xOffset, cornerPos.y + yOffset, tile);
					}
					console.log("Create Construction: " + err);
				}
			}
		}
	}
}
