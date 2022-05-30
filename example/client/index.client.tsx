import Roact from "@rbxts/roact";
import Zircon, { ZirconClient, ZirconFunctionBuilder } from "@zircon";
import delayAsync from "./Client/BuiltInConsole/DelayAsync";
import ZirconDockedConsole from "./Client/BuiltInConsole/UI/DockedConsole";
import ThemeContext, { ZirconDarkPlastic, makeTheme, ZirconFrost } from "./Client/UIKit/ThemeContext";
import { Players } from "@rbxts/services";
import Log, { Logger } from "@rbxts/log";
import { ZirconClientConfigurationBuilder } from "Class/ZirconClientConfigurationBuilder";

Log.SetLogger(Logger.configure().WriteTo(Zircon.Log.Console()).EnrichWithProperty("Version", PKG_VERSION).Create());

ZirconClient.BindConsole({
	Theme: "Plastic",
	EnableTags: true,
	Keys: [Enum.KeyCode.Backquote, Enum.KeyCode.F10],
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

ZirconClient.Registry.Init(
	new ZirconClientConfigurationBuilder()
		.AddFunction(
			new ZirconFunctionBuilder("version").Bind((context) => {
				context.LogInfo(PKG_VERSION);
			}),
		)
		.Build(),
);
