/** Beginner lesson copy. Documentation sources: docs/learning-sources.md. */
export const MODULES = [
  {
    id: 'sensors',
    name: 'Sensors',
    part: 'Perception sensors',
    tagline: 'See beyond the obvious',
    description: 'Scan the arena to locate four hidden components. Avoid rogue training bots, collect your discoveries, and bring them back to the home dock.',
    challenge: 'Sensor sweep',
    skill: 'Sensing the world',
    learned: 'A distance sensor provides measurements that a controller can use to choose what the robot does next.',
    notebook: [
      'Sensors turn something in the world into a signal a controller can read.',
      'One example: an ultrasonic distance sensor measures using sound pulses and their echoes.',
      'A measurement is an input. The robot still needs a program to decide what to do.'
    ],
    xp: 100,
    color: 'teal'
  },
  {
    id: 'motors',
    name: 'Motors',
    part: 'Joint actuators',
    tagline: 'Find your momentum',
    description: 'Navigate the test arena, chain pickups, and activate turbo to collect four drive components. Make a clean return to the home dock.',
    challenge: 'Velocity trial',
    skill: 'Motion & actuation',
    learned: 'Changing the two wheel speeds lets a two-wheel robot move straight, turn, or stop.',
    notebook: [
      'An electric motor changes electrical energy into movement.',
      'On a two-wheel robot, the wheel-speed difference changes its direction.',
      'The game uses an ideal motion model. Real wheels can slip or turn at slightly different speeds.'
    ],
    xp: 100,
    color: 'orange'
  },
  {
    id: 'controllers',
    name: 'Controllers',
    part: 'Robot controller',
    tagline: 'Think one step ahead',
    description: 'Reach four checkpoints in sequence while avoiding training bots. Use your pulse to make space, then bring your robot back to the dock.',
    challenge: 'Sequence sprint',
    skill: 'Sequences & logic',
    learned: 'A controller runs a program: it can read inputs, follow instructions, and send output signals.',
    notebook: [
      'A robot controller runs the program and handles input and output signals.',
      'Instruction order matters: turn, then move is different from move, then turn.',
      'A motor driver uses the controller’s signals to control motor power.'
    ],
    xp: 100,
    color: 'blue'
  },
  {
    id: 'power',
    name: 'Power',
    part: 'Battery pack',
    tagline: 'Power every possibility',
    description: 'Deliver energy cells to three charging stations. Deploy your shield to navigate training bots, restore power, and return to your home dock.',
    challenge: 'Energy relay',
    skill: 'Circuits & energy',
    learned: 'A battery supplies energy, and the motor’s circuit needs a complete path back to the battery.',
    notebook: [
      'A battery supplies electrical energy to the robot’s circuit.',
      'A complete motor circuit includes a path from the battery, through the motor, and back.',
      'An open switch breaks the path. A closed switch completes it.'
    ],
    xp: 100,
    color: 'gold'
  }
];

export function getModule(id) {
  return MODULES.find(module => module.id === id);
}
