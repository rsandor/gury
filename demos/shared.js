/*
 * gury - A jQuery inspired canvas utility library
 * By Ryan Sandor Richards
 *
 * shared.js
 * Some nice shared classes for use with the demos.
 */

/*
 * Some color functions
 */
function rgbToHSV(r, g, b) {
  var m = Math.min(r, g, b);
  var M = Math.max(r, g, b);
  var C = M - m;

  var H = 60, S, V = M;

  if (C == 0) H *= 0;
  else if (M == r) H *= ((g-b)/C) % 6;
  else if (M == g) H *= (b-r)/C + 2;
  else H *= (r-g)/C + 4;

  S = C / V;
  return {h: H, s: S, v: V};
}

function hsvToRGB(c) {
  var t;
  var h = c.h, s = c.s, v = c.v;
  var C = v * s, Hp = h/60, X = C*(1 - Math.abs(Hp % 2 - 1));
  var m = v - C;

  if (h == 0) t = [0, 0, 0];
  else if (Hp < 1) t = [C, X, 0];
  else if (Hp < 2) t = [X, C, 0];
  else if (Hp < 3) t = [0, C, X];
  else if (hp < 4) t = [0, X, C];
  else if (Hp < 5) t = [X, 0, C];
  else t = [C, 0, X];

  return {r: t[0] + m, g: t[1] + m, b: t[2] + m};
}

/*
 * Shape Base Class
 */
function Shape(x, y, s, options) {
  var defaultOptions = {
    color: '#a00',
    highlight: '#cfc',
    theta: 0,
    dx: 0,
    dy: 0,
    dTheta: 0
  };
  
  this.x = x || 0;
  this.y = y || 0;
  this.size = s || 32;
  
  options = options || {};
  for (var k in defaultOptions) {
    if (options[k]) {
      this[k] = options[k];
    }
    else {
      this[k] = defaultOptions[k];
    }
  }
}

Shape.prototype = {
  // Actual drawing method DO NOT OVERRIDE
  draw: function(ctx, canvas) {
    ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.theta);
      ctx.fillStyle = this.color;
      this.render(ctx, canvas);
    ctx.restore();
  },
  
  
  // Put shape specific code here...
  render: function(ctx, canvas) {},
  
  update: function() {
    this.x += this.dx;
    this.y += this.dy;
    this.theta += this.dTheta;
  },
  
  toggleHover: function() {
    var c = this.color;
    this.color = this.highlight;
    this.highlight = c;
  }
};

/*
 * For drawing squares
 */
function Box() {
  Shape.apply(this, arguments);
  this.render = function(ctx, canvas) {
    var s = this.size;
    var s2 = s / 2;
    ctx.fillRect(-s2, -s2, s, s);
  };
}
Box.prototype = new Shape();

/*
 * For drawing circles
 */
function Circle() {
  Shape.apply(this, arguments);
  this.render = function(ctx, canvas) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI, true);
    ctx.fill();
  };
}
Circle.prototype = new Shape();
