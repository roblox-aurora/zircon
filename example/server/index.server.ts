import Log, { Logger } from "@rbxts/log";
import { Workspace } from "@rbxts/services";
import Zircon, { ZirconConfigurationBuilder, ZirconDefaultGroup, ZirconServer } from "@zircon";
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
	Log.Warn("Warining {Lol}", "LOL!");

	Log.Error("ERROR LOL {Yes}", true);
	Log.Fatal("Fatal message here");
});

ZirconServer.Registry.Init(
	new ZirconConfigurationBuilder()
		.CreateDefaultCreatorGroup()
		.CreateDefaultUserGroup()
		.CreateDefaultAdminGroup()
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
					new ZirconFunctionBuilder("with_varadic")
						.AddArgument("string")
						.AddArgument("player")
						.AddArgument("number?")
						.AddVariadicArgument("object")
						.Bind(() => {}),
				)
				.Build(),
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
