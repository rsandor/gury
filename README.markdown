gury - A jQuery inspired canvas utility library
================================================================================
by Ryan Sandor Richards

Gury (pronounced "jury") is a simple to use utility library for drawing and
animating when using HTML5 canvas tags. It takes the guess work out of setting
and allows you to build your scenes one object at a time.

It was built with simplicity in mind and its usage was modeled in the image
of jQuery. For instance you can initialize, style, and animate an entire scene
in a single expression using chaining.

Using gury
--------------------------------------------------------------------------------

Getting started with Gury is a piece of cake! Here's a step-by-step guide:

1. Create an HTML page and add a canvas with an id attribute to the body
2. Include `gury.js` in a script tag
3. Write some JavaScript to make a simple animation

To see it in action view the `demo.html` file in a canvas enabled browser.

Example
--------------------------------------------------------------------------------
Here is an example of some gury code to make a simple spinning square animation.

    $g('screen').size(100, 100).add({
        theta: 0, 
        draw: function(ctx) {
            ctx.save();
            ctx.translate(50, 50);
            ctx.rotate(this.theta);
            ctx.fillStyle = "#ada";
            ctx.fillRect(-32, -32, 64, 64);
            ctx.restore();
            this.theta += Math.PI / 120;
        }
    }).play(16);

Neat, eh?

Basic Usage, Placement, and Appearance Methods
--------------------------------------------------------------------------------

### Gury(), $g()

Creates a new canvas node and returns the gury object representing that canvas.

### Gury(id), $g(id)

Finds a canvas on the page with the given id and returns a gury object
representing that canvas.

### .canvas

The canvas node represented by the gury object. Example:

    $g().canvas.style.border = "5px solid red";

### .ctx

The graphics context for the canvas represented by the gury object. Example:

    $g().ctx.fillStyle = "#a0a";

### .place(node)

This method is used to place canvas objects created using gury. If the `node`
parameter is a DOM element then the canvas will be added as a child to that DOM
element. If the `node` parameter is a string and jQuery is available the parameter
is treated as a selector and the canvas is appended to the nodes returned by 
applying the jQuery selector, like so:

    $(node).append(canvas)

### .size(width, height)

Changes the size of the canvas represented by the gury object. The parameters
are expected to be in pixels.

### .background(color)

Changes the background style of the canvas represented by the gury object. The
`color` parameter is expected to be a string containing the CSS for the background
of the canvas.

Object Methods
--------------------------------------------------------------------------------

### .add(object)

Adds an object to be rendered on the canvas. The `object` parameter can be either 
a function that accepts a single graphics context argument (for quick rendering):

    $g('my_canvas').add(function(ctx) {
       ctx.fillStyle = "#f00";
       ctx.drawRect(0, 0, 20, 20);
       // ... 
    });

or a full object that contains a `draw` method which accepts both the context
upon which to draw and optionally a reference to the canvas node:
    
    $g('my_canvas').add({
        x: 0, dx: 1,
        draw: function(ctx, canvas) {
            if (this.x >= canvas.width)
                this.dx *= -1;
            //...
        }
    });

### .add(tag, object)

As with `.add(object)` this method adds an object to be rendered on the canvas.
Additionally it associates a tag name with that object for use with the various
object/tag methods described below.

A quick example:

    $g('my_canvas')
      .add('players.mario', new Mario())
      .add('players.luigi', new Luigi())
      .toggle('players.mario'); // Luigi finally has his day!

Tags are hierarchical, meaning that if you were to then execute:

    $g('my_canvas').toggle('players')
    
It would show the `Mario` object and hide the `Luigi` object (and Luigi would no
longer rule the day, alas). For more information read the section on object tags 
above and see the tag methods (`.each()`, `.hide()`, etc.) below.

### .each(closure)

Executes a closure on each of the objects associated with the canvas. An example
explains this a bit better:

    $g('my_canvas')
      .add(new Ball())
      .add(new Ball())
      .each(function(object, index) {
        object.x -= 10;
        object.y += 10; 
      }).animate(16);

Executing the script above would move each of the objects 10 pixels down and 10 
pixels to the left (note that the `Ball` class is not part of Gury but is used as
an example).

### .each(tag, closure)

Does the same thing as `.each(closure)` but only iterates over objects that were added
with the provided `tag` parameter. Let's take a look with an example:

    $g('my_canvas')
      .add('red', new Ball('red'))
      .add('red', new Ball('red'))
      .add('green', new Ball('green'))
      .each('red', function(object) {
        object.x -= 10;
        object.y += 10;
      }).draw();

