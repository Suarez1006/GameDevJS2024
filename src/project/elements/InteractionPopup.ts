import { Container, Graphics } from "pixi.js";

export class InteractionPopup extends Container {
	private fn: Function;
	constructor() {
		super();
		const bg = new Graphics();
		bg.beginFill(0xffffff);
		bg.drawRect(0, 0, 20, 20);
		this.addChild(bg);
	}

	public connectFunction(fn: Function): void {
		this.fn = fn;
	}

	public disconnectFunction(): void {
		this.fn = null;
	}

	public runFunction(): void {
		if (!this.fn) {
			return;
		}
		this.fn();
	}
}
