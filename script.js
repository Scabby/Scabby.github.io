function get(id) {
    return document.getElementById(id)
}

function clamp(n, max) {
    if(n < -max)    { return -max }
    if(n > max)     { return max }
    return n
}

function screen_area_x(element) {
    return window.innerWidth - element.offsetWidth
}

function screen_area_y(element) {
    return window.innerHeight - element.offsetHeight
}

function found_class(element, name) {
    let names = element.className
    let index = names.indexOf(name)
    
    return names.includes(name)

    /*
    if(!names.includes(name)) { return false }

    return  names == name                           // equal
            ||
            index == 0 &&
            names.charAt(name.length) == " "        // start
            ||
            index == names.length - name.length &&
            names.charAt(index - 1) == " "          // at end
            ||
            // in middle
            names.substring(index - 1, index + name.length) == " " + name + " "
    */
}

function add_class(element, name) {
    let names = element.className

    if(found_class(element, name)) { return }

    if(!names.includes(name)) {
        if(names.length == 0)   { element.className = name }
        else                    { element.className += " " + name }
    }
}

function remove_class(element, name) {
    let names = element.className
    let index = names.indexOf(name)

    if(!found_class(element, name)) { return }

    if(names.includes(" ")) {
        if(index == 0) {
            element.className = names.substring(name.length)
        } else {
            element.className = names.substring(0, index - 1) +
                                names.substring(index + name.length)
        }
    } else { element.className = "" }
}

var fading_out = []

function fade_out(element, duration = fade_delay, delay = 0) {
    let fade_animation = element.animate(
        [{ opacity: 0}],
        { duration: duration, delay: delay }
    )

    if(fading_out.includes(element))    { return }
    else                                { fading_out.push(element) }

    setTimeout(() => {
        if(!fading_out.includes(element)) {
            fade_animation.finish()
            return
        }

        add_class(element, "hidden")
    }, duration)
}

function fade_in(element, duration = fade_delay, delay = 0) {
    let fade_animation = element.animate(
        [{ opacity: 100 }],
        { duration: duration, delay: delay }
    )

    if(fading_out.includes(element)) {
        fading_out.splice(
            fading_out.indexOf(element),
            1
        )
    }

    setTimeout(() => {
        if(fading_out.includes(element)) {
            fade_animation.finish()
            return
        }

        remove_class(element, "hidden")
    }, duration)
}

function toggle_pause() {
    let animations = document.getAnimations()

    if(pause_screen == null) {
        animations.forEach(animation => animation.pause())

        fade_out(info_panel)

        pause_screen    = document.createElement("div")
        pause_screen.id = "pause-screen"
        document.body.appendChild(pause_screen)

        if(text_box == null) {
            text_box        = document.createElement("input")
            text_box.id     = "text-box"
            text_box.type   = "text"
            pause_screen.appendChild(text_box)
            setTimeout(() => text_box.focus(), 10)
        }

        is_paused = true
    } else {
        animations.forEach(animation => animation.play())

        fade_in(info_panel)
        fade_out(pause_screen)
        fade_out(text_box)
        text_box.blur()

        setTimeout(() => {
            if(pause_screen != null) {
                pause_screen.remove()
                pause_screen = undefined
            }

            if(text_box != null) {
                text_box.remove()
                text_box = null
            }

            is_paused = false
        }, fade_delay)
    }
}

movable_instances = []

class Movable {
    constructor(
        id,
        x_position  = screen_area_x(movable_helper) / 2,
        y_position  = screen_area_y(movable_helper) / 2,
        x_velocity  = 0,
        y_velocity  = 0,
        health      = 100,
        ammunition  = 10,
        m_class     = "default",
        fire_rate   = 1,
        friction    = 0.15,
        move_speed  = 2,
        is_alive    = true
    ) {
        this.element = document.createElement("div")
        this.element.className  = "movable " + m_class
        this.element.id         = id
        board.appendChild(this.element)

        this.x_position = x_position
        this.y_position = y_position
        this.x_velocity = x_velocity
        this.y_velocity = y_velocity
        this.health     = health
        this.ammunition = ammunition
        this.m_class    = m_class
        this.fire_rate  = fire_rate
        this.friction   = friction
        this.move_speed = move_speed
        this.is_alive   = is_alive

        movable_instances.push(this)
    }

