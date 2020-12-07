import { Vector } from "./Vector";

export abstract class Building {
	get layout():BuildableStructureConstant[][]{
		return this.stages[this.stage];
	}
	get anchorPoint():Vector{
		return this.anchorPoints[this.stage];
	}
	get room(): string {
		return this._room.name;
	}

	set room(value: string) {
		this._room = Game.rooms[value];
	}
	protected constructor(location: Vector,room: Room) {
		this.location = location;
		this._room = room;
	}
	abstract stages: BuildableStructureConstant[][][];
	abstract anchorPoints: Vector[];
	private readonly location:Vector;
	private stage = 0;
	private _room: Room;
	public upgrade():void{
		this.stage ++;
		this.addMissingConstructions();
	}
	public addMissingConstructions() : void{
		let layout = this.layout;
		let anchorPoint = this.anchorPoint;
		let cornerPos = new Vector(this.location.x-anchorPoint.x,this.location.y-anchorPoint.y);
		let areal = this._room.lookAtArea(cornerPos.y,cornerPos.x,cornerPos.y+layout.length,cornerPos.x+layout[0].length);
		for (let yOffset = 0; yOffset < layout.length; yOffset++){
			let row = layout[yOffset];
			for (let xOffset = 0; xOffset < row.length; xOffset++) {
				let tile = row[xOffset];
				let results = areal[cornerPos.x+xOffset][cornerPos.y+yOffset];
				let found = false;
				for(let object of results){
					// @ts-ignore
					found = found || ((object.type == LOOK_STRUCTURES || object.type == LOOK_CONSTRUCTION_SITES) && object[object.type].structureType == tile);
				}
				if(!found){
					this._room.createConstructionSite(cornerPos.x+xOffset,cornerPos.y+yOffset,tile);
				}
			}
		}
	}
	get completed() : boolean {
		let done = true;
		let layout = this.layout;
		let anchorPoint = this.anchorPoint;
		let cornerPos = new Vector(this.location.x-anchorPoint.x,this.location.y-anchorPoint.y);
		let areal = this._room.lookAtArea(cornerPos.y,cornerPos.x,cornerPos.y+layout.length,cornerPos.x+layout[0].length);
		for (let yOffset = 0; yOffset < layout.length; yOffset++){
			let row = layout[yOffset];
			for (let xOffset = 0; xOffset < row.length; xOffset++) {
				let tile = row[xOffset];
				let results = areal[cornerPos.x+xOffset][cornerPos.y+yOffset];
				let found = false;
				for(let object of results){
					// @ts-ignore
					found = found || ((object.type == LOOK_STRUCTURES ) && object[object.type].structureType == tile);
				}
				done = done && found;
			}
		}
		return done;
	}
}
