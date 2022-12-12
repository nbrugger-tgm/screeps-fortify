import {Colony} from "./Colony";
import {RoleName} from "../../creeps/Role";

export interface ColonyTarget {
	id: ColonyTargetID;
	next?: ColonyTargetID;

	isReached(colony: Colony): boolean;

	canPerform(colony: Colony): boolean;

	perform(colony: Colony): void;
}

export enum ColonyTargetID {
	ENABLE_HARVESTERS,
	ENABLE_SINGLE_BUILDER,
	ENABLE_UPGRADERS,
	UPGRADE_CONTROLLER_LV2,
	SET_UPGRADER_PRIO_LOW,
	SET_BUILDER_PRIO_HIGH,
	UPGRADE_CORE_V1,
	BUILD_ROADS_TO_SOURCES,
	BUILD_ROAD_TO_CONTROLLER,
	SET_UPGRADER_PRIO_NORMAL,
	SET_BUILDER_PRIO_NORMAL,
	UPGRADE_CORE_V2,
	ENABLE_REPAIR_DRONE,
	DIASABLE_NON_FULL_ENERGY_SPAWN,
	BUILD_INITAL_WALLS,
	ENABLE_FORTIFIERS,
	FORTIFY_10k,
	UPGRADE_CONTROLLER_LV3,
	UPGRADE_CORE_V3,
	ENABLE_MEELE_DEFENDERS,
	ENABLE_HEALER,
	ENABLE_RANGED_DEFENDERS,
	UPGRADE_CONTROLLER_LV4,
	UPGRADE_CORE_V4
}

class EnableHarvesters implements ColonyTarget {

	id = ColonyTargetID.ENABLE_HARVESTERS;

	isReached(colony: Colony): boolean {
		return (colony.population.target[RoleName.HARVESTER] ?? 0) >= 10;
	}

	canPerform(colony: Colony): boolean {
		return true;
	}

	perform(colony: Colony): void {
		colony.population.target[RoleName.HARVESTER] = 10;
	}
}

const TARGETS = [new EnableHarvesters()];
export const ColonyTargets: Map<ColonyTargetID, ColonyTarget> = new Map(TARGETS.map(target => [target.id, target]));
