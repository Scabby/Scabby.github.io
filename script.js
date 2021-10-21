function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function screen_area_x(element) { return window.innerWidth - element.offsetWidth }
function screen_area_y(element) { return window.innerHeight - element.offsetHeight }

function clamp(n, max) {
    if(n < -max)    { return -max }
    if(n > max)     { return max }
    return n
}

function found_class(element, name) {
    let names = element.className
    let index = names.indexOf(name)

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
    let fade_animation = element.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], { duration: duration, delay: delay })

    if(fading_out.includes(element))    { return }
    else                                { fading_out.push(element) }

    setTimeout(() => {
        if(!fading_out.includes(element)) {
            fade_animation.cancel()
            return
        }

        add_class(element, "hidden")
    }, duration)
}

function fade_in(element, duration = fade_delay, delay = 0) {
    let fade_animation = element.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], { duration: duration, delay: delay })

    if(fading_out.includes(element)) {
        fading_out.splice(
            fading_out.indexOf(element),
            1
        )
    }

    setTimeout(() => {
        if(fading_out.includes(element)) {
            fade_animation.cancel()
            return
        }

        remove_class(element, "hidden")
    }, duration)
}


function toggle_pause() {
    let animations = document.getAnimations()

    if(pause_screen_is_hidden) {
        animations.forEach(animation => animation.pause())

        if(!info_panel_is_hidden) { fade_out(info_panel) }

        info_button.disabled = true

        fade_in(pause_screen)
        fade_out(info_button)

        setTimeout(() => {
            text_box.disabled           = false
            text_box_button.disabled    = false
            text_box.focus()
        }, 10)

        is_paused = true
    } else {
        animations.forEach(animation => animation.play())

        if(!info_panel_is_hidden) { fade_in(info_panel) }

        fade_out(pause_screen)
        fade_in(info_button)

        text_box.disabled           = true
        text_box_button.disabled    = true
        text_box.blur()

        setTimeout(() => {
            info_button.disabled = false

            text_box.className = ""
            is_paused = false
        }, fade_delay)
    }

    pause_screen_is_hidden = !pause_screen_is_hidden
}

function toggle_info_panel() {
    if(info_panel_is_hidden)    { fade_in(info_panel) }
    else                        { fade_out(info_panel) }
    info_panel_is_hidden = !info_panel_is_hidden
}

function toggle_help_panel() {
    let help_height = help_panel.offsetHeight
    let box_height = text_box_container.offsetHeight

    let menu_bar_space = "(var(--size) * 3.5)"
    let margin = "((100% - " + help_height + "px - " + box_height + "px) / 3)"

    let min_box_top     = "(var(--size) + " + menu_bar_space + ")"
    let min_help_top    = "calc(var(--size) + " + min_box_top + " + " + box_height + "px)"

    let box_top     = "max(" + min_box_top + ", calc(" + margin + "))"
    let help_top    = "max(" + min_help_top + ", calc((" + margin + " * 2) + var(--size) * 2.5))"

    if(help_panel_is_hidden) {
        fade_in(help_panel)

        text_box_container.animate([
            { top: text_box_container.offsetTop },
            { top: box_top }
        ], { duration:fade_delay })

        help_panel_container.animate([
            { top: "100%" },
            { top: help_top }
        ], { duration: fade_delay })

        setTimeout(() => {
            text_box_container.style.top    = box_top
            help_panel_container.style.top  = help_top
            pause_screen.style.overflow     = "auto"
        }, fade_delay )
    } else {
        fade_out(help_panel)

        text_box_container.style.top    = ""
        help_panel_container.style.top  = ""
        pause_screen.style.overflow     = "hidden"

        text_box_container.animate([
            { top: box_top },
            { top: text_box_container.offsetTop }
        ], { duration:fade_delay })

        help_panel_container.animate([
            { top: help_top },
            { top: "100%" }
        ], { duration: fade_delay })
    }

    help_panel_is_hidden = !help_panel_is_hidden
}



movable_instances = []

class Movable {
    constructor(
        id,
        x_position      = screen_area_x(movable_helper) / 2,
        y_position      = screen_area_y(movable_helper) / 2,
        x_velocity      = 0,
        y_velocity      = 0,
        health          = 100,
        max_health      = 100,
        ammunition      = 10,
        max_ammunition  = 10,
        m_class         = "default",
        fire_rate       = 1,
        friction        = 0.15,
        move_speed      = 1.1,
        is_alive        = true
    ) {
        this.element = make("div")
        this.element.className  = "movable " + m_class
        this.element.id         = id
        board.appendChild(this.element)

        if(is_paused) {
            this.element.getAnimations().forEach(a => a.pause())
        }

        this.x_position             = x_position
        this.y_position             = y_position
        this.previous_x_position    = this.x_position
        this.previous_y_position    = this.y_position
        this.x_velocity             = x_velocity
        this.y_velocity             = y_velocity
        this.health                 = health
        this.last_health            = health
        this.max_health             = max_health
        this.ammunition             = ammunition
        this.max_ammunition         = max_ammunition
        this.m_class                = m_class
        this.fire_rate              = fire_rate
        this.friction               = friction
        this.move_speed             = move_speed
        this.is_alive               = is_alive

        movable_instances.push(this)
    }

