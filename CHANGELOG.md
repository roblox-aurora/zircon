## 0.20.0
- Overhauled API for registering functions, namespaces and enums.
- Overhauled API for groups
- Both server & client now have `Init` functions to initialize Zircon.
    - Zircon functions should be registered through here, however any old Zircon API will still work and wait for the Init call.
- Each log message now shows a detailed view if you click on them (if you have the permissions)
- Enums now use a native Zirconium enum type, rather than a hacky userdata.
- Added the `players` (array of players), `players?`, `range` (in Zirconium e.g. `1..10`) and `defined` built-in argument types.
- Added union arguments to `ZirconFunction`s
- Added variadic arguments to `ZirconFunction`s
- History now works properly
- Auto-focus is back, but now as an option to the client `Init` function
- Functions can now respond to players calling them via the `context` argument, e.g. `context.LogInfo("hi there!")`.
- Error messages for function calls will now only show for the player who called it.

This will all be properly documented soon.