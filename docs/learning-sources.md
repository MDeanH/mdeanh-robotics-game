# Lesson evidence

Checked 2026-10-28. These are primary educational or manufacturer sources opened during implementation. Status is **documentation checked**, not hardware verified. The game’s scenes and puzzles are illustrative models.

## Sensors

[Arduino Education: Trash Can Project](https://www.arduino.cc/education/smart-trash-can) describes ultrasonic sensing by sending sound and waiting for its reflection. It supports the beginner lesson that a distance sensor supplies a measurement. The game’s three-lane scan is an abstract view of sensing, not a claim that one fixed sensor measures an entire scene.

## Motors

[Raspberry Pi Learning: Going Straight with PID, source introduction](https://raw.githubusercontent.com/raspberrypilearning/robotPID/master/en/step_1.md) explains that a faster right wheel makes a two-wheel robot arc left, and vice versa. It also describes real motor mismatch, which the ideal game model omits.

[Raspberry Pi: obstacle-avoiding Pico W car](https://www.raspberrypi.com/news/raspberry-pi-pico-w-taught-this-car-to-avoid-objects/) describes the driver as controlling wheel motor direction and speed. The page was opened directly; its documented example is not a hardware test performed for this project.

## Controllers

[Raspberry Pi: Microcontroller chips](https://www.raspberrypi.com/documentation/microcontrollers/microcontroller-chips.html) describes embedded control tasks, sensor input, and configurable input/output. It supports the lesson that a controller executes a program and handles signals.

[Raspberry Pi computer hardware: GPIO](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio) distinguishes control signals from motor power and specifies using a motor driver. The game represents this relationship; it does not teach direct motor-to-controller wiring.

## Power

[Arduino: Transistor Motor Control, maintained source](https://raw.githubusercontent.com/arduino/docs-content/main/content/learn/04.electronics/09.transistor-motor-control/09.transistor-motor-control.md) shows a battery-powered motor path completed through a switching component to the return connection. It supports the closed-path concept in the power puzzle.

The main Arduino Docs page was also opened, but its dynamic content did not render in the text browser; the maintained Arduino repository source above supplied the actual text. Some external project pages required JavaScript and were not used as sole evidence.

## Limits

- No physical robot or component was tested for this educational game.
- The lessons introduce component roles and simple logic, rather than wiring instructions or exact circuit values.
- Real distance sensing has range, surface, geometry, and timing limits. The game simplifies those effects.
- Real driving includes motor variation and wheel slip. The game’s movement rules are idealized.
