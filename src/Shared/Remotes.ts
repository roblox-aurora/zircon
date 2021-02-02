import Net from "@rbxts/net";
import { RemoteId } from "../RemoteId";

const Remotes = Net.Definitions.Create({
	[RemoteId.StandardOutput]: Net.Definitions.Event<[], [output: string]>(),
	[RemoteId.StandardError]: Net.Definitions.Event<[], [output: string]>(),
	[RemoteId.DispatchToServer]: Net.Definitions.Event<[message: string]>([
		Net.Middleware.TypeChecking((value: unknown): value is string => typeIs(value, "string")),
	]),
	[RemoteId.GetPlayerOptions]: Net.Definitions.AsyncFunction<() => defined>(),
});
export = Remotes;
