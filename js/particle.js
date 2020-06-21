import { Point } from "./point.js";
import { Vector, VectorE } from "./vector.js";
class Particles {
  constructor(particles) {
    this.particles = particles;
    this.count = 0;
    this.showBool = true;
    this.removeBool = false;
    this.removeCount = 0;
    this.showCount = 0;

    let len = this.particles.length;
    this.positions = new Float32Array(len * 2);
    this.colors = new Float32Array(len * 4);
    this.sizes = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      this.particles[i].bufferDataPos(this.positions, i * 2);
      this.particles[i].bufferDataColor(this.colors, i * 4);
      this.particles[i].bufferDataSize(this.sizes, i);
      this.particles[i].onremove = () => {
        this.removeCount++;
        if (this.removeCount >= len) {
          this.onremove && this.onremove();
        }
      };
    }
  }

  show(particlesData, speed = 100, swing = 10) {
    if (this.showBool) {
      this.showCount += speed;
      this.showCount = Math.min(this.showCount, this.particles.length);
      while (this.count < this.showCount) {
        let temp = this.particles[this.count];
        let tt = (swing * this.count) / this.particles.length;
        let direct = 2 * Math.PI * tt;
        let radius = 10;
        temp.pos[0] = -particlesData.width * 0.5 + (particlesData.width * this.count) / this.particles.length;
        temp.pos[1] = +Math.sin(direct) * radius;
        temp.changeDisplay("active");
        this.count++;
      }
      if (this.count >= this.particles.length) {
        this.showBool = false;
      }
    }
  }
  remove() {
    if (!this.removeBool) {
      this.showBool = false;
      this.removeBool = true;
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].changeDisplay("remove");
      }
    }
  }
  update() {
    for (let i = 0; i < this.particles.length; i++) {
      if (this.particles[i].display != "fixed") {
        this.particles[i].update();
        this.particles[i].updateDataPos(this.positions);
        this.particles[i].updateDataColor(this.colors);
        this.particles[i].updateDataSize(this.sizes);
      }
    }
  }
}

class Particle {
  constructor(originalPos, originalColor) {
    this.pointIndex = 0;
    this.colorIndex = 0;
    this.sizeIndex = 0;
    this.velocity_direct = Math.PI * Math.random() * 2;
    this.velocity_weight = Math.random() * 0.5 + 1;
    this.friction = 0.94;
    this.velocity = [
      Math.cos(this.velocity_direct) * this.velocity_weight,
      Math.sin(this.velocity_direct) * this.velocity_weight,
    ];

    this.originalPos = originalPos !== undefined ? originalPos : [0, 0];
    this.pos = [0, 0]; //[...this.originalPos];

    this.originalColor = originalColor !== undefined ? originalColor : [1, 1, 1, 1];
    this.color = [...this.originalColor];
    this.size = 1;

    this.showspan = Math.round(Math.random() * 50 + 50);
    this.maxshow = this.showspan;

    this.removespan = Math.round(Math.random() * 60 + 60);
    this.maxremove = this.removespan;

    this.display = "hide";
  }

  //onremove() {}
  changeDisplay(index) {
    if (this.display !== index) {
      this.display = index;
      if (this.display == "hide") {
        this.color = [0, 0, 0, 0];
      } else if (this.display == "fixed") {
      } else if (this.display == "active") {
        this.color = this.originalColor;
      } else if (this.display == "remove") {
        this.velocity_direct = Math.PI * Math.random() * 2;
        this.velocity_weight = Math.random() * 1.5 + 3;
        VectorE.set(this.velocity, [
          Math.cos(this.velocity_direct) * this.velocity_weight,
          Math.sin(this.velocity_direct) * this.velocity_weight,
        ]);
      }
    }
  }
  update() {
    if (this.display == "active") {
      const v = Point.getVector(this.pos, this.originalPos);
      const rr = Vector.length(v);
      const t = this.showspan / this.maxshow;

      VectorE.add(this.pos, Point.toPosRate(v, this.velocity, t));
      if (rr > 10) {
        VectorE.scale(v, 1 / rr);
      } else if (rr >= 1) {
        VectorE.scale(v, 1 / rr / rr);
      }
      VectorE.add(this.velocity, v);
      VectorE.scale(this.velocity, this.friction);
      if (rr <= 20) {
        VectorE.scale(this.velocity, Math.max(0.9, rr / 20));
      }

      const vrr = Vector.length(this.velocity);
      /*if (vrr > 30) {
        VectorE.scale(this.velocity, 30 / vrr);
      }*/
      this.size = Math.min(2, Math.max(1, rr / 10));
      if (rr <= 3 * 2 && vrr < 3) {
        this.showspan > 0 && this.showspan--;
        if (this.showspan <= 0) {
          VectorE.set(this.velocity, [0, 0]);
          VectorE.set(this.pos, this.originalPos);
          this.changeDisplay("fixed");
        }
      }
    } else if (this.display == "remove") {
      if (this.removespan <= 0) return;
      VectorE.add(this.pos, this.velocity);
      VectorE.add(this.velocity, [0, 0.0981]);
      this.color = [...this.originalColor.slice(0, -1), this.removespan / this.maxremove];
      this.removespan > 0 && this.removespan--;
      if (this.removespan <= 0) {
        this.onremove && this.onremove();
      }
    }
  }
  updateDataPos(array) {
    if (this.pointIndex !== undefined) {
      array[this.pointIndex] = this.pos[0];
      array[this.pointIndex + 1] = this.pos[1];
    }
  }
  bufferDataPos(array, index) {
    this.pointIndex = index;
    this.updateDataPos(array);
  }
  updateDataColor(array) {
    if (this.colorIndex !== undefined) {
      array[this.colorIndex] = this.color[0];
      array[this.colorIndex + 1] = this.color[1];
      array[this.colorIndex + 2] = this.color[2];
      array[this.colorIndex + 3] = this.color[3];
    }
  }
  bufferDataColor(array, index) {
    this.colorIndex = index;
    this.updateDataColor(array);
  }

  updateDataSize(array) {
    if (this.sizeIndex !== undefined) {
      array[this.sizeIndex] = this.size;
    }
  }
  bufferDataSize(array, index) {
    this.sizeIndex = index;
    this.updateDataSize(array);
  }
}

export { Particle, Particles };
