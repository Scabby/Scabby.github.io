function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function update() {
    window.dispatchEvent(
        new Event('resize')
    )
}

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
    let board, helperBlock
    
    return Math.floor(
        this.board.offsetHeight /
        this.helperBlock.offsetHeight
    )
}

function getBlockWidth() {
    let board, helperBlock
    
    return Math.floor(
        this.board.offsetWidth /
        this.helperBlock.offsetWidth
    )
}

function calcInMargin(size, margin) {
    if(size <= margin * 2) {
        return Math.floor(size / 2)
    } else {
        return Math.round(
            Math.random() *
            (size - margin * 2) +
            margin
        )
    }
}

function gen() {
    let radius, margin, board
    
    let height      = getBlockHeight()
    let width       = getBlockWidth()
    let x           = calcInMargin(width, this.margin)
    let y           = calcInMargin(height, this.margin)

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
                Math.pow(this.radius, 2)
            )

            if(isWithinRadius) {
                if(w == x && h == y) {
                    block.textContent   = "@"
                    block.className     = "blue"
                }
            } else { genBlock(block) }
        }
        
        this.board.appendChild(row)
    }
}

function regen() {
    let board, helperBlock
    
    this.board.replaceChildren()
    this.board.className = "generating"
    update()

    this.board.style.height  = getBlockHeight() * this.helperBlock.offsetHeight
    this.board.style.width   = getBlockWidth() * this.helperBlock.offsetWidth

    gen()

    this.board.className = "generated"
}

function moveUp() {}
function moveDown() {}
function moveLeft() {}
function moveRight() {}

function parseSwipe(e) {
    let lastY, lastX

    let touch       = e.originalEvent.touches[0]
    let currentY    = touch.clientY
    let currentX    = touch.clientX
    let deltaX      = currentX - lastX
    let deltaY      = currentY - lastY
    
    let isYSwipe    = Math.abs(deltaY) > Math.abs(deltaX)

    if(isYSwipe) {
        let isUp = currentY < lastY
        
        if(isUp)    { moveUp() }
        else        { moveDown() }
    } else {
        let isLeft = currentX < lastX
        
        if(isLeft)  { moveLeft() }
        else        { moveRight() }
    }
    
    lastY = currentY
    lastX = currentX
}

function throttle(func, wait = 500) {
    let shouldWait
    
    return (... args) => {
        if(!shouldWait) {
            func.apply(this, args)
            shouldWait = true

            setTimeout(() => { shouldWait = false }, wait)
        }
    }
}

document.addEventListener("touchmove", (e) => {
    e.preventDefault()
    throttle(parseSwipe, 100, e)
})

onkeydown = (e) => {
    let key = e.code
    
    switch(key) {
        case "w": moveUp();     break
        case "a": moveLeft();   break
        case "s": moveDown();   break
        case "d": moveRight();  break
    }
}

onclick         = throttle(regen)
ontouchstart    = throttle(regen)
window.addEventListener("load", regen)

radius      = 7.5
margin      = 15 
board       = get("board")
helperBlock = get("helperBlock")
