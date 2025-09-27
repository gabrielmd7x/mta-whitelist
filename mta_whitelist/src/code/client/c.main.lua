Modules = {
    pages = "Index",
    currentToken = "000000",

    Render = function()
        if Modules.pages == "Index" then
            dxDrawRectangle(0, 0, 1920, 1080, tocolor(242, 242, 247))
            dxDrawText("Token\n" .. Modules.currentToken, 0, 0, 1920, 1080, tocolor(44, 44, 46), 2, "default-bold", "center", "center")
        end
    end,

    Show = function()
        addEventHandler("onClientRender", root, Modules.Render)
        showChat(false)
        showCursor(true)
    end,

    Hide = function()
        removeEventHandler("onClientRender", root, Modules.Render)
        showChat(true)
        showCursor(false)
    end,
}

addEvent("managerWhitelist", true)
addEventHandler("managerWhitelist", root, function(token, action)
    if action == "show" then
        Modules.currentToken = token or "#000000"
        Modules:Show()
        setClipboard(Modules.currentToken)
    elseif action == "hide" then
        Modules:Hide()
    else
        iprint("Ação desconhecida.", action)
    end
end)

addEventHandler("onClientResourceStart", resourceRoot, function()
end)
