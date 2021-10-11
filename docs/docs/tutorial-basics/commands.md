---
sidebar_position: 3
---

# Configuring and using scripting
Another use for Zircon is the ability to programmatically manipulate your game during runtime.

By default, script execution is limited to _only_ the creator of the game or group owner.

## Adding Functions
Functions in Zircon use the [Zirconium](https://github.com/roblox-aurora/zirconium) language and thus are sandboxed + use the syntax of that language

```ts
import { ZirconServer, ZirconFunctionBuilder } from "@rbxts/zircon";
import Log from "@rbxts/log";

ZirconServer.Registry.RegisterFunction(
    new ZirconFunctionBuilder("print_message")
        .AddArgument("string")
        .Bind((context, message) => Log.Info(
                "Zircon says {Message} from {Player}", 
                message,
                context.GetExecutor()
        )),
    [ZirconServer.Registry.User]
)
```

This will create a global `print_message` that all players can run.

Then if run in Zircon:

<img src="/img/Example1.png"/>

- `ZirconServer.Registry` is the server registry
- `ZirconFunctionBuilder` here is a builder class, in which allows you to configure the executable function.
  - `AddArgument` adds an argument type, internal types you can use a _string_ id, such as `string`, `number`, `boolean`, `player` and `unknown`. This will infer the zircon function types for the `Bind` function + enforce type checking when this function is called.
  - `Bind` binds the arguments to the function you provide, the first argument of the function is _always_ `context`; which is the zircon runtime's context (useful for getting things like the executing player)

- `ZirconServer.Registry.RegisterFunction` takes a `ZirconFunction`, which `ZiroconFunctionBuilder.Build(...)` returns. The second argument to `RegisterFunction` is the _groups_ that can execute this function. By default you _should_ limit it to `Creator`.

The default groups available to Zircon are `Creator`, `Administrator` and `User`. `Creator` is the place or group owner, `Administrator` is a group that requires explicit users and `User` is any user. It is recommended that you use `Creator` or `Administrator` for functions.


