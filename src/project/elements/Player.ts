import type { DisplayObject } from "pixi.js";
import { Graphics } from "pixi.js";
import { Container } from "pixi.js";
import { addHitbox, Collisions } from "../managers/Collisions";
import { Keyboard } from "../../engine/input/Keyboard";
import { Key } from "../../engine/input/Key";

export class Player extends Container {
	private keybinds: Keyboard;

	private speed = 3;
	private body: Graphics = new Graphics();

	public mapLimits: any;
	constructor() {
		super();
		this.keybinds = new Keyboard();

		this.body.beginFill(0x4309ae);
		this.body.drawRect(0, 0, 30, 30);
		this.addChild(this.body);

		addHitbox({ object: this, tag: "Character" });

		Collisions.getInstance().collideEmitter.on("Interaction", (data: { character: DisplayObject; interactive: DisplayObject }) => {
			// console.log(data);
		});
	}

	public update(): void {
		this.playerMovement();
	}

	private playerMovement(): void {
		if (this.keybinds.isDown(Key.KEY_W) || this.keybinds.isDown("ArrowUp")) {
			this.y = this.y - this.speed;

			if (this.y < 0) {
				this.y = 0;
			}
		}
		if (this.keybinds.isDown(Key.KEY_S) || this.keybinds.isDown("ArrowDown")) {
			this.y = this.y + this.speed;
			if (this.y > this.mapLimits.height - this.height) {
				this.y = this.mapLimits.height - this.height;
			}
		}
		if (this.keybinds.isDown(Key.KEY_A) || this.keybinds.isDown("ArrowLeft")) {
			this.x = this.x - this.speed;

			if (this.x < 0) {
				this.x = 0;
			}
		}
		if (this.keybinds.isDown(Key.KEY_D) || this.keybinds.isDown("ArrowRight")) {
			this.x = this.x + this.speed;
			if (this.x > this.mapLimits.width - this.width) {
				this.x = this.mapLimits.width - this.width;
			}
		}
	}
}
