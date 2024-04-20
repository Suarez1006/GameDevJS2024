import { Graphics } from "pixi.js";
import { Manager } from "../..";
import { Key } from "../../engine/input/Key";
import { Keyboard } from "../../engine/input/Keyboard";
import { PixiScene } from "../../engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";
import { GameMap } from "../elements/GameMap";
import { Player } from "../elements/Player";
import { Collisions } from "../managers/Collisions";

export class GameScene extends PixiScene {
	public static readonly BUNDLES = ["jsons"];

	private bg: Graphics = new Graphics();
	private keybinds: Keyboard;

	private player: Player;
	private playerSpeed: number = 3;

	private map: GameMap;
	constructor() {
		super();
		this.keybinds = new Keyboard();

		this.bg.beginFill(0x0e0e0e);
		this.bg.drawRect(0, 0, 1, 1);
		this.addChild(this.bg);

		this.player = new Player();
		this.map = new GameMap("map1", this.player);
		this.addChild(this.map);
	}

	public override update(_dt: number): void {
		this.playerMovement();
		Collisions.getInstance().update();
	}

	public override onResize(_newW: number, _newH: number): void {
		this.bg.width = _newW;
		this.bg.height = _newH;
		ScaleHelper.setScaleRelativeToScreen(this.map, _newW, _newH, 1, 1);
		this.map.position.set(_newW / 2 - this.map.width / 2, _newH / 2 - this.map.height / 2);
	}

	private playerMovement(): void {
		if (this.keybinds.isDown(Key.KEY_W) || this.keybinds.isDown("ArrowUp")) {
			this.player.y = this.player.y - this.playerSpeed;

			if (this.player.y < 0) {
				this.player.y = 0;
			}
		}
		if (this.keybinds.isDown(Key.KEY_S) || this.keybinds.isDown("ArrowDown")) {
			this.player.y = this.player.y + this.playerSpeed;
			if (this.player.y > Manager.height - this.player.height) {
				this.player.y = Manager.height - this.player.height;
			}
		}
		if (this.keybinds.isDown(Key.KEY_A) || this.keybinds.isDown("ArrowLeft")) {
			this.player.x = this.player.x - this.playerSpeed;

			if (this.player.x < 0) {
				this.player.x = 0;
			}
		}
		if (this.keybinds.isDown(Key.KEY_D) || this.keybinds.isDown("ArrowRight")) {
			this.player.x = this.player.x + this.playerSpeed;
			if (this.player.x > Manager.width - this.player.width) {
				this.player.x = Manager.width - this.player.width;
			}
		}
	}
}
