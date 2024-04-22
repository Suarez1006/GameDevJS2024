import type { DisplayObject, FederatedEvent } from "pixi.js";
import { Graphics } from "pixi.js";
import { Texture } from "pixi.js";
import { Container } from "pixi.js";
import { addHitbox, Collisions } from "../managers/Collisions";
import { Keyboard } from "../../engine/input/Keyboard";
import { Key } from "../../engine/input/Key";
import type { InteractionBox } from "./InteractionBox";
import { Manager } from "../..";
import { GameScene } from "../scenes/GameScene";
import { LobbyScene } from "../scenes/LobbyScene";
import { StateAnimation } from "../../StateAnimation";
import { SHOW_COLLIDERS } from "../../flags";

export class Player extends Container {
	private keybinds: Keyboard;
	private isMoving: Boolean = false;
	private speed = 3;
	private box2d: Graphics = new Graphics();
	private interactionTag: string;
	public mapLimits: any;
	public visuals: StateAnimation;

	constructor() {
		super();
		this.keybinds = new Keyboard();

		this.box2d.beginFill(0x4309ae);
		this.box2d.drawRect(0, 0, 30, 30);
		this.box2d.visible = SHOW_COLLIDERS;
		// this.addChild(this.box2d);

		addHitbox({ object: this, tag: "Character" });

		Collisions.getInstance().collideEmitter.on("Interaction", (data: { objA: DisplayObject; objB: DisplayObject }) => {
			let interactable: InteractionBox;
			if (data.objA == this) {
				interactable = data.objB as InteractionBox;
			} else {
				interactable = data.objA as InteractionBox;
			}

			this.interactionTag = interactable.interactionTag;
		});

		this.visuals = new StateAnimation();
		this.visuals.addState("WalkDown", [Texture.from("char1"), Texture.from("char2"), Texture.from("char3")]);
		this.visuals.addState("WalkLeft", [Texture.from("char4"), Texture.from("char5"), Texture.from("char6")]);
		this.visuals.addState("WalkRight", [Texture.from("char7"), Texture.from("char8"), Texture.from("char9")]);
		this.visuals.addState("WalkUp", [Texture.from("char10"), Texture.from("char11"), Texture.from("char12")]);
		this.addChild(this.visuals);

		this.visuals.playState("WalkDown");
		this.eventMode = "static";
		this.on("globalpointermove", (event: FederatedEvent) => {
			console.log(event.detail);
		});
	}

	public update(): void {
		this.playerMovement();
		this.playerInteractions();
	}

	private playerInteractions(): void {
		if (!this.keybinds.justPressed(Key.KEY_E) || this.interactionTag == null) {
			return;
		}
		const splittedText = this.interactionTag.split("_");

		if (splittedText[0] == "teleport") {
			if (splittedText[1] == "lobby") {
				Manager.changeScene(LobbyScene);
			} else {
				Manager.changeScene(GameScene, { sceneParams: [splittedText[1]] });
			}
		}
	}

	private playerMovement(): void {
		this.isMoving = false;
		if (this.keybinds.isDown(Key.KEY_W) || this.keybinds.isDown("ArrowUp")) {
			this.isMoving = true;
			this.y = this.y - this.speed;

			if (this.y < 0) {
				this.y = 0;
			}
			this.visuals.playState("WalkUp");
		}
		if (this.keybinds.isDown(Key.KEY_S) || this.keybinds.isDown("ArrowDown")) {
			this.isMoving = true;
			this.y = this.y + this.speed;
			if (this.y > this.mapLimits.height - this.height) {
				this.y = this.mapLimits.height - this.height;
			}
			this.visuals.playState("WalkDown");
		}
		if (this.keybinds.isDown(Key.KEY_A) || this.keybinds.isDown("ArrowLeft")) {
			this.isMoving = true;
			this.x = this.x - this.speed;

			if (this.x < 0) {
				this.x = 0;
			}
			this.visuals.playState("WalkLeft");
		}
		if (this.keybinds.isDown(Key.KEY_D) || this.keybinds.isDown("ArrowRight")) {
			this.isMoving = true;
			this.x = this.x + this.speed;
			if (this.x > this.mapLimits.width - this.width) {
				this.x = this.mapLimits.width - this.width;
			}
			this.visuals.playState("WalkRight");
		}
		if (!this.isMoving) {
			this.visuals.fstop();
		} else {
			this.visuals.play();
		}
	}

	/* public onPointerMove(event: PIXI.InteractionEvent):void {
		// Obtener la posición del mouse relativa al lienzo
		const mousePosition = event.data.getLocalPosition(app.stage);
	
		// Mostrar la posición del mouse en la consola
		console.log("Posición del mouse:", mousePosition.x, mousePosition.y);
	}
	
	// Escuchar el evento mousemove en el lienzo
	app.view.addEventListener('mousemove', onPointerMove); */
}
