import { Container, Graphics } from "pixi.js";
import { SHOW_COLLIDERS } from "../../flags";
import { addHitbox } from "../managers/Collisions";

export class InteractionBox extends Container {
	private bg: Graphics = new Graphics();
	constructor(params: { x: number; y: number; width: number; height: number }) {
		super();
		this.bg.beginFill(0xff00ff, SHOW_COLLIDERS ? 0.5 : 0);
		this.bg.drawRect(params.x, params.y, params.width, params.height);
		this.addChild(this.bg);

		addHitbox({ object: this, tag: "Interaction" });
	}
}
