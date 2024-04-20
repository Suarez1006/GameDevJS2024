import type { DisplayObject, Rectangle } from "pixi.js";
import { utils } from "pixi.js";

export function addHitbox(params: { object: DisplayObject; tag: ColliderTag; customHitbox?: Rectangle }): void {
	Collisions.getInstance().addHitbox(params);
}

type ColliderTag = "Solid" | "Barrier" | "Collectable" | "Bullet" | "Character";
type HitboxPair = { hitboxA: DisplayObject; hitboxB: DisplayObject };
type Hitbox2D = { tag: ColliderTag; reference: DisplayObject };

export class Collisions {
	private objects: Array<Hitbox2D> = [];

	public collideEmitter: utils.EventEmitter = new utils.EventEmitter();

	private static instance: Collisions;
	private constructor() {}

	public static getInstance(): Collisions {
		if (Collisions.instance == undefined) {
			Collisions.instance = new Collisions();
		}

		return Collisions.instance;
	}

	public update(): void {
		this.checkCollisions();
	}

	public addHitbox(params: { object: DisplayObject; tag: ColliderTag; customHitbox?: Rectangle }): void {
		this.objects.push({ tag: params.tag, reference: params.object }); // rectangle: params.customHitbox ?? params.object.getBounds(),
	}

	public removeHitbox(object: DisplayObject): void {
		this.objects = this.objects.filter((hitbox) => hitbox.reference !== object);
	}

	private checkCollisions(): void {
		const checkedPairs = new Set<HitboxPair>();

		for (let i = 0; i < this.objects.length; i++) {
			const hitboxA = this.objects[i];
			const boundsA = hitboxA.reference.getBounds();
			for (let j = i + 1; j < this.objects.length; j++) {
				const hitboxB = this.objects[j];
				const boundsB = hitboxB.reference.getBounds();
				const pairId = this.getPairId(hitboxA.reference, hitboxB.reference);

				if (checkedPairs.has(pairId)) {
					continue;
				}
				checkedPairs.add(pairId);

				if (boundsA.intersects(boundsB)) {
					this.resolveByTags(hitboxA, hitboxB);
				}
			}
		}
	}

	private resolveByTags(hitboxA: Hitbox2D, hitboxB: Hitbox2D): void {
		const tagA = hitboxA.tag;
		const tagB = hitboxB.tag;

		if (tagA == "Character" && tagB == "Character") {
			this.resolveCharactersCollision(hitboxA.reference, hitboxB.reference);
		}

		if ((tagA == "Character" && tagB == "Solid") || (tagB == "Character" && tagA == "Solid")) {
			this.resolveCharacterSolidCollision(hitboxA, hitboxB);
		}

		if ((tagA == "Character" && tagB == "Barrier") || (tagB == "Character" && tagA == "Barrier")) {
			this.resolveCharacterSolidCollision(hitboxA, hitboxB);
		}
	}

	private resolveCharacterSolidCollision(hitboxA: Hitbox2D, hitboxB: Hitbox2D): void {
		let character;
		let solidObj;
		if (hitboxA.tag == "Character") {
			character = hitboxA.reference;
			solidObj = hitboxB.reference;
		} else {
			character = hitboxB.reference;
			solidObj = hitboxA.reference;
		}

		const solidBounds = solidObj.getBounds();
		const charBounds = character.getBounds();

		let correctionX: number = charBounds.x;
		let correctionY: number = charBounds.y;

		let side: string = null;
		const topSeparation = Math.abs(solidBounds.top - charBounds.bottom);
		const bottomSeparation = Math.abs(solidBounds.bottom - charBounds.top);
		const leftSeparation = Math.abs(solidBounds.left - charBounds.right);
		const rightSeparation = Math.abs(solidBounds.right - charBounds.left);

		if (topSeparation < bottomSeparation && topSeparation < leftSeparation && topSeparation < rightSeparation) {
			side = "top";
		} else if (bottomSeparation < topSeparation && bottomSeparation < leftSeparation && bottomSeparation < rightSeparation) {
			side = "bottom";
		} else if (leftSeparation < topSeparation && leftSeparation < bottomSeparation && leftSeparation < rightSeparation) {
			side = "left";
		} else if (rightSeparation < topSeparation && rightSeparation < bottomSeparation && rightSeparation < leftSeparation) {
			side = "right";
		}
		switch (side) {
			case "top":
				correctionY = solidBounds.top - charBounds.height;
				break;
			case "bottom":
				correctionY = solidBounds.bottom;
				break;
			case "left":
				correctionX = solidBounds.left - charBounds.width;
				break;
			case "right":
				correctionX = solidBounds.right;
				break;
		}

		const localCorrection = character.parent.toLocal({ x: correctionX, y: correctionY });
		character.position.set(localCorrection.x, localCorrection.y);
	}

	private resolveCharactersCollision(objA: DisplayObject, objB: DisplayObject): void {
		const boundsA = objA.getBounds();
		const boundsB = objB.getBounds();

		const overlapX = boundsA.x + boundsA.width - boundsB.x;
		const overlapY = boundsA.y + boundsA.height - boundsB.y;

		if (Math.abs(overlapX) < Math.abs(overlapY)) {
			const correctionX = overlapX / 2;
			objA.x -= correctionX;
			objB.x += correctionX;
		} else {
			const correctionY = overlapY / 2;
			objA.y -= correctionY;
			objB.y += correctionY;
		}
	}

	private getPairId(objA: DisplayObject, objB: DisplayObject): HitboxPair {
		return { hitboxA: objA, hitboxB: objB };
	}
}