    get width()     { return this.element.offsetWidth }
    get height()    { return this.element.offsetHeight }

    update() {
        this.x_velocity -= this.friction * this.x_velocity
        this.y_velocity -= this.friction * this.y_velocity

        let x_screen_area = window.innerWidth - this.width
        let y_screen_area = window.innerHeight - this.height

        if(this.x_position < 0) {
            this.x_position = 1
            this.x_velocity = -this.x_velocity
        } else if(this.x_position > x_screen_area) {
            this.x_position = x_screen_area - 1
            this.x_velocity = -this.x_velocity
        }

        if(this.y_position < 0) {
            this.y_position = 1
            this.y_velocity = -this.y_velocity
        } else if(this.y_position > y_screen_area) {
            this.y_position = y_screen_area - 1
            this.y_velocity = -this.y_velocity
        }

        this.x_position += this.x_velocity
        this.y_position += this.y_velocity

        this.element.style.left = this.x_position + "px"
        this.element.style.top  = this.y_position + "px"
    }

    get_force_toward(target) {
        function curve(distance, move_speed) {
            return Math.atan(
                Math.pow(
                    (distance - (follow_distance * width_sum)) / follow_ease,
                    3
                )
            ) * (Math.PI / 5) * move_speed
        }

        let x_diff      = target.x_position - this.x_position
        let y_diff      = target.y_position - this.y_position
        let angle       = Math.atan2(y_diff, x_diff)
        let width_sum   = this.width + target.width
        let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

        return [
            Math.cos(angle) * curve(distance, this.move_speed),
            Math.sin(angle) * curve(distance, this.move_speed)
        ]
    }

    get_force_away(target) {
        function curve(distance, move_speed, width_sum) {
            return -clamp(
                1 / (
                    Math.pow(distance /(leave_distance * width_sum),
                    leave_ease)
                ),
                move_speed
            )
        }

        let x_diff      = target.x_position - this.x_position
        let y_diff      = target.y_position - this.y_position
        let angle       = Math.atan2(y_diff, x_diff)
        let width_sum   = this.width + target.width
        let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

        return [
            Math.cos(angle) * curve(distance, this.move_speed, width_sum),
            Math.sin(angle) * curve(distance, this.move_speed, width_sum)
        ]
    }

    move(x, y) {
        this.x_velocity += x
        this.y_velocity += y
    }

    heal(amount) { this.health += amount }
    harm(amount) { this.health -= amount }

    give_ammo(amount) { this.ammo += amount }
    take_ammo(amount) { this.ammo -= amount }

    move_toward(target) {
        let [x, y] = get_force_toward(target)
        this.move(x, y)
    }

    move_away(target) {
        let [x, y] = get_force_away(target)
        this.move(x, y)
    }
}

