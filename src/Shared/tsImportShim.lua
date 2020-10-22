local TS = _G[script]
return function(...)
    return TS.import(script, script.Parent, ...)
end