import { Manager } from "../..";
import { Key } from "../../engine/input/Key";
import { Keyboard } from "../../engine/input/Keyboard";
import { PixiScene } from "../../engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";
import { GameMap } from "../elements/GameMap";
import { Player } from "../elements/Player";

export class GameScene extends PixiScene {
	public static readonly BUNDLES = ["jsons"];

	private keybinds: Keyboard;

	private player: Player;
	private playerSpeed: number = 10;

	private map: GameMap;
	constructor() {
		super();
		this.keybinds = new Keyboard();

		this.map = new GameMap("map1");
		this.addChild(this.map);

		this.player = new Player();
		this.map.addChild(this.player);
	}

	public override update(_dt: number): void {
		this.playerMovement();
	}

	public override onResize(_newW: number, _newH: number): void {
		ScaleHelper.setScaleRelativeToScreen(this.map, _newW, _newH, 1, 1);
		this.map.position.set(_newW / 2 - this.map.width / 2, _newH / 2 - this.map.height / 2);
	}

	private playerMovement(): void {
		if (this.keybinds.isDown(Key.KEY_W) || this.keybinds.isDown("ArrowUp")) {
			this.player.y = this.player.y - this.playerSpeed;

			if (this.player.y < 0) {
				this.player.y = 0;
			}
			console.log(this.player.y);
		}
		if (this.keybinds.isDown(Key.KEY_S) || this.keybinds.isDown("ArrowDown")) {
			this.player.y = this.player.y + this.playerSpeed;
			if (this.player.y > Manager.height - this.player.height) {
				this.player.y = Manager.height - this.player.height;
			}
		}
	}
}