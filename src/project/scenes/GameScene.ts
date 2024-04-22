import { Graphics } from "pixi.js";
import { PixiScene } from "../../engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";
import { GameMap } from "../elements/GameMap";
import { Player } from "../elements/Player";
import { Collisions } from "../managers/Collisions";

export class GameScene extends PixiScene {
	public static readonly BUNDLES = [""];

	private bg: Graphics = new Graphics();

	private player: Player;

	private map: GameMap;
	constructor(mapName: string) {
		super();

		this.bg.beginFill(0x0e0e0e);
		this.bg.drawRect(0, 0, 1, 1);
		this.addChild(this.bg);

		this.player = new Player();
		this.map = new GameMap(mapName, this.player);
		this.addChild(this.map);
	}

	public override update(_dt: number): void {
		this.player.update();
		Collisions.getInstance().update();
	}

	public override onResize(_newW: number, _newH: number): void {
		this.bg.width = _newW;
		this.bg.height = _newH;
		ScaleHelper.setScaleRelativeToScreen(this.map, _newW, _newH, 1, 1);
		this.map.position.set(_newW / 2 - this.map.width / 2, _newH / 2 - this.map.height / 2);
	}
}
