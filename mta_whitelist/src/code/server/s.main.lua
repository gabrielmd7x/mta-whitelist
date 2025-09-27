Modules = {
    Init = function()
        Modules:Whitelist()
    end,

    generateToken = function()
        local token = ""
        for i = 1, 6 do
            token = token .. tostring(math.random(0, 9))
        end
        return token
    end,

    Whitelist = function()
        addEventHandler("onPlayerJoin", root, function()
            local player = source
            local serial = getPlayerSerial(player)
            local token = Modules:generateToken()

            fetchRemote(
                "http://127.0.0.1:3000/check-whitelist",
                {
                    method = "POST",
                    headers = {
                        ["Content-Type"] = "application/json"
                    },
                    postData = string.format('{"serial":"%s","token":"%s"}', serial, token)
                },
                function(responseData, info)
                    if info.statusCode ~= 200 then
                        triggerClientEvent(player, "managerWhitelist", player, token, "show")
                    else
                        triggerClientEvent(player, "managerWhitelist", player, "", "hide")
                    end
                end
            )
        end)
    end,
}

addEventHandler("onResourceStart", resourceRoot, function()
    Modules:Init()
end)

function whitelistApproved(_, _, serial)
    for _, player in ipairs(getElementsByType("player")) do
        local playerSerial = getPlayerSerial(player)
        if playerSerial == serial then
            outputChatBox("Whitelist aprovada!", player, 0, 255, 0, true)
            triggerClientEvent(player, "managerWhitelist", player, "", "hide")
        end
    end
end