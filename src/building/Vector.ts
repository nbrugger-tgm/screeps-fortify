export class Vector {
	get y(): number {
		return this._y;
	}
	get x(): number {
		return this._x;
	}
	constructor(x:number, y: number) {
		this._x = x;
		this._y = y;
	}
	private _x:number;

	private _y:number;
}
