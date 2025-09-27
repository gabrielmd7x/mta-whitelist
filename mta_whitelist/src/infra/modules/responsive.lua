screen = {guiGetScreenSize()}
resolution = {1920, 1080}
sx, sy = screen[1] / resolution[1], screen[2] / resolution[2]

function setScreenPosition(x, y, w, h)
    return ((x / resolution[1]) * screen[1]), ((y / resolution[2]) * screen[2]), ((w / resolution[1]) * screen[1]), ((h / resolution[2]) * screen[2])
end

function clamp(value, min, max)
    return math.max(min, math.min(value, max))
end

function lerp(a, b, t)
    return a + (b - a) * t
end

function isCursorOnElement(x, y, w, h)
    if isCursorShowing() then
        local cursor = {getCursorPosition()}
        local mx, my = cursor[1] * screen[1], cursor[2] * screen[2]
        return mx > x and mx < x + w and my > y and my < y + h
    end
    return false
end

function isEventHandlerAdded(eventName, attachedTo, handlerFunction)
    local attachedFunctions = getEventHandlers(eventName, attachedTo)
    if attachedFunctions then
        for _, func in ipairs(attachedFunctions) do
            if func == handlerFunction then return true end
        end
    end
    return false
end

_dxDrawRectangle = dxDrawRectangle
function dxDrawRectangle(x, y, w, h, ...)
    local x, y, w, h = setScreenPosition(x, y, w, h)
    
    return _dxDrawRectangle(x, y, w, h, ...)
end

_dxDrawText = dxDrawText
function dxDrawText(text, x, y, w, h, ...)
    local x, y, w, h = setScreenPosition(x, y, w, h)
    
    return _dxDrawText (text, x, y, (x + w), (y + h), ...)
end

_isCursorOnElement = isCursorOnElement
function isCursorOnElement(x, y, w, h)
    local x, y, w, h = setScreenPosition(x, y, w, h)

    return _isCursorOnElement(x, y, w, h)
end