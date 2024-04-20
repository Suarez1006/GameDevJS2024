import { Graphics } from "pixi.js";
import { Container } from "pixi.js";

export class Player extends Container {
	private body: Graphics = new Graphics();
	constructor() {
		super();
		this.body.beginFill(0x4309ae);
		this.body.drawRect(0, 0, 30, 30);
		this.addChild(this.body);
	}
}
