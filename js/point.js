import { Vector } from "./vector.js";
class Point {
  static toPosRate(pos0, pos1, rate) {
    return [pos0[0] * (1 - rate) + pos1[0] * rate, pos0[1] * (1 - rate) + pos1[1] * rate];
  }
  static cross(pos0, pos1, pos2) {
    return (pos0[0] - pos1[0]) * (pos2[1] - pos1[1]) - (pos2[0] - pos1[0]) * (pos0[1] - pos1[1]);
  }
  static getCenter(pos0, pos1) {
    return [(pos0[0] + pos1[0]) * 0.5, (pos0[1] + pos1[1]) * 0.5];
  }
  static getVector(pos0, pos1) {
    return [pos1[0] - pos0[0], pos1[1] - pos0[1]];
  }
  static addVector(pos, vector) {
    return [pos[0] + vector[0], pos[1] + vector[1]];
  }
  static distance(pos0, pos1) {
    return Vector.length(Point.getVector(pos0, pos1));
  }
}

let getQuadraticCurveTo = function (p0, p1, p2, t) {
  let x = p0[0] * (1 - t) * (1 - t) + 2 * p1[0] * (1 - t) * t + p2[0] * t * t;
  let y = p0[1] * (1 - t) * (1 - t) + 2 * p1[1] * (1 - t) * t + p2[1] * t * t;
  return [x, y];
};
let getQuadraticCurveToTangent = function (p0, p1, p2, t) {
  let x = 2 * t * (p0[0] - p1[0] * 2 + p2[0]) + 2 * (-p0[0] + p1[0]);
  let y = 2 * t * (p0[1] - p1[1] * 2 + p2[1]) + 2 * (-p0[1] + p1[1]);
  return [x, y];
};
export { getQuadraticCurveTo, getQuadraticCurveToTangent, Point };
