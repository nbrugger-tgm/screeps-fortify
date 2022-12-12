import {Role, RoleName} from "./Role";
import {HARVESTER} from "./Harvester";
import {asMap} from "../utils/misc";

const roles: Role[] = [
	HARVESTER
];
const RoleMap = asMap(roles, role => role.indexName);


export function getRole(roleName: RoleName): Role {
	return RoleMap.get(roleName)!;
}

export function getRoles(): Role[] {
	return [...roles];
}

export function getUsableRoles(me: Creep): Role[] {
	return roles.filter(role => role.canBePerformedBy(me));
}
