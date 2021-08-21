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

function getBlockHeight() {
    return Math.floor(
        get("board").offsetHeight /
        get("helper_block").offsetHeight
    )
}

function getBlockWidth() {
    return Math.floor(
        get("board").offsetWidth /
        get("helper_block").offsetWidth
    )
}

function calcInMargin(size, margin) {
    return Math.floor(
        (Math.random() * size) -
        (margin * 2)
    ) + margin
}

function gen() {  
    let radius      = 7.5
    let margin      = 10
    let board       = get("board")
    let height      = getBlockHeight()
    let width       = getBlockWidth()
    let x           = calcInMargin(width, margin)
    let y           = calcInMargin(height, margin)

    for(let h = 0; h < height; h++) {
        let row         = make("div")
        row.id          = "row " + h
        row.className   = "row"

        for(let w = 0; w < width; w++) {
            let block   = make("span")
            block.id    = "block " + w
            row.appendChild(block)
            
            let isWithinRadius = (
                Math.pow(w - x, 2) +
                Math.pow(h - y, 2) <=
                radius * radius
            )

            if(isWithinRadius) {
                if(w == x && h == y) {
                    block.textContent   = "@"
                    block.className     = "blue"
                }
            } else { genBlock(block) }
        }
        
        board.appendChild(row)
    }
}

function regen() {
    let board = get("board")
    board.replaceChildren()

    board.className = "generating"
    window.requestAnimationFrame(gen)

    let helperBlock     = get("helper_block")
    board.style.height  = getBlockHeight() * helperBlock.offsetHeight
    board.style.width   = getBlockWidth() * helperBlock.offsetWidth
    board.className     = "generated"
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

document.ontouchmove = (e) => {
  e.preventDefault();
  
  // player movement??
}

onclick         = throttle(regen)
ontouchstart    = throttle(regen)
window.addEventListener("load", regen)
