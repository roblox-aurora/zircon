import Roact from "@rbxts/roact";
import ZirconClient from "./Client";
import ZirconClientStore from "./Client/BuiltInConsole/Store";
import { ConsoleActionName } from "./Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ZirconDockedConsole from "./Client/BuiltInConsole/UI/DockedConsole";
import UIKTheme, { BaseTheme, makeTheme } from "./Client/UIKit/ThemeContext";

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

ZirconClient.bindConsole({
	ConsoleComponent: CustomConsole,
});
ZirconClientStore.dispatch({ type: ConsoleActionName.SetConfiguration, hotkeyEnabled: true, executionEnabled: true });
