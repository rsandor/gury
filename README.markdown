gury (v 0.1) - A jQuery inspired canvas utility library
===
by Ryan Sandor Richards

Gury (pronounced "jury") is a simple to use utility library for drawing,
animating, and managing HTML5 canvas tags. The goal is to support the HTML5
Canvas API with a framework that allows for faster/easier application development.

It was built with simplicity in mind and its usage was modeled in the image
of jQuery. For instance you can initialize, style, and animate an entire scene
in a single expression using chaining.

Example
---
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

Documentation
---
You can find full API documentation for the project on it's github wiki:
http://github.com/rsandor/gury/wiki/API

License (MIT)
---
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