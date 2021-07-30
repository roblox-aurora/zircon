import Log, { Logger } from "@rbxts/log";
import { Workspace } from "@rbxts/services";
import Zircon, { ZirconServer } from "@zircon";
import ZirconPrint from "BuiltIn/Print";
import { ZirconEnumBuilder } from "Class/ZirconEnumBuilder";
import { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
import { ZirconNamespaceBuilder } from "Class/ZirconNamespaceBuilder";

Log.SetLogger(
	Logger.configure()
		.WriteTo(Log.RobloxOutput())
		.WriteTo(Zircon.Log.Console())
		.EnrichWithProperty("Version", PKG_VERSION)
		.Create(),
);

enum ExistingEnumType {
	EnumA,
	EnumB,
}

const TestEnum = ZirconServer.Registry.RegisterEnumFromArray(
	"TestEnum",
	["Value1", "Value2"],
	[ZirconServer.Registry.User],
);

const ExistingEnum = ZirconServer.Registry.RegisterEnum(new ZirconEnumBuilder("test").FromEnum(ExistingEnumType), [
	ZirconServer.Registry.User,
]);

ZirconServer.Registry.RegisterFunction(
	new ZirconFunctionBuilder("kill")
		.AddArguments("player?")
		.AddDescription("testing lol")
		.Bind((context, player) => {
			const target = player ?? context.GetExecutor();
			target.Character?.BreakJoints();
			Log.Info("Killed {target}", target);
		}),
	[ZirconServer.Registry.User],
);

ZirconServer.Registry.RegisterFunction(
	new ZirconFunctionBuilder("test_enum").AddArguments(TestEnum).Bind((context, value) => {
		value.Match({
			Value2: () => {
				Log.Info("Got given enum item 2 (member)");
			},
			Value1: () => {
				Log.Info("Got given enum item 1 (member)");
			},
		});
		TestEnum.Match(value, {
			Value1: () => {
				Log.Info("Got given enum item 1 (parent)");
			},
			Value2: () => {
				Log.Info("Got given enum item 2 (parent)");
			},
		});
	}),
	[ZirconServer.Registry.User],
);

ZirconServer.Registry.RegisterFunction(
	new ZirconFunctionBuilder("test_enum2").AddArguments(ExistingEnum.GetMemberType()).Bind((context, value) => {
		Log.Info("Got {NumberValue} ({StringValue})", ExistingEnumType[value.GetName()], value.GetName());
	}),
	[ZirconServer.Registry.User],
);

ZirconServer.Registry.RegisterFunction(
	new ZirconFunctionBuilder("print_message")
		.AddArguments("string")
		.Bind((context, message) => Log.Info("Zircon says {Message} from {Player}", message, context.GetExecutor())),
	[ZirconServer.Registry.User],
);

ZirconServer.Registry.RegisterNamespace(
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
	[ZirconServer.Registry.User],
);

ZirconServer.Registry.RegisterFunction(
	new ZirconFunctionBuilder("print").Bind((context, ...args) => {
		Log.Info(args.map((a) => tostring(a)).join(" "));
	}),
	[ZirconServer.Registry.User],
);

class Example {
	private _logger = Log.ForContext(Example);
	public constructor() {}
	public example() {
		this._logger.Info("Testing from class!");
		this._logger.Warn("Warning from class!");
	}
}

Promise.delay(5).then(() => {
	const testLogger = Log.ForScript();

	testLogger.Verbose("A verbose message. Yes?");
	testLogger.Info("Breaking <0> RichText Fix");
	testLogger.Info("Another test <font>Test</font>");

	new Example().example();

	Log.ForContext(Workspace).Info("Using workspace");

	Log.Debug("A debug message, yes");
	Log.Info("Hello, {Test}! {Boolean} {Number} {Array}", "Test string", true, 10, [1, 2, 3, [4]]);
	Log.Warn("Warining {Lol}", "LOL!");

	Log.Error("ERROR LOL {Yes}", true);
	Log.Fatal("Fatal message here");
});

// game.GetService("Players").PlayerAdded.Connect((player) => {
// 	ZirconServer.Registry.AddPlayerToGroups(player, ["creator"]);
// });

// for (const player of game.GetService("Players").GetPlayers()) {
// 	Zircon.Server.Registry.AddPlayerToGroups(player, ["creator"]);
// }
