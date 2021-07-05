import Log, { Logger } from "@rbxts/log";
import { LogConfiguration } from "@rbxts/log/out/Configuration";
import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import { ZrInstanceUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import Zircon from "@zircon";
import ZirconPrint from "BuiltIn/Print";
import { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
import { ZirconNamespaceBuilder } from "Class/ZirconNamespaceBuilder";
import delayAsync from "Client/BuiltInConsole/DelayAsync";

Log.SetLogger(
	Logger.configure()
		.WriteTo(Log.RobloxOutput())
		.WriteTo(Zircon.Log.Console())
		.EnrichWithProperty("Version", PKG_VERSION)
		.Create(),
);

Zircon.Server.Registry.RegisterFunction(
	new ZirconFunctionBuilder("kill").AddArguments("player?").Bind((context, player) => {
		const target = player ?? context.GetExecutor();
		target.Character?.BreakJoints();
		Log.Info("Killed {target}", target);
	}),
	[Zircon.Server.Registry.User],
);

Zircon.Server.Registry.RegisterFunction(
	new ZirconFunctionBuilder("print_message")
		.AddArguments("string")
		.Bind((context, message) => Log.Info("Zircon says {Message} from {Player}", message, context.GetExecutor())),
	[Zircon.Server.Registry.User],
);

Zircon.Server.Registry.RegisterNamespace(
	new ZirconNamespaceBuilder("example")
		.AddFunction(
			new ZirconFunctionBuilder("print").Bind((context, ...args) => {
				Log.Info("[Example print] " + args.map((a) => tostring(a)).join(" "));
			}),
		)
		.AddFunction(
			new ZirconFunctionBuilder("test").Bind((context) => {
				Log.Info("Test!");
			}),
		)
		.AddFunction(ZirconPrint)
		.Build(),
	[Zircon.Server.Registry.User],
);

Zircon.Server.Registry.RegisterFunction(
	new ZirconFunctionBuilder("print").Bind((context, ...args) => {
		Log.Info(args.map((a) => tostring(a)).join(" "));
	}),
	[Zircon.Server.Registry.User],
);

delayAsync(5).then(() => {
	Log.Verbose("A verbose message. Yes?");
	Log.Debug("A debug message, yes");
	Log.Info("Hello, {Test}! {Boolean} {Number} {Array}", "Test string", true, 10, [1, 2, 3, [4]]);
	Log.Warn("Warining {Lol}", "LOL!");
	Log.Error("ERROR LOL {Yes}", true);
	Log.Fatal("Fatal message here");
});

game.GetService("Players").PlayerAdded.Connect((player) => {
	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
});

for (const player of game.GetService("Players").GetPlayers()) {
	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
}
