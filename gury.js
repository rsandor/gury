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
window.gury = window.$g = (function() {
  /*
   * Utility functions
   */
  function isObject(v) { return typeof v == "object"; }
  function isFunc(v) { return typeof v == "function"; }
  function isString(v) { return typeof v == "string"; }
  function isObjectOrFunc(v) { return typeof v == "function" || typeof v == "object"; }
  
  /*
   * These handle mappings from Canvas DOM elements to Gury instances
   * to allow for persistant states between calls to the module.
   */
  var guryId = 1;
  var canvasToGury = {};
  
  function nextGuryId() { 
    return "gury_id_" + (guryId++); 
  }
  
  function getGury(canvas) {
    if (!isString(canvas._gury_id) || !(canvasToGury[canvas._gury_id] instanceof Gury)) {
      return null;
    }
    return canvasToGury[canvas._gury_id];
  }
  
  function setGury(canvas, gury) {
    var gid;
    
    if (typeof canvas._gury_id == "string") {
      gid = canvas._gury_id;
    }
    else {
      gid = canvas._gury_id = nextGuryId();
    }

    return canvasToGury[gid] = gury;
  }
  
  /*
   * Core Gury Class
   */
  
  function Gury(canvas) {
    if (canvas == null) {
      canvas = document.createElement('canvas');
    }
    
    // Check for an existing mapping from the canvas to a Gury instance
    if (getGury(canvas)) {
      return getGury(canvas);
    }
    
    // Otherwise create a new instance
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this._objects = [];
    this._groups = {};
    this._paused = false;
    this._loop_interval = null;
  
    return setGury(canvas, this);
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
  
  /*
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
  
  function _add(gury, name, object) {
    if (name) {
      var parts = name.split('.');
      for (var i=0; i < parts.length; i++) {
        
      }
    }
    
    gury._objects.push(object);
  }
    
  Gury.prototype.add = function() {
    var name = null, obj;
    
    if (arguments.length < 1) {
      return this;
    }
    else if (arguments.length < 2) {
      obj = arguments[0];
      if (!isObjectOrFunc(obj)) {
        return this;
      }
    }
    else {
      name = arguments[0];
      obj = arguments[1];
      if (!isString(name) || !isObjectOrFunction(obj)) {
        return this;
      }
    }
    
    _add(this, name, obj);
    
    return this;
  };
  
  Gury.prorotype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  };
  
  Gury.prototype.draw = function() {
    this.clear();
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
    // Ignore multiple play attempts
    if (this._loop_interval != null) {
      return this;
    }
      
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