    get width()     { return this.element.offsetWidth }
    get height()    { return this.element.offsetHeight }

    update() {
        if(this.health <= 0) {
            if(this.is_alive) {
                this.is_alive = false

                add_class(this.element, "dead")

                this.element.animate([
                    { background_color: window.getComputedStyle(this.element).background_color },
                    { background_color: "var(--grey)" }
                ], { duration: fade_delay })
            }
        } else {
            if(!this.is_alive) {
                this.is_alive = true

                remove_class(this.element, "dead")

                this.element.animate([
                    { background_color: "var(--grey)" },
                    { background_color: window.getComputedStyle(this.element).background_color }
                ], { duration: fade_delay })
            }
        }

        if(this.last_health != this.health) {
            this.element.style = "filter: saturate(" + this.health + "%)"

            this.element.animate([
                { filter: "saturate(" + this.last_health + "%)" },
                { filter: "saturate(" + this.health + "%)" }
            ], { duration: fade_delay })
        }

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

        this.last_health = this.health
    }

    get_force_toward(target) {
        function curve(distance, move_speed) {
            return Math.atan(
                Math.pow(
                    (distance - (follow_distance * (width_sum / 2))) / follow_ease,
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
                    Math.pow(distance /(leave_distance * (width_sum / 2)),
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

    heal(amount)    { this.health += amount }
    harm(amount)    { this.health -= amount }
    kill()          { this.health = 0}
    revive()        { this.health = this.max_health }

    give_ammo(amount)   { this.ammo += amount }
    take_ammo(amount)   { this.ammo -= amount }

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
    enemy_count = 0

    for(let current of movable_instances) {
        let new_x_move_force = 0
        let new_y_move_force = 0

        function add_force(force) {
            let [x, y] = force
            new_x_move_force += x
            new_y_move_force += y
        }

        if(current.element.id == "enemy" && current.is_alive && player.is_alive) {
            enemy_count++
            add_force(current.get_force_toward(player))
        }

        for(let target of movable_instances) {
            if(current == target) { continue }

            if( current.element.id == "enemy" &&
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

                let average_x_vel   = (target.x_velocity + current.x_velocity) / 2
                let average_y_vel   = (target.y_velocity + current.y_velocity) / 2

                current.x_velocity  = average_x_vel - average_x_vel * 0.1
                current.y_velocity  = average_y_vel - average_y_vel * 0.1
                target.x_velocity   = average_x_vel + average_x_vel * 0.1
                target.y_velocity   = average_y_vel + average_y_vel * 0.1
            }
        }

        current.x_velocity += clamp(new_x_move_force, current.move_speed)
        current.y_velocity += clamp(new_y_move_force, current.move_speed)
    }

    for(const e of movable_instances) {
        e.update()
    }
}

function physics_loop() {
    let start_tick = performance.now()

    if(is_paused) {
        setTimeout(physics_loop, game_tick)
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

        if(enemy_count == enemy_spawn_cap) {
            wave_is_spawning = false
        }
    }

    if(current_enemy_spawn_timer <= enemy_spawn_delay) {
        current_enemy_spawn_timer++
    }

    if(player.is_alive) {
        if((move_up || move_down) && (move_left || move_right)) {
            let x = player.move_speed
            let y = player.move_speed

            let angle = Math.atan2(y, x)

            if(move_up)     { y = -y }
            if(move_left)   { x = -x }

            player.move(Math.cos(angle) * x, Math.sin(angle) * y)
        } else {
            if(move_up)     { player.move(0, -player.move_speed) }
            if(move_down)   { player.move(0, player.move_speed) }
            if(move_left)   { player.move(-player.move_speed, 0) }
            if(move_right)  { player.move(player.move_speed, 0) }
        }
    }

    update_all()

    last_tick = performance.now() - start_tick

    setTimeout(physics_loop, game_tick - last_tick)
}

function update_info_panel() {
    if(last_tick > game_tick * 1.1 && wave_is_spawning) {
        wave_is_spawning = false
    }

    if(info_panel_is_hidden) {
        return
    }

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
        angle_count = "NaN"
    }

    if(last_tick < game_tick) { last_tick = game_tick }

    health_counter.innerHTML    = "health:    " + player.health
    ammo_counter.innerHTML      = "ammo:      " + player.ammunition

    class_counter.innerHTML     = "class:     " + player.m_class
    x_pos_counter.innerHTML     = "x pos:     " + player.x_position.toFixed(2)
    y_pos_counter.innerHTML     = "y pos:     " + player.y_position.toFixed(2)
    speed_counter.innerHTML     = "speed:     " + speed_count
    angle_counter.innerHTML     = "angle:     " + angle_count

    enemy_counter.innerHTML     = "enemies:   " + enemy_count
    element_counter.innerHTML   = "elements:  " + movable_instances.length
    tps_counter.innerHTML       = "tps:       " + Math.floor(1000 / last_tick)

    if(player.health > 75)          { health_counter.className = "green" }
    else if(player.health > 50)     { health_counter.className = "yellow" }
    else if(player.health > 25)     { health_counter.className = "orange" }
    else if(player.health > 0)      { health_counter.className = "red" }
    else                            { health_counter.className = "pre-white" }

    if(last_tick > game_tick * 2)           { tps_counter.className = "red"}
    else if(last_tick > game_tick * 1.5)    { tps_counter.className = "orange" }
    else if(last_tick > game_tick * 1.125)  { tps_counter.className = "yellow" }
    else                                    { tps_counter.className = "green" }
}

function render_loop() {
    if(is_paused) {
        requestAnimationFrame(render_loop)
        return
    }

    update_info_panel()

    requestAnimationFrame(render_loop)
}

window.onload = () => {
    let loading_screen  = get("loading-screen")
    let loading_bar     = get("spinning")
    let loading_message = get("message")

    board = get("board")

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

    setTimeout(() => {
        physics_loop()
        render_loop()
    }, fade_delay)

    pause_screen            = get("pause-screen")
    text_box_container      = get("text-box-container")
    text_box                = get("text-box")
    text_box_button         = get("text-box-button")
    help_panel              = get("help-panel")
    help_panel_container    = get("help-panel-container")

    text_box_button.onclick = () => {
        text_box.focus()
        toggle_help_panel()
    }

    text_box.disabled           = true
    text_box_button.disabled    = true

    pause_button    = get("toggle-pause")
    pause_button.onclick = () => toggle_pause()

    info_button     = get("toggle-info")
    info_button.onclick = () => toggle_info_panel()

    info_panel      = get("info-panel")
    health_counter  = get("health-counter")
    ammo_counter    = get("ammo-counter")
    class_counter   = get("class-counter")
    x_pos_counter   = get("x-pos-counter")
    y_pos_counter   = get("y-pos-counter")
    speed_counter   = get("speed-counter")
    angle_counter   = get("angle-counter")
    enemy_counter   = get("enemy-counter")
    element_counter = get("element-counter")
    tps_counter     = get("ticks-per-second-counter")

    movable_helper  = get("movable-helper")
    player          = new Movable(
        "player",
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined,
        1.5
    )
}

function test_command(args) {
    for(i = args.length; i > 0; i--) {
        if(args[i] == "" || args[i] == " ") {
            args.splice(i, 1)
        }
    }

    function is_count_bad(count) {
        if(count == null) { return false }
        return count != "all" && isNaN(count)
    }


    let arg_len = args.length
    let arg_count
    let are_args_bad

    switch(args[0]) {
        case "spawn":
            arg_count       = 3
            are_args_bad    = is_count_bad(args[1]) || (
                                args[2] != "enemy" &&
                                args[2] != "dummy" &&
                                args[2] != null)
            break

        case "remove":
            arg_count       = 3
            are_args_bad    = is_count_bad(args[1]) || (
                                args[2] != "enemy" &&
                                args[2] != "dummy" &&
                                args[2] != "all" &&
                                args[2] != null)
            break

        case "kill":
        case "revive":
            arg_count = 3
            are_args_bad = is_count_bad(args[1]) || (
                            args[2] != "enemy" &&
                            args[2] != "dummy" &&
                            args[2] != "all" &&
                            args[2] != null)

            if(are_args_bad && args[1] == "self") {
                arg_count = 2
                are_args_bad = false
            }
            break

        case "heal":
        case "harm":
            arg_count       = 3
            are_args_bad    = isNaN(args[1]) || is_count_bad(args[2])
            break

        default: return "red"
    }

    if(are_args_bad)                { return "red" }
    else if(arg_len != arg_count)   { return "yellow" }
    else                            { return "green" }
}

function parse_command(args) {
    let end_ind         = movable_instances.length - 1
    let targeting_self  = false
    let targeting_enemy = false
    let targeting_dummy = false
    let targeting_count
    let amount

    switch(args[0]) {
        case "spawn":
        case "remove":
        case "kill":
        case "revive":
            if(args[1] == "all")        { targeting_count = end_ind }
            else if(args[1] == "self")  { targeting_self = true }
            else                        { targeting_count = parseInt(args[1]) }

            switch(args[2]) {
                case "enemy":   targeting_enemy = true; break
                case "dummy":   targeting_dummy = true; break
                case "all":     targeting_enemy = true; targeting_dummy = true; break
            }
            break

        case "heal":
        case "harm":
            amount = parseInt(args[1])

            if(args[2] == "all")        { targeting_count = end_ind }
            else if(args[2] == "self")  { targeting_self = true }
            else                        { targeting_count = parseInt(args[2]) }
    }

    switch(args[0]) {
        case "spawn":
            switch(args[2]) {
                case "enemy":
                case "dummy":
                    for(i = 0; i < targeting_count; i++) {
                        new Movable(args[2])
                    }
                    break
            }
            break

        case "remove":
            for(i = 0; i < targeting_count && i <= end_ind; i++) {
                let current = movable_instances[i]

                if(current == player ||
                    (!targeting_enemy && current.id == "enemy") &&
                    (!targeting_dummy && current.id == "dummy")
                ) {
                    targeting_count++
                } else {
                    movable_instances[i].element.remove()
                    movable_instances.splice(i, 1)
                    i--
                    targeting_count--
                    end_ind--
                }
            }
            break

        case "kill":
            if(targeting_self) {
                player.kill()
                break
            }

            for(i = end_ind; i > end_ind - targeting_count && i > 0; i--) {
                let current = movable_instances[i]

                if(current == player ||
                    (!targeting_enemy && current.id == "enemy") &&
                    (!targeting_dummy && current.id == "dummy")
                ) {
                    targeting_count--
                } else if(current.is_alive) { current.kill() }
                else                        { targeting_count++ }
            }
            break


        case "revive":
            if(targeting_self) {
                player.revive()
                break
            }

            for(i = end_ind; i > end_ind - targeting_count && i > 0; i--) {
                let current = movable_instances[i]

                if(current == player ||
                    (!targeting_enemy && current.id == "enemy") &&
                    (!targeting_dummy && current.id == "dummy")
                ) {
                    targeting_count--
                } else if(!current.is_alive)    { current.revive() }
                else                            { targeting_count++ }
            }
            break

        case "harm": amount = -amount
        case "heal":
            if(targeting_self) {
                let final_health = player.health + amount

                if(final_health < 0)                        { player.kill() }
                else if(final_health > player.max_health)   { player.revive() }
                else                                        { player.heal(amount) }
                break
            }

            for(i = end_ind; i > end_ind - targeting_count && i > 0; i--) {
                let current = movable_instances[i]

                if(current == player) { targeting_count++ }
                else {
                    let final_health = current.health + amount

                    if(final_health < 0)                        { current.kill() }
                    else if(final_health > current.max_health)  { current.revive() }
                    else                                        { current.heal(amount) }
                }
            }
            break
    }
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
    let k = e.key
    let is_k_pause_trigger = k == " " || k == "Enter"

    if(k == "Escape") {
        toggle_pause()
        return
    }

    if(is_paused) {
        if(text_box == document.activeElement) {
            text_box.blur()
            text_box.focus()

            if(is_k_pause_trigger && text_box.value == "") {
                toggle_pause()
                return
            }

            setTimeout(() => {
                let args = text_box.value.split(" ")

                if(text_box.value == "") {
                    text_box.className = ""
                    return
                }

                command_score       = test_command(args)
                text_box.className  = command_score

                if(k == "Enter") {
                    if(command_score == "green") {
                        parse_command(args)
                        text_box.value = ""
                    }
                }
            }, 10)

            return
        }
    } else {
        if(k == "i") { toggle_info_panel() }
    }

    handle_key(k, true)
}

onkeyup = (e) => { handle_key(e.key, false) }

ontouchstart = (e) => {
    e.preventDefault()
    if(is_paused) { return }

    last_swipe_x = e.touches[0].pageX
    last_swipe_y = e.touches[0].pageY
}

ontouchmove = (e) => {
    e.preventDefault()
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

is_paused               = false
wave_is_spawning        = true
info_panel_is_hidden    = true
help_panel_is_hidden    = true
pause_screen_is_hidden  = true

fade_delay  = 200

move_up     = false
move_down   = false
move_left   = false
move_right  = false

enemy_count                 = 0
enemy_spawn_cap             = 250
current_enemy_spawn_timer   = -200
enemy_spawn_delay           = 10 // 10

follow_distance     = 15
follow_ease         = 15

leave_distance      = 2.5
leave_ease          = 7

touch_sensitivity   = 0.3
touch_threshold     = 5

game_tick = 16.66
last_tick = game_tick
