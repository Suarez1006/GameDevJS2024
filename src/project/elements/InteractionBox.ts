import { Container, Graphics } from "pixi.js";
import { SHOW_COLLIDERS } from "../../flags";
import { addHitbox } from "../managers/Collisions";

export class InteractionBox extends Container {
	private bg: Graphics = new Graphics();
	public interactionTag: string;
	constructor(params: { x: number; y: number; width: number; height: number; interactionTag: string }) {
		super();
		this.bg.beginFill(0xff00ff, 0.5);
		this.bg.drawRect(params.x, params.y, params.width, params.height);
		this.addChild(this.bg);
		this.bg.visible = SHOW_COLLIDERS;

		this.interactionTag = params.interactionTag;

		addHitbox({ object: this, tag: "Interaction" });
	}
}
