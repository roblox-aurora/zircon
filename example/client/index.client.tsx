import Roact from "@rbxts/roact";
import Zircon from "@zircon";
import ZirconClient from "./Client";
import delayAsync from "./Client/BuiltInConsole/DelayAsync";
import ZirconClientStore from "./Client/BuiltInConsole/Store";
import { ConsoleActionName } from "./Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ZirconDockedConsole from "./Client/BuiltInConsole/UI/DockedConsole";
import UIKTheme, { BaseTheme, makeTheme } from "./Client/UIKit/ThemeContext";
import TextStream from "@rbxts/zirconium-ast/out/TextStream";
import { Players } from "@rbxts/services";

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
});

delayAsync(10).then(() => {
	Zircon.Log.Info("Test", "Should be good {}", 1);
	Zircon.Log.Info(
		"testFormat",
		"s {}, n: {}, b: {}, a: {}, m: {}, p: {}",
		"Hello, World!",
		10,
		true,
		[1, true, "Hello", 3, [4, [6, 7]]],
		{
			string: "hi",
			number: 10,
			boolean: true,
			innerArray: [10],
			innerObject: { a: 10 },
		},
		Players.LocalPlayer,
	);
	Zircon.Log.Debug("test", "testing debug");
	Zircon.Log.Warning("TestWarning", "test warning lol");
	Zircon.Log.Error("TestError", "test error lol");
	Zircon.Log.Failure("TestWtf", "wtf lol");
});
