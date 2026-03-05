// src/game/fireController.js
export function getFireInterval(baseInterval, skillStats) {
  return baseInterval * (1 - (skillStats.intervalReduce || 0))
}
