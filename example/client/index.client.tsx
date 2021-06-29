import Roact from "@rbxts/roact";
import Zircon from "@zircon";
import ZirconClient from "./Client";
import delayAsync from "./Client/BuiltInConsole/DelayAsync";
import ZirconDockedConsole from "./Client/BuiltInConsole/UI/DockedConsole";
import { BaseTheme, makeTheme } from "./Client/UIKit/ThemeContext";
import { Players } from "@rbxts/services";
import Log, { Logger } from "@rbxts/log";

Log.SetLogger(Logger.configure().WriteTo(Zircon.Log.Console()).EnrichWithProperty("Version", PKG_VERSION).Create());

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
	Log.Verbose("Verbose message pls");
	Log.Info("Hello, {Test}! {Boolean} {Number} {Array}", "Test string", true, 10, [1, 2, 3, [4]]);
	Log.Info("Should be good {Number}", 1);
	Log.Info(
		`String {String}, Number {Number}, Boolean {Boolean}, Array: {Array}, Map: {Map}, Instance: {Instance}, Undefined: {Undefined}, None: {None}`,
		"Hello, World!",
		1337,
		true,
		[1, "two", true],
		{ value: "hi" },
		Players.LocalPlayer,
		undefined,
	);
	Log.Debug("test", "testing debug");
	Log.Warn("test warning lol");
	Log.Error("test error lol");
	Log.Fatal("wtf lol");
});
