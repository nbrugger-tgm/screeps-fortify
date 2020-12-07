import { Building } from "./Building";
import { Vector } from "./Vector";

export class CoreBuilding extends Building{
	anchorPoints: Vector[] = [
		new Vector(0,0),
		new Vector(1,2),
		new Vector(2,2),
		new Vector(2,2)
	];
	stages: (BuildableStructureConstant|undefined)[][][] = [
		[
			[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_CONTAINER]
		],
		[
			[undefined          , STRUCTURE_EXTENSION, undefined          , undefined],
			[undefined          , STRUCTURE_EXTENSION, undefined          , undefined],
			[STRUCTURE_EXTENSION, STRUCTURE_SPAWN    , STRUCTURE_EXTENSION, STRUCTURE_CONTAINER],
			[undefined          , STRUCTURE_EXTENSION, undefined          , undefined]
		],
		[
			[STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,  STRUCTURE_CONTAINER,  undefined          , undefined],
			[STRUCTURE_EXTENSION,undefined          ,  STRUCTURE_EXTENSION,  undefined          , undefined],
			[STRUCTURE_CONTAINER,STRUCTURE_EXTENSION,  STRUCTURE_SPAWN    ,  STRUCTURE_EXTENSION, STRUCTURE_CONTAINER],
			[STRUCTURE_EXTENSION,undefined          ,  STRUCTURE_EXTENSION,  undefined          , STRUCTURE_EXTENSION],
			[STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,  STRUCTURE_CONTAINER,  STRUCTURE_EXTENSION, STRUCTURE_EXTENSION],
		],
		[
			[STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,  STRUCTURE_STORAGE  ,  undefined          , undefined],
			[STRUCTURE_EXTENSION,undefined          ,  STRUCTURE_EXTENSION,  undefined          , undefined],
			[STRUCTURE_CONTAINER,STRUCTURE_EXTENSION,  STRUCTURE_SPAWN    ,  STRUCTURE_EXTENSION, STRUCTURE_CONTAINER],
			[STRUCTURE_EXTENSION,undefined          ,  STRUCTURE_EXTENSION,  undefined          , STRUCTURE_EXTENSION],
			[STRUCTURE_EXTENSION,STRUCTURE_EXTENSION,  STRUCTURE_CONTAINER,  STRUCTURE_EXTENSION, STRUCTURE_EXTENSION],
		]
	];
	public depositPositons:Vector[][] = [
		[new Vector(2,1)],
		[new Vector(0,2),new Vector(4,2),new Vector(2,0),new Vector(2,4)],
		[new Vector(0,2),new Vector(4,2),new Vector(2,0),new Vector(2,4)]
	]

}
