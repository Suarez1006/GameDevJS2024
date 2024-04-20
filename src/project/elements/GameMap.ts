import { Assets, Container, Graphics } from "pixi.js";
import type { JSONTileMap, TileLayer } from "../../engine/utils/TiledJSONSimplifier";
import { formatTiledJSON } from "../../engine/utils/TiledJSONSimplifier";
import type { Player } from "./Player";
import { addHitbox } from "../managers/Collisions";

class PlaceholderTile extends Graphics {
	constructor(color: number, alpha?: number) {
		super();
		this.beginFill(color, alpha);
		this.drawRect(0, 0, 30, 30);
		this.cullable = true;
	}
}
enum TileType {
	FLOOR = 0,
	WALL = 1,
	BARRIER = 2,
	SPAWN = 3,
}
export class GameMap extends Container {
	private startZone: { x: number; y: number };
	private mapBg: Graphics = new Graphics();
	constructor(mapName: string, player: Player) {
		super();
		this.eventMode = "none";

		this.mapBg.beginFill(0xbeced6);
		this.mapBg.drawRect(0, 0, 1, 1);
		this.addChild(this.mapBg);

		const rawJSON = Assets.get(mapName);
		const formattedJson: JSONTileMap = formatTiledJSON(rawJSON);
		const firstLayer = formattedJson.layersRecord["Base"] as TileLayer;
		const data = firstLayer.data;
		this.mapBg.width = formattedJson.width * formattedJson.tilewidth;
		this.mapBg.height = formattedJson.height * formattedJson.tileheight;

		let tileIndex = 0;

		for (let yQuantity = 0; yQuantity < formattedJson.height; yQuantity++) {
			for (let xQuantity = 0; xQuantity < formattedJson.width; xQuantity++) {
				let tile: PlaceholderTile;
				switch (data[tileIndex]) {
					case TileType.FLOOR:
						tile = new PlaceholderTile(0xbeced6);
						break;
					case TileType.WALL:
						tile = new PlaceholderTile(0x7c8489);
						addHitbox({ object: tile, tag: "Solid" });
						break;
					case TileType.BARRIER:
						tile = new PlaceholderTile(0xa28d55);
						addHitbox({ object: tile, tag: "Barrier" });
						break;
					case TileType.SPAWN:
						this.startZone = { x: xQuantity * formattedJson.tilewidth, y: yQuantity * formattedJson.tileheight };
						break;
				}
				if (tile != null) {
					this.addChild(tile);
					tile.position.set(xQuantity * formattedJson.tilewidth, yQuantity * formattedJson.tileheight);
				}
				tileIndex++;
			}
		}

		this.addChild(player);
		player.mapLimits = { width: formattedJson.width * formattedJson.tilewidth, height: formattedJson.height * formattedJson.tileheight };
		player.position.set(this.startZone.x, this.startZone.y);
	}
}
