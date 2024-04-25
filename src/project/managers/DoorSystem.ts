import type { DisplayObject, IPointData } from "pixi.js";
import { Graphics } from "pixi.js";
import type { AreaInfo, GameMap } from "../elements/GameMap";
import { InteractionBox } from "../elements/InteractionBox";
import { addHitbox, Collisions, removeHitbox } from "./Collisions";
import { Keyboard } from "../../engine/input/Keyboard";
import { Key } from "../../engine/input/Key";

type DoorData = { visual: Graphics; areas: Array<number> };
export class DoorSystem {
	private map: GameMap;
	private unlockedAreas: Array<number> = [];
	private doorsByArea: Record<number, Array<DoorData>> = {};
	private closedArea: number = null;
	private debugKeybinds: Keyboard;
	constructor(map: GameMap, doorsPositions: Array<IPointData>, areasInfo: AreaInfo[]) {
		this.map = map;
		this.debugKeybinds = new Keyboard();
		this.debugKeybinds.pressed.on(Key.KEY_Z, () => {
			if (this.closedArea == null) {
				return;
			}
			this.unlockArea();
		});
		const tileSize = 30;

		for (const doorPos of doorsPositions) {
			const doorVisual = new Graphics();
			doorVisual.beginFill(0x000000, 0.9);
			doorVisual.drawRect(0, 0, 30, 30);
			doorVisual.position.set(doorPos.x, doorPos.y);
			const doorData: DoorData = { visual: doorVisual, areas: [] };
			for (const areaInfo of areasInfo) {
				const doorLeft = areaInfo.tiles.find((tile) => {
					return tile.x == doorPos.x - tileSize && tile.y == doorPos.y;
				});
				const doorRight = areaInfo.tiles.find((tile) => {
					return tile.x == doorPos.x + tileSize && tile.y == doorPos.y;
				});
				const doorTop = areaInfo.tiles.find((tile) => {
					return tile.y == doorPos.y - tileSize && tile.x == doorPos.x;
				});
				const doorBottom = areaInfo.tiles.find((tile) => {
					return tile.y == doorPos.y + tileSize && tile.x == doorPos.x;
				});

				if (doorLeft || doorRight || doorTop || doorBottom) {
					doorData.areas.push(areaInfo.areaNumber);
					if (this.doorsByArea[areaInfo.areaNumber] == undefined) {
						this.doorsByArea[areaInfo.areaNumber] = [doorData];
					} else {
						this.doorsByArea[areaInfo.areaNumber].push(doorData);
					}

					const doorExit: IPointData = { x: 0, y: 0 };
					doorExit.x = doorLeft?.x ?? doorRight?.x ?? doorPos.x;
					doorExit.y = doorTop?.y ?? doorBottom?.y ?? doorPos.y;

					const leftTrigger = { x: doorExit.x - 30, y: doorExit.y };
					const rightTrigger = { x: doorExit.x + 30, y: doorExit.y };
					const topTrigger = { x: doorExit.x, y: doorExit.y - 30 };
					const bottomTrigger = { x: doorExit.x, y: doorExit.y + 30 };

					if (leftTrigger.x != doorPos.x || leftTrigger.y != doorPos.y) {
						this.addDoorTrigger(leftTrigger, areaInfo.areaNumber);
					}
					if (rightTrigger.x != doorPos.x || rightTrigger.y != doorPos.y) {
						this.addDoorTrigger(rightTrigger, areaInfo.areaNumber);
					}
					if (topTrigger.x != doorPos.x || topTrigger.y != doorPos.y) {
						this.addDoorTrigger(topTrigger, areaInfo.areaNumber);
					}
					if (bottomTrigger.x != doorPos.x || bottomTrigger.y != doorPos.y) {
						this.addDoorTrigger(bottomTrigger, areaInfo.areaNumber);
					}
				}
			}
		}

		Collisions.getInstance().collideEmitter.on("Interaction", (data: { objA: DisplayObject; objB: DisplayObject }) => {
			let interactable: InteractionBox;
			if (data.objA.name == "Player") {
				interactable = data.objB as InteractionBox;
			} else {
				interactable = data.objA as InteractionBox;
			}

			const splittedText = interactable.interactionTag.split("_");

			if (splittedText[0] != "door") {
				return;
			}

			const triggeredArea: number = Number(splittedText[1]);

			if (this.unlockedAreas.includes(triggeredArea)) {
				return;
			}
			this.closeArea(triggeredArea);
		});
	}

	private addDoorTrigger(triggerPos: IPointData, areaNumber: number): void {
		const doorInteraction = new InteractionBox({
			x: triggerPos.x,
			y: triggerPos.y,
			height: 30,
			width: 30,
			interactionTag: `door_${areaNumber}`,
		});
		this.map.addChild(doorInteraction);
		addHitbox({ object: doorInteraction, tag: "Interaction" });
	}

	private closeArea(areaNumber: number): void {
		if (this.closedArea != null) {
			return;
		}
		this.closedArea = areaNumber;
		const doors = this.doorsByArea[areaNumber];
		for (const door of doors) {
			this.map.addChild(door.visual);
			addHitbox({ object: door.visual, tag: "Solid" });
		}
		console.log(doors);
	}

	public unlockArea(): void {
		const doors = this.doorsByArea[this.closedArea];
		for (const door of doors) {
			this.map.removeChild(door.visual);
			removeHitbox(door.visual);
		}

		this.unlockedAreas.push(this.closedArea);
		this.closedArea = null;
	}
}