In this example only balls that were tagged with `red` will be moved down and to the left.
All other balls (i.e. the `green` tagged ball) will remain unaffected.

***Important:*** Just changing the properties of objects will not cause the canvas
to redraw and display those changes. For static scenes we must explicitly redraw
using the `.draw()` method. Animated scenes tend not to have this problem as they
are technically calling `.draw()` on each animation interval.

Keep this in mind for `.each()`, `.hide()`, `.show()`, or `.toggle()` methods.
This may change in the future, but for now it's the law of the land.

### .hide() / .hide(tag)

Prevents objects from drawing and animating. Example:

    $g('my_canvas')
      .add('circle', new Circle())
      .add('box', new Box())
      .hide().draw();

The preceding example would hide all objects regardless of their tag. Here's
another example:

    $g('my_canvas')
      .add('circle', new Circle())
      .add('box', new Box())
      .hide('circle').draw();

which hides only the circle, leaving the box rendering alone (poor lonely box).
Again, as with many of these examples, the `Box` and `Circle` classes aren't part
of Gury but are used as examples.

### .show() / .show(tag)

Ensures that objects render and animate. Example:

    $g('my_canvas')
      .add('box', new Box())
      .hide('box').draw();
      
    // ... Maybe do some other stuff ...
    
    $g('my_canvas').show().draw();

In the preceding example we created a box, immediately hid it, and then turned 
around and decided to show everything anyway. While not practical (or particularly
sane) it is illustrative of using `.show()`. The next example uses tags:

    $g('my_canvas')
      .add('box', new Box())
      .add('circle', new Circle)
      .hide()
      .show('circle').animate(32);

In this example we add a box, then a circle, then hide everything, and finally show
only the circle by using tags.

### .toggle() / .toggle(tag)
What visibility library would be complete without a toggle method? This method basically
just toggles objects on and off as it is called. Let's get going with an example:

    var gury = $g('my_canvas')
      .add('box', new Box())
      .add('circle', new Circle()).play(16);
      
    // Add a little jQuery action...
    $('#my_button').click(function() {
      gury.toggle();
    });

The example above simply adds a box and a circle and then uses some jQuery magic to bind
an event that toggles all of the objects on and off when some element with the id `my_button`
is clicked. A final example should cement the concept:

    $('my_canvas')
      .add('box', new Box())
      .add('circle', new Circle())
      .toggle('box').draw();

Simple enough: we just add a box, a circle, then toggle the box off and draw the scene.


Drawing and Animation Methods
--------------------------------------------------------------------------------

### .draw()

Renders the scene by drawing all of the added objects in order on the canvas.

### .clear()

Clears the canvas (does *not* remove any objects bound to the Gury instance).

### .play(interval)

Renders the scene repeatedly at fixed intervals creating an animation. This
is most useful when used in conjunction with objects that change state on render.
See `demos/demo1.html` and `demos/demo3.html` for examples of objects that change position
or rotation on the screen as the animation plays.

### .pause()

Pauses and un-pauses a running gury animation.

### .stop()

Fully stops the gury animation. You must call `play()` in order to start the animation
again after calling `stop()`.

Module Methods
--------------------------------------------------------------------------------
### GuryInterface.failWithException()

Returns true if Gury fails with an exception, and returns false if Gury actions
fail silently. By default it will return true (which is recommended for development,
but maybe not for production).

### GuryInterface.failWithException(b)

Allows you to set whether or not Gury will fail silently or with an exception.
Just set the `b` parameter to `false` if you do not want to see failure exceptions
and to `true` if you do.


A Note on Objects and Canvas Tags
--------------------------------------------------------------------------------
Each object you add to the display list using Gury will be annotated with a special
property named `._gury`. Essentially it holds information about the object with
respect to the canvas it is to be displayed on (a good example is the object's visibility 
status, used by `.toggle()` et. al.). This is true of both objects and functions that 
are added using the `.add()` method.

***WARNING*** If you alter or replace the `._gury` property of an object it may break
some basic internal functionality (such as hiding/showing, etc.).

Additionally canvas tags that are associated with or created by Gury will also be
annotated with a special property named `._gury_id`. This allows Gury to ensure
a persistent state between multiple calls to the `$g()` method. 

***WARNING*** If you alter or replace the `._gury_id` property of your canvas
tags you could break the internal functionality for pretty much all methods,
lose objects, or even cause unsightly memory leaks (no amount of coding cosmetics
can save you from a memory leak blemish, just ask any C programmer).

License (MIT)
--------------------------------------------------------------------------------
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