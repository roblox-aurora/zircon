import Log, { Logger } from "@rbxts/log";
import { LogConfiguration } from "@rbxts/log/out/Configuration";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import { ZrInstanceUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import Zircon from "@zircon";
import ZirconPrint from "BuiltIn/Print";
import delayAsync from "Client/BuiltInConsole/DelayAsync";

Log.SetLogger(
	Logger.configure()
		.WriteTo(Zircon.Log.Console())
		.WriteTo((message) => print(message.Timestamp, message))
		.Enrich(Zircon.Log.ZirconTag)
		.EnrichWithProperty("Version", PKG_VERSION)
		.Create(),
);

Zircon.Server.Registry.RegisterFunction(ZirconPrint, [Zircon.Server.Registry.User]);

Zircon.Server.Registry.RegisterNamespace(
	"localplayer",
	{
		kill: new ZrLuauFunction((context) => {
			const player = context.getExecutor();
			if (player) {
				player.Character?.BreakJoints();
			}
		}),
	},
	[Zircon.Server.Registry.User],
);

Zircon.Server.Registry.RegisterZrLuauFunction(
	"spam",
	(context, count) => {
		// eslint-disable-next-line roblox-ts/lua-truthiness
		const message = context.getInput().toArray().join(" ") || "This is a test message";
		if (typeIs(count, "number")) {
			for (let i = 0; i < count; i++) {
				context.getOutput().write(message);
			}
		}
	},
	[Zircon.Server.Registry.User],
);

function callMe() {}

delayAsync(5).then(() => {
	Log.Default().Verbose("A verbose message. Yes?");
	Log.Debug("A debug message, yes");
	Log.Info("Hello, {Test}! {Boolean} {Number} {Array}", "Test string", true, 10, [1, 2, 3, [4]]);
	Log.Warn("Warining {Lol}", "LOL!");
	Log.Error("ERROR LOL {Yes}", true);
	Log.Default().Fatal("Fatal message here");
	Zircon.Log.Info("Test", "testing lol");
	Zircon.Log.Debug("test", "testing debug");
	Zircon.Log.Warning("TestWarning", "test warning lol");
	Zircon.Log.Error("TestError", "test error lol");
	Zircon.Log.Failure("TestWtf", "wtf lol");
});

game.GetService("Players").PlayerAdded.Connect((player) => {
	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
});

for (const player of game.GetService("Players").GetPlayers()) {
	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
}
