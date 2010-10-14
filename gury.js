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
   * Dynamic Set
   */
  function Set(ord) {
    var buckets = {};
    var ordered = ord ? [] : false;
    
    /*
     * MurmurHash adapted from: http://gist.github.com/588423 (raycmorgan)
     */
    function UInt32(str, pos) {
      return (str.charCodeAt(pos++)) +
             (str.charCodeAt(pos++) << 8) +
             (str.charCodeAt(pos++) << 16) +
             (str.charCodeAt(pos) << 24);
    }

    function UInt16(str, pos) {
      return (str.charCodeAt(pos++)) +
             (str.charCodeAt(pos++) << 8);
    }

    function Umul32(n, m) {
      n = n | 0;
      m = m | 0;
      var nlo = n & 0xffff;
      var nhi = n >>> 16;
      var res = ((nlo * m) + (((nhi * m) & 0xffff) << 16)) | 0;
      return res;
    }
    
    function doHash(str, seed) {
      var m = 0x5bd1e995;
      var r = 24;
      var h = seed ^ str.length;
      var length = str.length;
      var currentIndex = 0;

      while (length >= 4) {
        var k = UInt32(str, currentIndex);

        k = Umul32(k, m);
        k ^= k >>> r;
        k = Umul32(k, m);

        h = Umul32(h, m);
        h ^= k;

        currentIndex += 4;
        length -= 4;
      }

      switch (length) {
      case 3:
        h ^= UInt16(str, currentIndex);
        h ^= str.charCodeAt(currentIndex + 2) << 16;
        h = Umul32(h, m);
        break;

      case 2:
        h ^= UInt16(str, currentIndex);
        h = Umul32(h, m);
        break;

      case 1:
        h ^= str.charCodeAt(currentIndex);
        h = Umul32(h, m);
        break;
      }

      h ^= h >>> 13;
      h = Umul32(h, m);
      h ^= h >>> 15;

      return h >>> 0;
    }
    
    function hash(object) {
      if (isDefined(object._gury_hash)) {
        return object._gury_hash;
      }
      
      var json = "";
      if (isFunction(object)) {
        var sample = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < 40; i++) {
          var k = sample.length * Math.random() | 0;
          json += sample.substring(k, k+1);
        }
      }
      else {
        json = JSON.stringify(object);
      }
      
      return object._gury_hash = doHash(json, json.length);
    }
    
    this.has = function(object) {
      var h = hash(object);
      if (isDefined(buckets[h])) {
        var bucket = buckets[h];
        for (var i = 0; i < bucket.length; i++) {
          if (bucket[i] == object) {
            return true;
          }
        }
      }
      return false;
    };
    
    this.add = function(object) {
      if (this.has(object)) {
        return this;
      }
      
      var h = hash(object);
      if (!isDefined(buckets[h])) {
        buckets[h] = [];
      }
      
      buckets[h].push(object);
      
      if (ordered) {
        ordered.push(object);
      }
      
      return this;
    };

    this.remove = function(object) {
      if (!this.has(object)) {
        return this;
      }
      
      var h = hash(object);
      var bucket = buckets[h];
      
      if (ordered) {
        for (var k = 0; k < ordered.length; k++) {
          if (ordered[k] == object) {
            ordered.splice(k, 1);
            break;
          }
        }
      }
      
      for (var i = 0; i < bucket.length; i++) {
        if (bucket[i] == object) {
          bucket.splice(i, 1);
          return this;
        }
      }
      
      return object;
    };
    
    this.each = function(closure) {
      var i;
      if (ordered) {
        for (i = 0; i < ordered.length; i++) {
          closure(ordered[i], i);
        }
      }
      else {
        for (var h in buckets) {
          var bucket = buckets[h];
          for (i = 0; i < bucket.length; i++) {
            closure(bucket[i], i);
          }
        }
      }
      return this;
    };
  }
  
  /*
   * Tag Namespace Object
   */
  function TagSpace(objects) {
    this.name = name;
    this._children = {};
    this._objects = new Set();
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
    return this._objects;
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
  
    currentSpace._objects.add(object);
    
    return object;
  };
  
  TagSpace.prototype.clearObjects = function() {
    this._objects = new Set();
  };
  
  TagSpace.prototype._remove_object = function(o) {
    this._objects.remove(o);
    for (var k in this._children) {
      var child = this._children[k];
      child._remove_object(o);
    }
  };
  
  TagSpace.prototype.remove = function(q) {
    var removed = new Set();

    if (isString(q)) {
      var space = this.find(q);
      if (!space) {
        return removed;
      }
      removed = space.getObjects();
      space.clearObjects();
    }
    else {
      this._remove_object(q);
      removed.add(q);
    }
    
    return removed;
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
    
    this._objects = new Set(true);
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
    object._gury = { visible: true, paused: false };
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
    if (this._objects.has(obj)) {
      return this;
    }
    
    // Annotate the object with gury specific members
    _annotate_object(obj);
    
    // Add to the rendering list
    this._objects.add(obj);
    
    return this;
  };
  
  Gury.prototype.remove = function(object) {
    if (isDefined(object)) {
      var gury = this;
      var removed = this._tags.remove(object);
      removed.each(function(r) {
        gury._objects.remove(r);
      });
    }
    return this;
  };
  
  Gury.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  };
  
  Gury.prototype.update = function() {
    var gury = this;
    gury._objects.each(function(ob) {
      if (isDefined(ob.update) && !ob._gury.paused) {
        ob.update(gury);
      }
    });
    return this;
  };
  
  Gury.prototype.draw = function() {
    this.clear();
    
    var gury = this;
    gury._objects.each(function(ob) {
      if (!ob._gury.visible) {
        return;
      }

      if (typeof ob == "function") {
        ob.call(gury, gury.ctx);
      }
      else if (typeof ob == "object" && typeof ob.draw != "undefined") {
        ob.draw(gury.ctx, gury.canvas);
      }
    });
    
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
  
    // Immediately render the scene
    this.draw();
    
    // Start the rendering / update loop  
    var gury = this;
    this._loop_interval = setInterval(function() {
      if (!gury._paused) {
        gury.update().draw();
      }
    }, interval);
    return this;
  };
  
  
  Gury.prototype.pause = function() {
    if (arguments.length > 0) {
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (isString(arg)) {
          this.each(arg, function(ob) {
            ob._gury.paused = !ob._gury.paused;
          });
        }
        else if (isDefined(arg._gury)) {
          arg._gury.paused = !arg._gury.paused;
        }
      }
      return this;
    }
    else {
      this._paused = !this._paused;
      return this;
    }
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