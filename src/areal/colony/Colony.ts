import {lazyCache} from "../../utils/performance";
import { PathingBrain, PathingMemory } from "../../pathing/PathingMemory";
import {Role, RoleName} from "../../creeps/Role";
import {getObjectAsList} from "../../utils/misc";
import {getRole, getUsableRoles} from "../../creeps/roles";
import {ColonyTargetID, ColonyTargets} from "./ColonyTarget";

export class Colony {
	private readonly room: Room;
	public sources = ()=>this.room.find(FIND_SOURCES);

	private constructor(nativeRoom: Room) {
		this.room = nativeRoom;
	}

	private _pathing = lazyCache(() => new PathingBrain(this.room.memory.pathing));
	get pathing(): PathingBrain {
		return this._pathing();
	}

	get population() {
		return this.room.memory.population;
	}

	static collonize(room: Room): Colony {
		const colony = new Colony(room);
		colony.initialize();
		return colony;
	}


	static getColony(room: Room): Colony {
		if (Colony.isColony(room))
			return Colony.useColony(room);
		else
			return Colony.collonize(room);
	}

	static useColony(room: Room): Colony {
		const colony = new Colony(room);
		colony.readExisting();
		return colony;
	}

	static isColony(room: Room): boolean {
		return room.memory.colonialisized;
	}

	tick() {
		this.performCreepActions();
		this.performPopulationControll();
		this.evolve();
	}

	private initialize() {
		this.room.memory = {
			colonialisized: true,
			target: ColonyTargetID.ENABLE_HARVESTERS,
			pathing: {},
			population: {creeps: [], target: {}}
		};
	}

	private readExisting() {
		this.room.memory.population.creeps = getObjectAsList(Game.creeps)
			.filter(creep => creep.memory.colony === this.room.name)
			.map(creep => creep.name);
	}

	private performCreepActions() {
		for (const creepName of this.population.creeps) {
			const creep = Game.creeps[creepName];
			if (!creep) {
				this.population.creeps = this.population.creeps.filter(name => name !== creepName);
				continue;
			}
			const roleName = creep.memory.currentRole;
			const role = getRole(roleName)!;
			let {interruptible, couldPerform} = role.perform(creep, this);
			if (interruptible && roleName != creep.memory.primaryRole) {
				//go back to primary role
				creep.memory.currentRole = creep.memory.primaryRole;
			} else if (!couldPerform && interruptible) {
				//switch to a role that can be performed
				let applicableRoles = getUsableRoles(creep);
				for (let newRole of applicableRoles) {
					let newJobResult = newRole.perform(creep, this);
					if (newJobResult.couldPerform) {
						creep.memory.currentRole = newRole.indexName;
						break;
					}
				}
			}
		}
	}

	/**
	 * In/Decrease the population of the colony
	 */
	private performPopulationControll() {
		let activeRoles = this.population.creeps
			.map(creepName => Game.creeps[creepName])
			.map(creep => creep.memory.primaryRole);
		let activePop = new Map<RoleName, number>();
		for (let role of activeRoles) {
			activePop.set(role, (activePop.get(role) || 0) + 1);
		}
		for (const [role, targetPop] of Object.entries(this.population.target)) {
			let rolename = role as RoleName;
			let actual = activePop.get(rolename) || 0;
			if (actual < (targetPop??0)) {
				this.spawnCreep(getRole(rolename));
				break;
			}
		}
	}

	private spawnCreep(role: Role) {
		let spawn = this.room.find(FIND_MY_SPAWNS)[0];
		let energy = spawn.room.energyAvailable;
		if (role.minimalCost > energy)
			return;
		let body = role.calculateBody(energy);
		let name = role.displayName + Math.random() * 100;
		let creepName = spawn.spawnCreep(body, name, {
			memory: {
				colony: this.room.name,
				currentRole: role.indexName,
				primaryRole: role.indexName
			}
		});
		if (creepName == OK) {
			this.population.creeps.push(name);
		} else {
			console.log("Could not spawn creep: " + creepName);
		}
	}

	private evolve() {
		let target = ColonyTargets.get(this.room.memory.target)!;
		if (target.isReached(this)) {
			if (target.next) {
				this.room.memory.target = target.next;
				console.log("Completed stage: " + target);
			}
		} else if (target.canPerform(this)) {
			target.perform(this);
		}
	}
}

type PopulationMemory = {
	creeps: string[];
	target: { [key in RoleName]?:number};
}

declare global {
	interface RoomMemory {
		colonialisized: boolean;
		target: ColonyTargetID;
		pathing: PathingMemory;
		population: PopulationMemory;
	}

	interface CreepMemory {
		primaryRole: RoleName;
		currentRole: RoleName;
		colony: string;
	}
}
