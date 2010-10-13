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

window.$g = window.Gury = (function() {
  /*
   * Utility functions
   */
  function isObject(v) { return typeof v == "object"; }
  function isFunction(v) { return typeof v == "function"; }
  function isString(v) { return typeof v == "string"; }
  function isObjectOrFunction(v) { return typeof v == "function" || typeof v == "object"; }
  function isDefined(v) { return typeof v != "undefined" && v != null; }
  
  function _each(closure) {
    for (var i = 0; i < this.length; i++) {
      closure(this[i], i);
    }
  }
  
  function unique(needle, haystack) {
    for (var i=0; i < haystack.length; i++) {
      if (needle == haystack[i]) {
        return false;
      }
    }
    return true;
  }

  /*
   * Internal exception handling
   */
  var _failWithException = true;
  
  function GuryException(msg) {
    if (_failWithException) {
      throw "Gury: " + msg;
    }
  }
  
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
    if (typeof canvas._gury_id == "string") {
      gury.id = canvas._gury_id;
    }
    else {
      gury.id = canvas._gury_id = nextGuryId();
    }

    return canvasToGury[gury.id] = gury;
  }
  
  /*
   * Tag Namespace Object
   */
  function TagSpace(name, objects) {
    this.name = name;
    this._children = {};
    this._objects = objects || [];
  }
  
  TagSpace.TAG_REGEX = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
  
  TagSpace.prototype.hasChild = function(name) {
    return isObject(this._children[name]);
  };
  
  TagSpace.prototype.addChild = function(name) {
    return this._children[name] = new TagSpace(name);
  };
  
  TagSpace.prototype.getChild = function(name) {
    return this._children[name];
  };
  
  TagSpace.prototype.getObjects = function() {
    // This might be a little slow, but it helps us keep spaces consistent
    var objects = [];
    for (var i = 0; i < this._objects.length; i++) {
      objects.push(this._objects[i]);
    }
    
    // And lets us annotate what we return :)
    objects.each = _each;
    
    return objects;
  };
  
  TagSpace.prototype.find = function(tag) {
    if (!tag.match(TagSpace.TAG_REGEX)) {
      return null;
    }
    
    var currentSpace = this;
    var tags = tag.split('.');
    var lastName = tags[tags.length - 1];
    
    for (var i = 0; i < tags.length; i++) {
      if (!currentSpace.hasChild(tags[i]))
        return null;
      currentSpace = currentSpace.getChild(tags[i]);
    }
    
    return currentSpace;
  };
  
  TagSpace.prototype.add = function(tag, object) {
    if (!tag.match(TagSpace.TAG_REGEX)) {
      return null;
    }
    
    var currentSpace = this;
    var tags = tag.split('.');
    var lastName = tags[tags.length - 1];
    
    for (var i = 0; i < tags.length; i++) {
      if (currentSpace.hasChild(tags[i])) {
        currentSpace = currentSpace.getChild(tags[i]);
      }
      else {
        currentSpace = currentSpace.addChild(tags[i]);
      }
    }
  
    if (!unique(object, currentSpace._objects)) {
      return object;
    }
    
    currentSpace._objects.push(object);
    
    return object;
  };
  
  TagSpace.prototype.remove = function(object) {
    // TODO Implement me
  };
  
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
    this._objects.each = _each;
    
    this._tags = new TagSpace('__global');
    
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
      GuryException("place() - Unable to place canvas tag (is jQuery loaded?)");
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
  
  function _annotate_object(object) {
    if (isDefined(object._gury)) {
      return;
    }
    object._gury = { visible: true };
  }
  
  Gury.prototype.add = function() {
    var tag = null, obj;
    
    if (arguments.length < 1) {
      return this;
    }
    else if (arguments.length < 2) {
      obj = arguments[0];
      if (!isObjectOrFunction(obj)) {
        return this;
      }
    }
    else {
      tag = arguments[0];
      obj = arguments[1];
      if (!isString(name) || !isObjectOrFunction(obj)) {
        return this;
      }
    }

    // Add the object to the global tag space (if a tag was provided)
    if (tag != null) {
      this._tags.add(tag, obj);
    }
    
    // We can apply new tags using add, but we don't want to keep track of the
    // object twice in the master rendering list...
    if (!unique(obj, this._objects)) {
      return this;
    }
    
    // TODO How should we handle adding the same object to multiple canvases?
    
    // Annotate the object with gury specific members
    _annotate_object(obj);
    
    // Add to the rendering list
    this._objects.push(obj);
    
    return this;
  };
  
  Gury.prototype.remove = function(object) {
    // TODO Implement me
    return this;
  };
  
  Gury.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  };
  
  Gury.prototype.draw = function() {
    this.clear();
    
    for (var i = 0; i < this._objects.length; i++) {
      var ob = this._objects[i];
      
      if (!ob._gury.visible) {
        continue;
      }
      
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
   * Object / Tag Methods
   */
  Gury.prototype.each = function() {
    var tag, closure;
    
    if (arguments.length < 2 && isFunction(arguments[0])) {
      closure = arguments[0];
      this._objects.each(closure);
    }
    else if (isString(arguments[0]) && isFunction(arguments[1])) {
      tag = arguments[0];
      closure = arguments[1];
      var space = this._tags.find(tag);
      if (space) {
        space.getObjects().each(closure);
      }
    }
    else if (isFunction(arguments[0])) {
      closure = arguments[0];
      this._objects.each(closure);
    }
    else if (isFunction(arguments[1])) {
      closure = arguments[1];
      this._objects.each(closure);
    }
    
    return this;
  };
   
  Gury.prototype.hide = function(tag) {
    return this.each(tag, function(obj, index) {
      obj._gury.visible = false;
    });
  };
  
  Gury.prototype.show = function(tag) {
    return this.each(tag, function(obj, index) {
      obj._gury.visible = true;
    });
  };
  
  Gury.prototype.toggle = function(tag) {
    return this.each(tag, function(obj, index) {
      obj._gury.visible = !obj._gury.visible;
    });
  };
  
  /*
   * Public interface
   */
  
  function GuryInterface(id) {
    return new Gury(id ? document.getElementById(id) : null);
  }
  
  GuryInterface.failWithException = function(b) {
    if (!b) {
      return _failWithException;
    }
    return _failWithException = b ? true : false;
  };
  
  return GuryInterface;
})();

// "There's a star man waiting in the sky. He'd like to come and meet us but 
// he think's he'll blow our minds."