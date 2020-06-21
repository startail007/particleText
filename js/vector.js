class Vector {
  static rotate(vector, angle) {
    let cos0 = Math.cos(angle);
    let sin0 = Math.sin(angle);
    return [vector[0] * cos0 - vector[1] * sin0, vector[1] * cos0 + vector[0] * sin0];
  }
  static dot(vector0, vector1) {
    return vector0[0] * vector1[0] + vector0[1] * vector1[1];
  }
  static cross(vector0, vector1) {
    return vector0[0] * vector1[1] - vector0[1] * vector1[0];
  }
  static add(vector0, vector1) {
    return [vector0[0] + vector1[0], vector0[1] + vector1[1]];
  }
  static sub(vector0, vector1) {
    return [vector0[0] - vector1[0], vector0[1] - vector1[1]];
  }
  static projection(vector0, vector1) {
    var rate = Vector.dot(vector0, vector1) / Vector.dot(vector1, vector1);
    return [vector1[0] * rate, vector1[1] * rate];
  }
  static length(vector) {
    return Math.sqrt(Vector.dot(vector, vector));
  }
  static scale(vector, scale) {
    return [vector[0] * scale, vector[1] * scale];
  }
  static collisionCalc(vector1, vector2, mass1, mass2) {
    return Vector.scale(
      Vector.add(Vector.scale(vector1, mass1 - mass2), Vector.scale(vector2, 2 * mass2)),
      1 / (mass1 + mass2)
    );
  }
}
class VectorE {
  static set(vector0, vector1) {
    vector0[0] = vector1[0];
    vector0[1] = vector1[1];
    return vector0;
  }
  static add(vector0, vector1) {
    vector0[0] += vector1[0];
    vector0[1] += vector1[1];
    return vector0;
  }
  static sub(vector0, vector1) {
    vector0[0] -= vector1[0];
    vector0[1] -= vector1[1];
    return vector0;
  }
  static mul(vector0, vector1) {
    vector0[0] *= vector1[0];
    vector0[1] *= vector1[1];
    return vector0;
  }
  static div(vector0, vector1) {
    vector0[0] /= vector1[0];
    vector0[1] /= vector1[1];
    return vector0;
  }
  static scale(vector, scale) {
    vector[0] *= scale;
    vector[1] *= scale;
    return vector;
  }
}
export { Vector, VectorE };
