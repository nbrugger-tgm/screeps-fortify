import {Colony} from "../areal/colony/Colony";
import {MoveResult} from "../pathing/PathingMemory";
import { toRoomPosition, toSerializableRoomPosition } from "../utils/misc";

export abstract class Role {
	abstract optionalParts: BodyPartConstant[];
	abstract requiredParts: BodyPartConstant[];
	abstract displayName: string;
	abstract indexName: RoleName;

	get minimalCost() {
		return this.requiredParts.reduce((acc, part) => acc + BODYPART_COST[part], 0);
	}

	abstract perform(me: Creep, colony: Colony): { interruptible: boolean, couldPerform: boolean };

	calculateBody(energy: number): BodyPartConstant[] {
		const body = [...this.requiredParts];
		energy -= this.minimalCost;
		let optionalIndex = 0;
		const cheapestOptionalPart = Math.min(...this.optionalParts.map(part => BODYPART_COST[part]));
		while (energy >= cheapestOptionalPart) {
			const part = this.optionalParts[optionalIndex];
			let price = BODYPART_COST[part];
			if (price > energy) {
				continue;
			}
			body.push(part);
			energy -= price;
			optionalIndex++;
			optionalIndex %= this.optionalParts.length;
		}

		return body;
	}

	canBePerformedBy(creep: Creep) {
		return this.requiredParts.every(part => creep.body.map(t => t.type).includes(part));
	}

	protected executeMovingState<T extends _HasRoomPosition & _HasId, S>(
		me: Creep, colony: Colony,
		findTarget: () => T | undefined,
		memoryRead: () => Id<T> | undefined,
		memoryWrite: (target?: Id<T>) => void,
		targetReachedState: S,
		updateState: (state: S) => void,
	): boolean {
		let target = memoryRead();
		if (!target) {
			target = findTarget()?.id;
			memoryWrite(target);
			console.log("Found target: " + target);
			if (!target) {
				return false;
			}
		}
		let source = Game.getObjectById(target);
		if (!source) {
			console.log("Remove invalid source target "+target);
			memoryWrite(undefined);
			return true;
		}
		let result = colony.pathing.moveTowards(me, source.pos, 1);
		if (result == MoveResult.REACHED_TARGET) {
			updateState(targetReachedState);
		} else if (result == MoveResult.UNREACHABLE) {
			memoryWrite(undefined);
		}
		return true;
	}
}

export enum RoleName {
	HARVESTER = "harvester",
}
