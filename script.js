function getFontSize() {
    return parseFloat(
        window.getComputedStyle(
            document.getElementById("board"),
            null
        ).getPropertyValue('font-size')
    )
}

function displayBoard(boardStr) {
    document.getElementById("board").innerHTML = boardStr
}

// bad usage of font size
function getCharWidth() {
    return Math.floor(window.innerWidth / getFontSize()); // count for two characters' worth of width
}

// also bad usage of font size
function getCharHeight() {
    return Math.floor(window.innerHeight / getFontSize());
}

function genChar() {
    let random = Math.floor(Math.random() * 100) + 1

    if(random > 99)     return "!"
    if(random > 97)     return ";"
    if(random > 89)     return ":"
    if(random > 80)     return ","
    if(random > 69)     return "."
    if(random > 0)      return " "
}

let margin = 10
let radius = 5.5

function generateBoard() {
    let out     = ""
    let height  = getCharHeight()
    let width   = getCharWidth()

    let y = getCharWidth() / 2 // Math.floor(Math.random() * height - margin * 2) + margin

    let x = getCharHeight() / 2// Math.floor(Math.random() * width - margin * 2) + margin

    for(let h = 0; h < height; h++) {
        for(let w = 0; w < width; w++) {
            if(Math.pow((h - x), 2) + Math.pow((w - y), 2) <= radius*radius) {
                if(w == y && h == x)    { out += "@" }
                else                    { out += " " }
            } else                      { out += genChar() }
            
            if(w < width - 1)   { out += " " }
            else                { out += "\n" }
        }
    }

    return out
}

function dispGen() {
    displayBoard(generateBoard())
}

window.onkeydown = function(k) {
    if(k.keyCode == 32) { dispGen() } // spacebar
}

onclick         = dispGen
ontouchstart    = dispGen
window.onload   = dispGen