function update_all() {
    for(let current of movable_instances) {
        if(!current.is_alive)   { add_class(current.element, "dead") }
        else                    { remove_class(current.element, "dead") }

        let new_x_move_force = 0
        let new_y_move_force = 0

        function add_force(force) {
            let [x, y] = force
            new_x_move_force += x
            new_y_move_force += y
        }

        if(current.element.id.includes("enemy") && current.is_alive) {
            add_force(current.get_force_toward(player))
        }

        for(let target of movable_instances) {
            if(current == target) { continue }

            if( current.element.id != "player" &&
                target.element.id != "player" &&
                current.is_alive
            ) {
                add_force(current.get_force_away(target))
            }

            if( current.x_position < target.x_position + target.width &&
                current.x_position + current.width > target.x_position &&
                current.y_position < target.y_position + target.height &&
                current.y_position + current.height > target.y_position)
            {
                let x_diff =    (current.x_position + current.width / 2) -
                                (target.x_position + target.width / 2)

                let y_diff =    (current.y_position + current.height / 2) -
                                (target.y_position + target.height / 2)

                let x_overlap, y_overlap

                if(x_diff > 0) {
                    x_overlap = target.x_position +
                                target.width -
                                current.x_position
                } else {
                    x_overlap = -(current.x_position +
                                current.width -
                                target.x_position)
                }

                if(y_diff > 0) {
                    y_overlap = target.y_position +
                                target.height -
                                current.y_position
                } else {
                    y_overlap = -(current.y_position +
                                current.height -
                                target.y_position)
                }

                if(Math.abs(x_diff) < Math.abs(y_diff)) {
                    current.y_position  += y_overlap / 2
                    target.y_position   -= y_overlap / 2
                } else {
                    current.x_position  += x_overlap / 2
                    target.x_position   -= x_overlap / 2
                }

                let curr_x_velocity = current.x_velocity
                let curr_y_velocity = current.y_velocity

                current.x_velocity  = target.x_velocity
                current.y_velocity  = target.y_velocity
                target.x_velocity   = curr_x_velocity
                target.y_velocity   = curr_y_velocity
            }
        }

        current.x_velocity += clamp(new_x_move_force, current.move_speed)
        current.y_velocity += clamp(new_y_move_force, current.move_speed)
    }

    for(const e of movable_instances) {
        e.update()
    }
}

function game_loop() {
    if(is_paused) {
        setTimeout(game_loop, game_tick)
        return
    }

    if( wave_is_spawning &&
        current_enemy_spawn_timer > enemy_spawn_delay &&
        enemy_count < enemy_spawn_cap
    ) {
        let attempts = 0
        let x, y

        while(attempts < 10) {
            x = Math.random() * screen_area_x(movable_helper)
            y = Math.random() * screen_area_y(movable_helper)
            attempts++
        }

        new Movable("enemy", x, y)
        current_enemy_spawn_timer = 0
        enemy_count++

        if(enemy_count == enemy_spawn_cap) {
            wave_is_spawning = false
        }
    }

    if(current_enemy_spawn_timer <= enemy_spawn_delay) {
        current_enemy_spawn_timer++
    }

    function parse_diagonals() {
        let x = player.move_speed
        let y = player.move_speed

        let angle = Math.atan2(y, x)

        if(move_up)     { y = -y }
        if(move_left)   { x = -x }

        player.move(Math.cos(angle) * x, Math.sin(angle) * y)
    }

    if((move_up || move_down) && (move_left || move_right)) {
        parse_diagonals()
    } else {
        if(move_up)     { player.move(0, -player.move_speed) }
        if(move_down)   { player.move(0, player.move_speed) }
        if(move_left)   { player.move(-player.move_speed, 0) }
        if(move_right)  { player.move(player.move_speed, 0) }
    }

    update_all()

    let speed_count = Math.sqrt(
        Math.pow(player.x_velocity, 2) +
        Math.pow(player.y_velocity, 2)
    ).toFixed(2)

    let angle_count

    if(speed_count != 0) {
        angle_count = (
            Math.atan2(player.y_velocity, player.x_velocity) *
            (180 / Math.PI)
        ).toFixed(2)
    } else {
        angle_count = NaN
    }

    health_counter.innerHTML    = "health: " + player.health
    ammo_counter.innerHTML      = "ammo:   " + player.ammunition

    class_counter.innerHTML     = "class: " + player.m_class
    x_pos_counter.innerHTML     = "x pos: " + player.x_position.toFixed(2)
    y_pos_counter.innerHTML     = "y pos: " + player.y_position.toFixed(2)
    speed_counter.innerHTML     = "speed: " + speed_count
    angle_counter.innerHTML     = "angle: " + angle_count

    enemy_counter.innerHTML     = "enemies: " + enemy_count

    if(player.health > 50)          { health_counter.className = "green" }
    else if(player.health <= 10)    { health_counter.className = "red" }
    else                            { health_counter.className = "yellow" }

    setTimeout(game_loop, game_tick)
}

