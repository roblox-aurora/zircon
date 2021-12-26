import { ZrInstanceUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { OptionalValidator } from "./OptionalValidator";
import { StatefulZirconValidator } from "../StatefulZirconValidator";

export class ZirconFuzzyPlayerValidator extends StatefulZirconValidator<
	string | number | ZrInstanceUserdata<Player>,
	Player
> {
	public playerRef?: Player;

	public constructor() {
		super("Player");
	}

	public Validate(value: unknown): value is string | number | ZrInstanceUserdata<Player> {
		if (typeIs(value, "string")) {
			const existingPlayer = game
				.GetService("Players")
				.GetPlayers()
				.find((player) => player.Name.sub(1, value.size()).lower() === value.lower());
			if (existingPlayer) {
				this.playerRef = existingPlayer;
				return true;
			}
		} else if (typeIs(value, "number")) {
			const player = game.GetService("Players").GetPlayerByUserId(value);
			if (player) {
				this.playerRef = player;
				return true;
			}
		} else if (value instanceof ZrInstanceUserdata && value.isA("Player")) {
			this.playerRef = value.value();
			return true;
		}

		return false;
	}

	public Transform() {
		assert(this.playerRef, "Transform called before Validate, perhaps?");
		return this.playerRef;
	}
}

export const ZirconFuzzyPlayer = new ZirconFuzzyPlayerValidator();
export const OptionalZirconFuzzyPlayer = new OptionalValidator(ZirconFuzzyPlayer);
