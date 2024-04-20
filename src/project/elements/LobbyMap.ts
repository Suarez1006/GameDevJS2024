import { Assets, Container, Graphics, Text } from "pixi.js";
import type { JSONTileMap, TileLayer } from "../../engine/utils/TiledJSONSimplifier";
import { formatTiledJSON } from "../../engine/utils/TiledJSONSimplifier";
import type { Player } from "./Player";
import { addHitbox } from "../managers/Collisions";
import { InteractionBox } from "./InteractionBox";

class PlaceholderTile extends Graphics {
	constructor(color: number, alpha?: number) {
		super();
		this.beginFill(color, alpha);
		this.drawRect(0, 0, 30, 30);
		this.cullable = true;
	}
}

class PlaceholderDoor extends Container {
	public interactionBox: InteractionBox;
	private door: Graphics = new Graphics();
	constructor(color: number, infoText: string, width: number) {
		super();
		this.door.beginFill(color);
		this.door.drawRect(0, 0, width, 30);
		this.door.cullable = true;
		addHitbox({ object: this.door, tag: "Solid" });
		this.addChild(this.door);

		const txt: Text = new Text(infoText, { align: "center", fill: 0xffffff });
		txt.anchor.set(0.5);
		txt.position.set(this.width / 2, this.height / 2);
		this.door.addChild(txt);

		this.interactionBox = new InteractionBox({ x: 0, y: 30, width: width, height: 30 });
		this.addChild(this.interactionBox);
		// this.interactionBox.beginFill(0xff00ff, 0.25);
		// this.interactionBox.drawRect(0, 30, width, 30);
		// this.addChild(this.interactionBox);
	}
}

enum TileType {
	FLOOR = 0,
	WALL = 1,
	BARRIER = 2,
	SPAWN = 3,
	BOSS = 6,
	FIRSTMAP = 7,
	SECONDMAP = 8,
	THIRDMAP = 9,
	FOURTHMAP = 10,
}
export class LobbyMap extends Container {
	private startZone: { x: number; y: number };
	// private mapBg: Graphics = new Graphics();
	constructor(player: Player) {
		super();
		this.eventMode = "none";

		// this.mapBg.beginFill(0xbeced6);
		// this.mapBg.drawRect(0, 0, 1, 1);
		// // this.addChild(this.mapBg);

		const rawJSON = Assets.get("lobby");
		const formattedJson: JSONTileMap = formatTiledJSON(rawJSON);
		const firstLayer = formattedJson.layersRecord["Base"] as TileLayer;
		const data = firstLayer.data;
		// this.mapBg.width = formattedJson.width * formattedJson.tilewidth;
		// this.mapBg.height = formattedJson.height * formattedJson.tileheight;

		let tileIndex = 0;

		for (let yQuantity = 0; yQuantity < formattedJson.height; yQuantity++) {
			for (let xQuantity = 0; xQuantity < formattedJson.width; xQuantity++) {
				let tile: Container | Graphics;
				switch (data[tileIndex]) {
					case TileType.FLOOR:
						tile = new PlaceholderTile(0xbeced6);
						tile.zIndex = 1;
						break;
					case TileType.WALL:
						tile = new PlaceholderTile(0x7c8489);
						addHitbox({ object: tile, tag: "Solid" });
						tile.zIndex = 2;
						break;
					case TileType.BARRIER:
						tile = new PlaceholderTile(0xa28d55);
						addHitbox({ object: tile, tag: "Barrier" });
						tile.zIndex = 3;
						break;
					case TileType.SPAWN:
						tile = new PlaceholderTile(0xbeced6);
						this.startZone = { x: xQuantity * formattedJson.tilewidth, y: yQuantity * formattedJson.tileheight };
						tile.zIndex = 4;
						break;
					case TileType.BOSS:
						tile = new PlaceholderDoor(0xff0000, "BOSS", 60);
						tile.zIndex = 10;
						break;
					case TileType.FIRSTMAP:
						tile = new PlaceholderDoor(0x9e693b, "FIRST", 30);
						tile.zIndex = 20;
						break;
					case TileType.SECONDMAP:
						tile = new PlaceholderDoor(0x9e693b, "SECOND", 30);
						tile.zIndex = 20;
						break;
					case TileType.THIRDMAP:
						tile = new PlaceholderDoor(0x9e693b, "THIRD", 30);
						tile.zIndex = 20;
						break;
					case TileType.FOURTHMAP:
						tile = new PlaceholderDoor(0x9e693b, "FOURTH", 30);
						tile.zIndex = 20;
						break;
				}
				if (tile != null) {
					this.addChild(tile);
					tile.position.set(xQuantity * formattedJson.tilewidth, yQuantity * formattedJson.tileheight);
				}
				tileIndex++;
			}
		}
		this.sortChildren();

		this.addChild(player);
		player.mapLimits = { width: formattedJson.width * formattedJson.tilewidth, height: formattedJson.height * formattedJson.tileheight };
		player.position.set(this.startZone.x, this.startZone.y);
	}
}
