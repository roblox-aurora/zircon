local TS = _G[script]
return function(relativeTo, ...)
    return TS.import(script, relativeTo, ...)
end