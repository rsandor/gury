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

API Reference
--------------------------------------------------------------------------------

### gury(), $g()

Creates a new canvas node and returns the gury object representing that canvas.

### gury(id), $g(id)

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

### .draw()

Renders the scene by drawing all of the added objects in order on the canvas.

### .clear()

Clears the canvas (does *not* remove any objects bound to the Gury instance).

### .play(interval)

Renders the scene repeatedly at fixed intervals creating an animation. This
is most useful when used in conjunction with objects that change state on render.
See `demo1.html` through `demo3.html` for examples of objects that change position
or rotation on the screen as the animation plays.

### .pause()

Pauses and un-pauses a running gury animation.

### .stop()

Fully stops the gury animation. You must call `play()` in order to start the animation
again after calling `stop()`.

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