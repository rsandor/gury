/*
  gury.js - A jQuery inspired canvas utility library

  Copyright (c) 2010 Ryan Sandor Richards

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
window.$g = (function() {
  /*
   * Core Gury Class
   */
  
  function Gury(canvas) {
    if (canvas == null) {
      canvas = document.createElement('canvas');
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._objects = [];
    this._paused = false;
    this._loop_interval = null;
  }
  
  Gury.prototype.place = function(node) {
    if (typeof node == "string" && typeof $ == "function") {
      $(node).append(this.canvas);
    }
    else if (typeof node == "object" && typeof node.addChild == "function") {
      node.addChild(this.canvas);
    }
    else {
      // Cannot place. Should we have an exception here? Prolly...
    }
    return this;
  };
  
  /*◊
   * Canvas style methods
   */
  
  Gury.prototype.size = function(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    return this;
  };
  
  Gury.prototype.background = function(bg) {
    this.canvas.style.background = bg;
    return this;
  };
  
  /*
   * Objects and Rendering
   */
  
  Gury.prototype.add = function(d) {
    this._objects.push(d);
    return this;
  };
  
  Gury.prototype.draw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var i = 0; i < this._objects.length; i++) {
      var ob = this._objects[i];
      if (typeof ob == "function") {
        ob.call(this, this.ctx);
      }
      else if (typeof ob == "object" && typeof ob.draw != "undefined") {
        ob.draw(this.ctx, this.canvas);
      }
    }
    return this;
  };
  
  /*
   * Animation Controls
   */
  
  Gury.prototype.play = function(interval) {
    var _gury = this;
    this._loop_interval = setInterval(function() {
      if (!_gury._paused) {
        _gury.draw();
      }
    }, interval);
    return this;
  };
  
  Gury.prototype.pause = function() {
    this._paused = !this._paused;
    return this;
  };
  
  Gury.prototype.stop = function() {
    if (this._loop_interval != null) {
      clearInterval(this._loop_interval);
      this._paused = false;
    }
    return this;
  };
  
  /*
   * Public interface
   */
  
  function GuryInterface(id) {
    return new Gury(id ? document.getElementById(id) : null);
  }
  
  return GuryInterface;
})();
