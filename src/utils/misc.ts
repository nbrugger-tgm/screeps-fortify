export function asMap<T, K>(roles: T[], param2: (role: T) => K): Map<K, T> {
	let obj = new Map<K, T>();
	for (let role of roles) {
		obj.set(param2(role), role);
	}
	return obj;
}

export function getObjectAsList<T>(obj: { [key: string]: T }): T[] {
	let rooms = [];
	for (let room in obj) {
		rooms.push(obj[room]);
	}
	return rooms;
}

export type SerializableRoomPosition = {
	x: number;
	y: number;
	roomName: string;
}

export function toRoomPosition(pos: SerializableRoomPosition): RoomPosition {
	return new RoomPosition(pos.x, pos.y, pos.roomName);
}

export function toSerializableRoomPosition(pos: RoomPosition): SerializableRoomPosition {
	return { x: pos.x, y: pos.y, roomName: pos.roomName };
}

