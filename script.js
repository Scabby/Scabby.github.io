function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function genBlock(block) {
    let r = Math.floor(Math.random() * 100) + 1
    let text
    let color

    if(r < 70)      { return }
    else if(r < 75) { text = "."; color = "dark_grey" }
    else if(r < 85) { text = ","; color = "grey" }
    else if(r < 95) { text = ":"; color = "light_grey" }
    else if(r < 97) { text = ";"; color = "white" }
    else            { text = "!"; color = "red" }

    block.textContent   = text
    block.className     = color
}

function gen() {
    let radius      = 7.5
    let board       = get("board")
    let helperBlock = get("helper_block")
    let height      = Math.floor(board.offsetHeight / helperBlock.offsetHeight)
    let width       = Math.floor(board.offsetWidth / helperBlock.offsetWidth)
    let x           = Math.floor(width / 2)
    let y           = Math.floor(height / 2)

    for(let h = 0; h < height; h++) {
        let row = make("div")
        row.className = "row " + h

        for(let w = 0; w < width; w++) {
            let block       = make("span")
            block.className = "block " + w
            row.appendChild(block)

            if(Math.pow(w - x, 2) + Math.pow(h - y, 2) <= radius * radius) {
                if(w == x && h == y) {
                    block.textContent   = "@"
                    block.className     = "blue"
                }
            } else {
                genBlock(block)
            }
        }

        board.appendChild(row)
    }
}

function regen() {
    let board = get("board")
    board.replaceChildren()
    gen()
}

function throttle(func, timeout = 300) {
    let shouldWait = false
    
    return (... args) => {
        if(!shouldWait) {
            func.apply(this, args)
            shouldWait = true

            setTimeout(
                () => shouldWait = false, timeout
            )
        }
    }
}

function calc_vh() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

document.ontouchmove = function (e) {
  e.preventDefault();
  
  // player movement?? 
}

onclick         = throttle(regen)
onkeydown       = throttle(regen)
ontouchstart    = throttle(regen)
window.addEventListener("load", regen)
window.addEventListener("resize", calc_vh)

calc_vh()

/*
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

    let y = Math.floor(getCharWidth() / 2) // Math.floor(Math.random() * height - margin * 2) + margin

    let x = Math.floor(getCharHeight() / 2) // Math.floor(Math.random() * width - margin * 2) + margin

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

function debounceForLast(func, timeout = 100) {
    let timer;
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(
            () => { func.apply(this, args) },
            timeout
        )
    }
}

onresize        = debounceForLast(dispGen)
onkeydown       = dispGen
onclick         = dispGen
ontouchstart    = dispGen
onload          = dispGen
*/
