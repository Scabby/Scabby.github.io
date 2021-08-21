function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function getBlock(y, x) {
    let blocks = get(rowPre + y).children
    
    for(let i = 0; i < blocks.length; i++) {
        if(blocks[i].id = blockPre + x) {
            return blocks[i]
        }
    }
}

function update(element) {
    let display             = element.style.display
    element.style.display   = "none"
    element.style.display   = display
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
    return Math.floor(
        board.offsetHeight /
        helperBlock.offsetHeight
    )
}

function getBlockWidth() {
    return Math.floor(
        board.offsetWidth /
        helperBlock.offsetWidth
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
    let height  = getBlockHeight()
    let width   = getBlockWidth()
    
    playerY = calcInMargin(height, margin)
    playerX = calcInMargin(width, margin)

    for(let h = 0; h < height; h++) {
        let row         = make("div")
        row.id          = rowPre + h
        row.className   = rowPre

        for(let w = 0; w < width; w++) {
            let block   = make("span")
            block.id    = blockPre + w
            row.appendChild(block)
            
            let isWithinRadius = (
                Math.pow(h - playerY, 2) +
                Math.pow(w - playerX, 2) <=
                Math.pow(radius, 2)
            )

            if(isWithinRadius) {
                if( h == playerY && w == playerX) {
                    block.textContent   = "@"
                    block.className     = "blue"
                }
            } else { genBlock(block) }
        }
        
        board.appendChild(row)
    }
}

function regen() {
    board.replaceChildren()
    board.className = "generating"
    update(board)

    window.requestAnimationFrame(() => {
        board.style.height  = getBlockHeight() * helperBlock.offsetHeight
        board.style.width   = getBlockWidth() * helperBlock.offsetWidth
        boardHeight         = board.style.height
        boardWidth          = board.style.width

        gen()
        
        board.className = "generated
    })
}

function move(y, x) {
    playerBlock.remove()
    playerBlock = getBlock(playerY + y, playerX + x)
    playerY += y
    playerX += x
}

function moveUp() {}
function moveDown() {}
function moveLeft() {}
function moveRight() {}

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

onclick         = throttle(regen)
ontouchstart    = throttle(regen)

ontouchmove = (e) => {
    e.preventDefault()
    
    parseSwipe = (e) => {
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
    
    throttle(parseSwipe, 100, e)
}

onkeydown = (e) => {
    let key = e.code
    
    switch(key) {
        case "w": moveUp();     break
        case "a": moveLeft();   break
        case "s": moveDown();   break
        case "d": moveRight();  break
    }
}

onload = () => {
    board          = get("board")
    helperBlock    = get("helper_block")
    regen()
}

radius      = 7.5
margin      = 15
rowPre      = "row"
blockPre    = "block"

boardWidth  = unset
boardHeight = unset
playerY     = unset
playerX     = unset
playerBlock = unset
