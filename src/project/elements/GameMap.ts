import { Assets, Container, Graphics } from "pixi.js";
import type { JSONTileMap, TileLayer } from "../../engine/utils/TiledJSONSimplifier";
import { formatTiledJSON } from "../../engine/utils/TiledJSONSimplifier";

export class GameMap extends Container {
	constructor(mapName: string) {
		super();
		this.eventMode = "none";

		const rawJSON = Assets.get(mapName);
		const formattedJson: JSONTileMap = formatTiledJSON(rawJSON);
		const firstLayer = formattedJson.layersRecord["Capa de patrones 1"] as TileLayer;
		const data = firstLayer.data;

		let tileIndex = 0;

		for (let yQuantity = 0; yQuantity < formattedJson.height; yQuantity++) {
			for (let xQuantity = 0; xQuantity < formattedJson.width; xQuantity++) {
				if (data[tileIndex] == 0) {
					tileIndex++;
					continue;
				}
				console.log("create", tileIndex);

				const tile = new Graphics();
				tile.beginFill(0xff00ff);
				tile.drawRect(0, 0, 1, 1);
				tile.endFill();
				this.addChild(tile);

				tile.cullable = true;
				tile.width = 32;
				tile.height = 32;

				tile.position.set(xQuantity * 32, yQuantity * 32);

				tileIndex++;
			}
		}
	}
}
