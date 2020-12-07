import { Colony } from "./Colony";

export interface ColonyStageTarget{
	isReached(colony:Colony):boolean;
	needsAction(colony:Colony):boolean;
	performAction(colony: Colony):void;
	readonly needsWaiting:boolean;
}
export enum ColonyStageTargetID {
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
class EnableHarvesters implements ColonyStageTarget{
	readonly needsWaiting = false;

	isReached(colony: Colony): boolean {return false;}

	needsAction(colony: Colony): boolean {return false;}

	performAction(colony: Colony): void {
	}

}
const map:Map<ColonyStageTargetID,ColonyStageTarget> = new Map([
	[ColonyStageTargetID.ENABLE_HARVESTERS,{}]
]);
