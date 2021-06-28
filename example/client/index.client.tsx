import Roact from "@rbxts/roact";
import Zircon from "@zircon";
import ZirconClient from "./Client";
import delayAsync from "./Client/BuiltInConsole/DelayAsync";
import ZirconDockedConsole from "./Client/BuiltInConsole/UI/DockedConsole";
import { BaseTheme, makeTheme } from "./Client/UIKit/ThemeContext";
import { Players } from "@rbxts/services";
import Log, { Logger } from "@rbxts/log";

Log.SetLogger(
	Logger.configure()
		.WriteTo(Zircon.Log.Console())
		.WriteTo((message) => print(message.Timestamp, message))
		.Enrich(Zircon.Log.ZirconTag)
		.EnrichWithProperty("Version", PKG_VERSION)
		.Create(),
);

const LightTheme = makeTheme({
	PrimaryBackgroundColor3: Color3.fromRGB(220, 220, 220),
	SecondaryBackgroundColor3: Color3.fromRGB(200, 200, 200),
	PrimaryTextColor3: Color3.fromRGB(40, 40, 40),
	ConsoleColors: {
		...BaseTheme.ConsoleColors,
		White: Color3.fromRGB(40, 40, 40),
	},
});

function CustomConsole() {
	return (
		// <UIKTheme.Provider value={undefined}>
		<ZirconDockedConsole />
		// </UIKTheme.Provider>
	);
}

ZirconClient.BindConsole({
	ConsoleComponent: CustomConsole,
	EnableTags: true,
	Keys: [Enum.KeyCode.Backquote],
});

delayAsync(10).then(() => {
	Log.Info("Hello, {Test}! {Boolean} {Number} {Array}", "Test string", true, 10, [1, 2, 3, [4]]);
	Zircon.Log.Info("Test", "Should be good {}", 1);
	Zircon.Log.Info(
		"TestFormat",
		`String {}, Number {}, Boolean {}, Array: {}, Map: {}, Instance: {}, Undefined: {}, None: {}`,
		"Hello, World!",
		1337,
		true,
		[1, "two", true],
		{ value: "hi" },
		Players.LocalPlayer,
		undefined,
	);
	Zircon.Log.Debug("test", "testing debug");
	Zircon.Log.Warning("TestWarning", "test warning lol");
	Zircon.Log.Error("TestError", "test error lol");
	Zircon.Log.Failure("TestWtf", "wtf lol");
});
