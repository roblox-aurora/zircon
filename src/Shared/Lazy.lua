local function Lazy(fn, ...)
    local arg = {...}
    local cached
    return setmetatable({
        GetValue = function()
            if not cached then
                cached = fn(unpack(arg))
            end
            return cached
        end,
        HasValue = function()
            return cached ~= nil
        end
    }, {
        __index = function(self, idx)
            if not cached then
                cached = fn(unpack(arg))
            end
            return cached[idx]
        end,
        __newindex = function()
            error("Cannot assign value to Lazy object.")
        end
    })
end

return Lazy