---
sidebar_position: 2
---

# Configuring and using the logger
A big use for Zircon is to enable easy _logging_ for your game. This is done through the `@rbxts/log` library, however requires that you set Zircon as the sink.

```ts
import Log from "@rbxts/log";
import Log, { Logger } from "@rbxts/log";
import Zircon from "@rbxts/zircon";

Log.SetLogger(
    Logger.configure()
        .WriteTo(Zircon.Log.Console()) // This will emit any `Log` messages to the Zircon console
        .Create() // Creates the logger from the configuration
);
```

`Zircon.Log.Console()` here is a _Sink_, in which `Log` will use to output any messages you use, e.g. `Log.Info("Hello, World!");`

And that's pretty much it. If you want to configure the logger itself further, see the [@rbxts/log docs](#todo).