const instances = []

class Movable {
    constructor(
        id,
        x_position = window.innerWidth / 2,
        y_position = window.innerHeight / 2,
        x_velocity  = 0,
        y_velocity  = 0,
        friction    = 0.8
    ) {
        this.element = document.createElement("div")
        this.element.className  = "movable"
        this.element.id         = id
        board.appendChild(this.element)

        this.x_position = x_position
        this.y_position = y_position
        this.x_velocity = x_velocity
        this.y_velocity = y_velocity
        this.friction   = friction

        instances.push(this)
    }

    get width()     { return this.element.offsetWidth }
    get height()    { return this.element.offsetHeight }

    update() {
        this.x_velocity = this.x_velocity * this.friction
        this.y_velocity = this.y_velocity * this.friction

        let x_screen_estate = window.innerWidth - this.width
        let y_screen_estate = window.innerHeight - this.height

        if(this.x_position < 0) {
            this.x_position = 0
            this.x_velocity = 0
        }
        
        if(this.x_position > x_screen_estate) {
            this.x_position = x_screen_estate
            this.x_velocity = 0
        }
        
        if(this.y_position < 0) {
            this.y_position = 0
            this.y_velocity = 0
        }
        
        if(this.y_position > y_screen_estate) {
            this.y_position = y_screen_estate
            this.y_velocity = 0
        }

        this.x_position += this.x_velocity
        this.y_position += this.y_velocity

        this.element.style.left = this.x_position + "px"
        this.element.style.top  = this.y_position + "px"
    }

    static update_all() {
        for(const e of instances) {
            e.update()
        }
    }
}

function game_loop() {
    if(move_up)     { move(player, 0, -move_speed) }
    if(move_down)   { move(player, 0, move_speed) }
    if(move_left)   { move(player, -move_speed, 0) }
    if(move_right)  { move(player, move_speed, 0) }

    Movable.update_all()
    window.requestAnimationFrame(game_loop)
}

window.onload = () => {
    let delay = 300

    function clear_loading_screen() {
        let loading_screen  = document.getElementById("loading-screen")
        let loading_bar     = document.getElementById("spinning")
        let loading_message = document.getElementById("message")

        loading_bar.animate     ([{ opacity:0 }], { duration:delay })
        loading_message.animate ([{ opacity:0 }], { duration:delay })
        loading_screen.animate  ([{ opacity:0 }], { duration:delay, delay:delay })

        setTimeout(() => {
                loading_bar.remove();
                loading_message.remove()
            }, delay
        )

        setTimeout(() => { loading_screen.remove() }, delay * 2)

        setTimeout(game_loop, delay)
    }
    
    clear_loading_screen()

    board   = document.getElementById("board")
    player  = new Movable("player")
    enemy   = new Movable("enemy")
}

function move(movable, x, y) {
    movable.x_velocity += x
    movable.y_velocity += y
}

onkeydown = (e) => {
    switch(e.key) {
        case "w": move_up       = true; break
        case "a": move_left     = true; break
        case "s": move_down     = true; break
        case "d": move_right    = true; break
    }
}

onkeyup = (e) => {
    switch(e.key) {
        case "w": move_up       = false; break
        case "a": move_left     = false; break
        case "s": move_down     = false; break
        case "d": move_right    = false; break
    }
}

move_up     = false
move_down   = false
move_left   = false
move_right  = false

move_speed  = 2

let player,
    board
