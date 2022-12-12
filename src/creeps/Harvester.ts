import {Role, RoleName} from "./Role";
import {Colony} from "../areal/colony/Colony";

type StructuresSink = StructureStorage | StructureSpawn | StructureExtension;

class Harvester extends Role {
	displayName = "Harvester";
	optionalParts = [WORK, CARRY, CARRY, MOVE, WORK, CARRY, MOVE];
	requiredParts = [WORK, CARRY, MOVE];
	indexName = RoleName.HARVESTER;

	perform(me: Creep, colony: Colony) {
		if(me.spawning) return {couldPerform: true, interruptible: true};
		let memory = me.memory.harvesting;
		if (!memory) {
			me.memory.harvesting = {};
			memory = me.memory.harvesting;
		}
		switch (memory.state ?? HarvesterState.MOVE_TO_SOURCE) {
			case HarvesterState.MOVE_TO_SOURCE:
				return {couldPerform: this.moveToSource(me, colony, memory), interruptible: true};
			case HarvesterState.HARVEST:
				let source = memory.source && Game.getObjectById(memory.source);
				if (!source) {
					memory.state = HarvesterState.MOVE_TO_SOURCE;
					break;
				}
				if (source.energy == 0 || me.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
					memory.state = HarvesterState.MOVE_TO_SINK;
					break;
				}
				me.harvest(source);
				break;
			case HarvesterState.MOVE_TO_SINK:
				return {couldPerform: this.moveToSink(me, colony, memory), interruptible: false};
			case HarvesterState.TRANSFER:
				let sink = memory.sink && Game.getObjectById(memory.sink);
				if (me.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
					memory.state = HarvesterState.MOVE_TO_SOURCE;
					break;
				}
				if (sink == undefined) {
					memory.state = HarvesterState.MOVE_TO_SINK;
					break;
				}
				me.transfer(sink, RESOURCE_ENERGY);
				break;
		}
		return {couldPerform: true, interruptible: false};
	}

	getBestSource(me: Creep, colony: Colony): Source | undefined {
		let sources = colony.sources();
		sources = sources
			.filter(source => source.energy > me.store.getFreeCapacity(RESOURCE_ENERGY))
			.sort((a, b) => a.pos.getRangeTo(me) - b.pos.getRangeTo(me));
		for (const source of sources) {
			let path = colony.pathing.getRoute(me.pos, source.pos, 1);
			if (path != undefined) {
				return source;
			}
		}
		return undefined;
	}

	private moveToSink(me: Creep, colony: Colony, memory: HarvesterMemory) {
		return this.executeMovingState(
			me, colony,
			() => this.getBestSink(me, colony),
			() => memory.sink,
			(sink) => memory.sink = sink,
			HarvesterState.TRANSFER,
			(state) => memory.state = state
		);
	}

	private moveToSource(me: Creep, colony: Colony, memory: HarvesterMemory) {
		return this.executeMovingState(
			me, colony,
			() => this.getBestSource(me, colony),
			() => memory.source,
			(source) => memory.source = source,
			HarvesterState.HARVEST,
			(state) => memory.state = state
		);
	}

	private getBestSink(me: Creep, colony: Colony): StructuresSink | undefined {

		const spawns = (me.pos.findInRange(FIND_MY_STRUCTURES, 20, {filter: (structure) => structure.structureType == STRUCTURE_SPAWN}) as StructureSpawn[])
			.filter(sink => sink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
			.sort((a, b) => a.pos.getRangeTo(me) - b.pos.getRangeTo(me));
		for (const sink of spawns) {
			let path = colony.pathing.getRoute(me.pos, sink.pos, 1);
			if (path != undefined) {
				return sink;
			}
		}
		const extensions = (me.pos.findInRange(FIND_MY_STRUCTURES, 20, {filter: (structure) => structure.structureType == STRUCTURE_SPAWN}) as StructureExtension[])
			.filter(sink => sink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
			.sort((a, b) => a.pos.getRangeTo(me) - b.pos.getRangeTo(me));
		for (const sink of extensions) {
			let path = colony.pathing.getRoute(me.pos, sink.pos, 1);
			if (path != undefined) {
				return sink;
			}
		}
		const storages = (me.pos.findInRange(FIND_MY_STRUCTURES, 20, {filter: (structure) => structure.structureType == STRUCTURE_STORAGE}) as StructureStorage[])
			.filter(sink => sink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
			.sort((a, b) => a.pos.getRangeTo(me) - b.pos.getRangeTo(me));
		for (const sink of storages) {
			let path = colony.pathing.getRoute(me.pos, sink.pos, 1);
			if (path != undefined) {
				return sink;
			}
		}
		return undefined;
	}
}

type HarvesterMemory = {
	state?: HarvesterState,
	source?: Id<Source>,
	sink?: Id<StructuresSink>
}

enum HarvesterState {
	MOVE_TO_SOURCE,
	HARVEST,
	MOVE_TO_SINK,
	TRANSFER
}

declare global {
	interface CreepMemory {
		harvesting?: HarvesterMemory;
	}
}

export const HARVESTER = new Harvester();