window.onload = () => {
    let loading_screen  = get("loading-screen")
    let loading_bar     = get("spinning")
    let loading_message = get("message")

    fade_out(loading_bar, fade_delay)
    fade_out(loading_message, fade_delay)
    fade_out(loading_screen, fade_delay, fade_delay)

    setTimeout(() => {
            loading_bar.remove()
            loading_message.remove()
        }, fade_delay
    )

    setTimeout(() => {
        loading_screen.remove()
    }, fade_delay * 2)

    setTimeout(game_loop, fade_delay)

    board           = get("board")
    info_panel      = get("info-panel")
    health_counter  = get("health-counter")
    ammo_counter    = get("ammo-counter")
    class_counter   = get("class-counter")
    x_pos_counter   = get("x-pos-counter")
    y_pos_counter   = get("y-pos-counter")
    speed_counter   = get("speed-counter")
    angle_counter   = get("angle-counter")
    enemy_counter   = get("enemy-counter")
    movable_helper  = get("movable-helper")
    player          = new Movable("player")

    game_loop()
}

function handle_key(k, start_move) {
    switch(k) {
        case "w":
        case "ArrowUp":     move_up     = start_move;
        break

        case "a":
        case "ArrowLeft":   move_left   = start_move;
        break

        case "s":
        case "ArrowDown":   move_down   = start_move;
        break

        case "d":
        case "ArrowRight":  move_right  = start_move;
        break
    }
}

onkeydown = (e) => {
    if(is_paused) {
        if(text_box == document.activeElement) {
            if(e.key == "Enter") {
                text_box.blur()
                command = text_box.value
                text_box.value = ""
                text_box.focus()

                if(command == "") {
                    text_box.blur()
                    toggle_pause()
                }
            } else if(e.key == " " && text_box.value == "") {
                text_box.blur()
                toggle_pause()
            }

            return
        } else if(e.key == "Enter") {
            toggle_pause()
        }
    }

    if(e.key == " ")    { toggle_pause() }
    else if(!is_paused) { handle_key(e.key, true) }
}

onkeyup = (e) => { handle_key(e.key, false) }

ontouchstart = (e) => {
    if(is_paused) { return }

    last_swipe_x = e.touches[0].pageX
    last_swipe_y = e.touches[0].pageY
}

ontouchmove = (e) => {
    if(is_paused) { return }

    let new_swipe_x = e.touches[0].pageX
    let new_swipe_y = e.touches[0].pageY
    let diff_x      = new_swipe_x - last_swipe_x
    let diff_y      = new_swipe_y - last_swipe_y

    if( Math.abs(diff_x) < touch_threshold &&
        Math.abs(diff_y) < touch_threshold) { return }

    let angle = Math.atan2(diff_y, diff_x)

    player.move(
        clamp(
            Math.cos(angle) * Math.abs(diff_x) * touch_sensitivity,
            player.move_speed
        ),

        clamp(
            Math.sin(angle) * Math.abs(diff_y) * touch_sensitivity,
            player.move_speed
        )
    )

    last_swipe_x = new_swipe_x
    last_swipe_y = new_swipe_y
}

var pause_screen, text_box

is_paused           = false
wave_is_spawning    = true

fade_delay  = 200

move_up     = false
move_down   = false
move_left   = false
move_right  = false

enemy_count                 = 0
enemy_spawn_cap             = 75
current_enemy_spawn_timer   = -200
enemy_spawn_delay           = 10

follow_distance     = 7
follow_ease         = 50

leave_distance      = 0.7
leave_ease          = 5

touch_sensitivity   = 0.3
touch_threshold     = 5

game_tick = 25
