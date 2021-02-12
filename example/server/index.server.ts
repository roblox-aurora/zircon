import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import Zircon from "@zircon";
import delayAsync from "Client/BuiltInConsole/DelayAsync";

Zircon.Server.Registry.RegisterZrLuauFunction(
	"print",
	(context, ...args: ZrValue[]) => {
		const printArgs = args.map((arg) => tostring(arg)).join(" ");
		Zircon.LogDebug("print", `Called print [${printArgs}]`);
		context.pushOutput(printArgs);
		print(printArgs);
	},
	[Zircon.Server.Registry.User],
);

delayAsync(10).then(() => {
	Zircon.LogInfo("Test", "testing lol");
	Zircon.LogDebug("test", "testing debug");
	Zircon.LogWarning("TestWarning", "test warning lol");
	Zircon.LogError("TestError", "test error lol");
	Zircon.LogWtf("TestWtf", "wtf lol");
});

game.GetService("Players").PlayerAdded.Connect((player) => {
	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
});

for (const player of game.GetService("Players").GetPlayers()) {
	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
}
