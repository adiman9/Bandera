class GamePlatform {
  constructor (width, height, domId) {
    this.width = width;
    this.height = height;
    this.container = document.getElementById(domId);
    this.onDrawSubs = [];
    this.onClickSubs = [];
    this.kill_game = false;
    this.frameCount = 0;
    if (domId) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext("2d");
      this.container.appendChild(this.canvas);
    } else {
      console.log('NOT IMPLEMENTED');
      throw new Error('Not implemented');
    }
    this.setup();
  }
  setup() {
    this.canvas.addEventListener('click', (event) => {
      this.onClickSubs.forEach(fn => {
        fn(event, this);
      });
    });
  }
  setBackground(r, g, b) {
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  onClick(fn) {
    this.onClickSubs.push(fn);

    return () => {
      const index = this.onClickSubs.indexOf(fn);
      this.onClickSubs.splice(index, 1);
    }
  }
  onDraw(fn) {
    this.onDrawSubs.push(fn);

    return () => {
      const index = this.onDrawSubs.indexOf(fn);
      this.onDrawSubs.splice(index, 1);
    }
  }
  kill() {
    this.kill_game = true;
  }
  run() {
    if (this.frameCount === 0) {
      this.startTime = new Date().getTime();
    }
    requestAnimationFrame(() => {
      this.frameCount++;
      const currentTime = new Date().getTime();
      this.frameRate = this.frameCount / ((currentTime - this.startTime) / 1000);
      this.onDrawSubs.forEach(fn => {
        fn(this);
      });
      if (!this.kill_game) {
        setTimeout(() => {
          this.run();
        }, 0);
      }
    });
  }
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vec) {
    this.x = vec.x + this.x;
    this.y = vec.y + this.y;
  }
  sub(vec) {
    this.x = vec.x - this.x;
    this.y = vec.y - this.y;
  }
  static random(upx, lowx, upy, lowy) {
    const diffx = upx - lowx;
    const diffy = upy - lowy;
    const x = Math.floor(Math.random() * diffx) + lowx;
    const y = Math.floor(Math.random() * diffy) + lowy;
    return new Vector(x, y);
  }
}

class Particle {
  constructor(x, y, x_size, y_size, vel) {
    this.size_x = x_size;
    this.size_y = y_size;
    this.pos = new Vector(x, y);
    this.velocity = vel;
    this.acceleration = new Vector(0, 0);
    this.wrap = false;
  }
  update(platform) {
    this.pos.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.acceleration = new Vector(0, 0);
    if (this.wrap) {
      if (this.pos.x > platform.width) {
        this.pos.x = 0;
      } else if (this.pos.x < 0) {
        this.pos.x = platform.width;
      }
      if (this.pos.y > platform.height) {
        this.pos.y = 0;
      } else if (this.pos.y < 0) {
        this.pos.y = platform.height;
      }
    }
  }
  setWrap(wrap) {
    this.wrap = wrap;
  }
  show(platform) {
    platform.ctx.fillStyle = `rgb(255, 255, 255)`;
    platform.ctx.fillRect(this.pos.x, this.pos.y, this.size_x, this.size_y);
  }
}

class Square extends Particle {
  constructor(x, y, size, vel) {
    super(x, y, size, size, vel);
  }
}

const world = new GamePlatform(500, 500, 'platform');
world.setBackground(0, 0, 0);
const particle = new Square(100, 100, 10, new Vector(5, 1));
const particle2 = new Particle(200, 200, 10, 25, new Vector(5, 1));
particle.setWrap(true);
particle2.setWrap(true);

const particles = [particle, particle2];

world.onClick((event, platform) => {
  const x = Math.floor(Math.random() * platform.width);
  const y = Math.floor(Math.random() * platform.height);
  const size = Math.floor(Math.random() * 15) + 5;
  const vel = Vector.random(6, -6, 6, -6);
  const particle = new Square(x, y, size, vel);
  particle.setWrap(true);
  particles.push(particle);
});

world.onDraw((platform) => {
  platform.setBackground(0, 0, 0);

  particles.forEach(part => {
    part.update(platform);
    part.show(platform);
  });
});

