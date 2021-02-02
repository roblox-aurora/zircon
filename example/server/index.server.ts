import { ZrValue } from "@rbxts/zirconium/out/Data/Locals";
import ZrLuauFunction from "@rbxts/zirconium/out/Data/LuauFunction";
import Zircon from "@zircon";

Zircon.Server.Registry.RegisterZrLuauFunction(
	"print",
	(context, ...args: ZrValue[]) => {
		context.pushOutput(args.map((arg) => tostring(arg)).join(" "));
	},
	[Zircon.Server.Registry.User],
);

Zircon.Server.Dispatch.ExecuteScriptGlobal("print 'Hello, World!'")
	.then(async (script) => {
		script.registerFunction(
			"print",
			new ZrLuauFunction((context, ...args) => {
				print(...args);
			}),
		);
		const result = await script.execute();
		print(result.join(", "));
	})
	.catch((err) => print("Error", err));
