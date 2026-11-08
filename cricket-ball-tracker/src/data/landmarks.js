export const PITCH = {
  stumpToStump: 20.12,   // m, 22 yards
  stumpHeight: 0.711,    // m
  stumpWidth: 0.2286,    // m
  creaseWidth: 2.64,     // m, bowling crease length
  poppingOffset: 1.22,   // m, popping crease in front of bowling crease
  ballDiameter: 0.072,   // m, used as a size prior
  ballRadius: 0.036,
};

export const LANDMARK_DEFINITIONS = {
  sideOn: [
    { id: 1, name: 'Bowler stump base', plane: [0, 0], desc: 'Base of middle stump at bowler end (0m, 0m)' },
    { id: 2, name: 'Bowler stump top', plane: [0, 0.711], desc: 'Top of middle stump at bowler end (0m, 0.711m)' },
    { id: 3, name: 'Striker stump base', plane: [20.12, 0], desc: 'Base of middle stump at striker end (20.12m, 0m)' },
    { id: 4, name: 'Striker stump top', plane: [20.12, 0.711], desc: 'Top of middle stump at striker end (20.12m, 0.711m)' },
  ],
  behindArm: [
    { id: 1, name: 'Bowler crease left', plane: [0, 0], desc: 'Bowler return crease left corner (0m, 0m)' },
    { id: 2, name: 'Bowler crease right', plane: [0, 2.64], desc: 'Bowler return crease right corner (0m, 2.64m)' },
    { id: 3, name: 'Striker crease right', plane: [20.12, 2.64], desc: 'Striker return crease right corner (20.12m, 2.64m)' },
    { id: 4, name: 'Striker crease left', plane: [20.12, 0], desc: 'Striker return crease left corner (20.12m, 0m)' },
  ],
};
