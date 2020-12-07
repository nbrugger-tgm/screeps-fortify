export interface Role{
	behave(me:Creep,memory:CreepMemory):boolean;
	calculateBody(energy:number):BodyPartConstant[];
}

