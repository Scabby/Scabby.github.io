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
        let row         = make("div")
        row.id          = "row " + h
        row.className   = "row"

        for(let w = 0; w < width; w++) {
            let block   = make("span")
            block.id    = "block " + w
            row.appendChild(block)

            if(Math.pow(w - x, 2) + Math.pow(h - y, 2) <= radius * radius) {
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

    board.style.width   = board.offsetWidth
    board.style.height  = board.offsetHeight
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

document.ontouchmove = function (e) {
  e.preventDefault();
  
  // player movement?? 
}

onclick         = throttle(regen)
ontouchstart    = throttle(regen)
window.addEventListener("load", regen)
