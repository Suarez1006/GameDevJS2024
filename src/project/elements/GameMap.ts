import type { IPointData } from "pixi.js";
import { Sprite } from "pixi.js";
import { Assets, Container, Graphics } from "pixi.js";
import type { JSONTileMap, TileLayer } from "../../engine/utils/TiledJSONSimplifier";
import { formatTiledJSON } from "../../engine/utils/TiledJSONSimplifier";
import type { Player } from "./Player";
import { addHitbox } from "../managers/Collisions";
import { InteractionBox } from "./InteractionBox";
import { DoorSystem } from "../managers/DoorSystem";

export type AreaInfo = { areaNumber: number; tiles: IPointData[] };

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
	END = 4,
	DOOR = 5,
}
export class GameMap extends Container {
	private startZone: { x: number; y: number };
	private graphBg: Graphics = new Graphics();
	private mapBg: Sprite;

	constructor(mapName: string, player: Player) {
		super();
		this.eventMode = "none";

		const rawJSON = Assets.get(mapName);
		const formattedJson: JSONTileMap = formatTiledJSON(rawJSON);
		const baseLayer = formattedJson.layersRecord["Base"] as TileLayer;
		const areasData = (formattedJson.layersRecord["Areas"] as TileLayer).data;
		const data = baseLayer.data;
		this.graphBg.width = formattedJson.width * formattedJson.tilewidth;
		this.graphBg.height = formattedJson.height * formattedJson.tileheight;

		this.mapBg = Sprite.from(`${mapName}IMG`);

		if (this.mapBg) {
			this.addChild(this.mapBg);
		} else {
			this.graphBg.beginFill(0xbeced6);
			this.graphBg.drawRect(0, 0, 1, 1);
			this.addChild(this.graphBg);
		}

		let tileIndex = 0;

		const areasInfo: AreaInfo[] = [];
		const doorsPositions: Array<IPointData> = new Array<IPointData>();

		for (let yQuantity = 0; yQuantity < formattedJson.height; yQuantity++) {
			for (let xQuantity = 0; xQuantity < formattedJson.width; xQuantity++) {
				let tile: PlaceholderTile;
				const tileX = xQuantity * formattedJson.tilewidth,
					tileY = yQuantity * formattedJson.tileheight;
				switch (data[tileIndex]) {
					case TileType.FLOOR:
						break;
						tile = new PlaceholderTile(0xbeced6);
					case TileType.WALL:
						tile = new PlaceholderTile(0x7c8489, 0.5);
						addHitbox({ object: tile, tag: "Solid" });
						break;
					case TileType.BARRIER:
						tile = new PlaceholderTile(0xa28d55, 0.5);
						addHitbox({ object: tile, tag: "Barrier" });
						break;
					case TileType.SPAWN:
						this.startZone = { x: tileX, y: tileY };
						break;
					case TileType.END:
						const end = new InteractionBox({
							x: tileX,
							y: tileY,
							width: formattedJson.tileheight,
							height: formattedJson.tileheight,
							interactionTag: "teleport_lobby",
						});
						this.addChild(end);
						break;
					case TileType.DOOR:
						doorsPositions.push({ x: tileX, y: tileY });
						break;
				}
				if (tile != null) {
					this.addChild(tile);
					tile.position.set(tileX, tileY);
				}

				const areaIndex = areasData[tileIndex];
				if (areaIndex != 0) {
					const tileCoords: IPointData = { x: tileX, y: tileY };
					const areaInfo = areasInfo.find((item) => {
						return item.areaNumber == areaIndex;
					});

					if (areaInfo) {
						areaInfo.tiles.push(tileCoords);
					} else {
						areasInfo.push({ areaNumber: areaIndex, tiles: [tileCoords] });
					}
				}
				tileIndex++;
			}
		}

		new DoorSystem(this, doorsPositions, areasInfo);

		this.addChild(player);
		player.mapLimits = { width: formattedJson.width * formattedJson.tilewidth, height: formattedJson.height * formattedJson.tileheight };
		player.position.set(this.startZone.x, this.startZone.y);
	}
}
