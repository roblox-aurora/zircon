return function(level, ...)
    local combinedStr = ""
    local args = {...}
    for _, key in ipairs(args) do
        if key == "source" then
            combinedStr ..= "s"
        elseif key == "lineNumber" then
            combinedStr ..= "l"
        elseif key == "arguments" then
            combinedStr ..= "a"
        elseif key == "name" then
            combinedStr ..= "n"
        end
    end

    return { debug.info(level + 1, combinedStr) }
end