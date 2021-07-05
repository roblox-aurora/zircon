<div align="center">
    <img src="https://i.imgur.com/YgpbX7G.png"/>
    <h2>A clean, sleek, runtime debugging console for Roblox</h2>
    <p>Note: I am working on the API for the Zircon scripting still - so Coming soon&trade;</p>
</div>

----

## Setup
To begin, it is recommended to do
```
npm i @rbxts/zircon @rbxts/log
```

This will install both Zircon, as well as the logging support. It is recommended to use the logging as it can be filtered easily through the Zircon console.

## Features
- ### Zirconium Language Scripting
    Zircon comes inbuilt with a runtime scripting language called [Zirconium](https://github.com/roblox-aurora/zirconium). This allows you to run scripts against your game during runtime.

    More information on how to set this up, will come when Zircon is closer to being production-ready.

- ### Structured Logging
    If you want logging for Zircon, you will need to install [@rbxts/log](https://github.com/roblox-aurora/rbx-log).

    Then to use Zircon with Log, you simply do 
    ```ts
    import Log from "@rbxts/log";
    import Log, { Logger } from "@rbxts/log";
    import Zircon from "@rbxts/zircon";

    Log.SetLogger(
        Logger.configure()
            // ... Any other configurations/enrichers go here.
            .WriteTo(Zircon.Log.Console()) // This will emit any `Log` messages to the Zircon console
            .Create() // Creates the logger from the configuration
    );
    ```

    This will need to be done on both the _client_ and _server_ to achieve full logging.

    All logging done through this can be filtered through the console itself. That's the power of structured logging! ;-)

## Registering and using Zircon Commands
Below is an example of how to register a command in Zircon:

```ts
import Zircon from "@rbxts/zircon";
import Log from "@rbxts/log";

Zircon.Server.Registry.RegisterFunction(
    new ZirconFunctionBuilder("print_message")
        .AddArguments("string")
        .Bind((context, message) => Log.Info(
                "Zircon says {Message} from {Player}", 
                message,
                context.GetExecutor()
        )),
    [Zircon.Server.Registry.User]
)
```

This will create a global `print_message` that all players can run.

Then if run in Zircon:

<img src="./assets/Example1.png"/>

The first argument of `RegisterFunction` takes a `ZirconFunctionBuilder` - which is the easiest way to build a function. `AddArguments` takes any number of arguments for types you want, in built types in Zircon you can use a string for. Otherwise you supply the type validator object.