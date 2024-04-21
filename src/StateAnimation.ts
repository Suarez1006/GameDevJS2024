import { AnimatedSprite, Container, Texture } from "pixi.js";

export class StateAnimation extends Container {
	private states: Map<string, AnimatedSprite> = new Map();
	private currentState: AnimatedSprite = this.states.get("");
	private stop: boolean = false;

	public playState(stateName: string): void {
		this.removeChildren();
		this.currentState = this.states.get(stateName);
		if (this.currentState) {
			this.addChild(this.currentState);
		}
	}

	public addState(stateName: string, frames: Texture[] | string[], animationSpeed: number = 0.12, loop: boolean = true): void {
		const texArray: Texture[] = [];
		for (const tex of frames) {
			if (typeof tex == "string") {
				texArray.push(Texture.from(tex));
			} else {
				texArray.push(tex);
			}
		}

		const tempAnim: AnimatedSprite = new AnimatedSprite(texArray);
		tempAnim.animationSpeed = animationSpeed;
		tempAnim.loop = loop;
		tempAnim.play();
		this.states.set(stateName, tempAnim);
	}

	public update(frames: number): void {
		if (!this.stop) {
			for (const state of this.states.values()) {
				state.update(frames);
			}
		}
	}

	public fstop(): void {
		this.stop = true;
		this.currentState?.stop();
	}
	public play(): void {
		this.stop = false;
		this.currentState?.play();
	}
}
