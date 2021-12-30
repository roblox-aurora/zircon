import Log, { Logger } from "@rbxts/log";
import { Workspace } from "@rbxts/services";
import Zircon, { ZirconConfigurationBuilder, ZirconDefaultGroup, ZirconServer } from "@zircon";
import ZirconPrint from "BuiltIn/Print";
import { ZirconEnumBuilder } from "Class/ZirconEnumBuilder";
import { ZirconFunctionBuilder } from "Class/ZirconFunctionBuilder";
import { ZirconNamespaceBuilder } from "Class/ZirconNamespaceBuilder";
import { $print } from "rbxts-transform-debug";

Log.SetLogger(
	Logger.configure()
		.WriteTo(Log.RobloxOutput())
		.WriteTo(Zircon.Log.Console())
		.EnrichWithProperty("Version", PKG_VERSION)
		.Create(),
);

const TestEnum = new ZirconEnumBuilder("TestEnum").FromArray(["Value1", "Value2"]);

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
	Log.Warn("Warning {Lol}", "LOL!");

	Log.Error("ERROR LOL {Yes}", true);
	Log.Fatal("Fatal message here");
});

ZirconServer.Registry.Init(
	new ZirconConfigurationBuilder()
		.CreateDefaultCreatorGroup()
		.CreateDefaultUserGroup()
		.CreateDefaultAdminGroup()
		.AddFunction(
			new ZirconFunctionBuilder("ping").AddArgument("string?").Bind((context, response) => {
				if (response !== undefined) {
					context.LogInfo("Pong! with {Argument}", response);
				} else {
					context.LogInfo("Pong!");
				}
			}),
			["User"],
		)
		.AddFunction(
			new ZirconFunctionBuilder("print").Bind((context, ...args) => {
				Log.Info(args.map((a) => tostring(a)).join(" "));
			}),
			["User"],
		)
		.AddEnum(TestEnum, [ZirconDefaultGroup.User])
		.AddNamespace(
			new ZirconNamespaceBuilder("example")
				.AddHelpFunction()
				.AddFunction(
					new ZirconFunctionBuilder("print_b").AddVariadicArgument("string").Bind((context, ...args) => {
						Log.Info("[Example print] " + args.map((a) => tostring(a)).join(" "));
					}),
				)
				.AddFunction(
					new ZirconFunctionBuilder("test").Bind((context) => {
						Log.Info("Test!");
					}),
				)
				.AddFunction(ZirconPrint)
				.AddFunction(
					new ZirconFunctionBuilder("with_variadic")
						.AddArgument("string")
						.AddArgument("player")
						.AddArgument("number?")
						.AddVariadicArgument("object")
						.Bind(() => {}),
				)
				.AddFunction(
					new ZirconFunctionBuilder("with_unions")
						.AddVariadicArgumentUnion(["string", "number", "range"])
						.Bind((context, ...strOrNum) => {
							context.LogInfo("Got a {$Value}", strOrNum);
						}),
				)
				.Build(),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("range_test").AddArgument("range").Bind((_, range) => {
				Log.Info("Got given a range with {Min} -> {Max}", range.GetMin(), range.GetMax());
			}),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("unknown_test").AddArgument("unknown").Bind((_, value) => {
				Log.Info("Got given an unknown value: {Value}", tostring(value));
			}),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("defined_test").AddArgument("defined").Bind((_, value) => {
				Log.Info("Got given a defined value: {Value}", value);
			}),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("players_test").AddArgument("players").Bind((_, value) => {
				Log.Info("Got given players: {Players}", value);
			}),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("enum_test").AddArgument("ZrEnum").Bind((_, value) => {
				Log.Info(
					"Got given enum {Enum} with members {EnumMembers}",
					value.getEnumName(),
					value.getItems().map((v) => v.getName()),
				);
			}),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("print_message")
				.AddArgument("string")
				.Bind((context, message) =>
					Log.Info("Zircon says {Message} from {Player}", message, context.GetExecutor()),
				),
			[ZirconDefaultGroup.User],
		)
		.AddFunction(
			new ZirconFunctionBuilder("test_enum").AddArgument(TestEnum).Bind((context, value) => {
				$print("call to test_enum", context, value);
				Log.Info("{Item}", value.getName());
				value.match({
					Value2: () => {
						Log.Info("Got given enum item 2 (member)");
					},
					Value1: () => {
						Log.Info("Got given enum item 1 (member)");
					},
				});
				TestEnum.match(value, {
					Value1: () => {
						Log.Info("Got given enum item 1 (parent)");
					},
					Value2: () => {
						Log.Info("Got given enum item 2 (parent)");
					},
					_: () => {
						Log.Info("Anything else");
					},
				});
			}),
			[ZirconDefaultGroup.User],
		)
		.Build(),
);

ZirconServer.Registry.RegisterFunction(
	new ZirconFunctionBuilder("kill")
		.AddArgument("player?")
		.AddDescription("testing lol")
		.Bind((context, player) => {
			const target = player ?? context.GetExecutor();
			target.Character?.BreakJoints();
			Log.Info("Killed {target}", target);
		}),
	[ZirconDefaultGroup.User],
);
