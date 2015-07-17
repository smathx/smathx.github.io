// twist.js    WebGL Assignment 1   16 July 2015

var canvas;
var gl;
var points = [];

window.onload = function init() {
    console.log('init');
    initGL();
    //drawStuff();
}

function drawStuff() {
    var angle = document.getElementById("angle");
    var size  = document.getElementById("size");
    var level = document.getElementById("level");
    var style = document.getElementById("style");
    console.log(angle);
    console.log(size);
    console.log(level);
    console.log(style);
    //size = 1;
    //level = 2;
    if (level < 1 || level > 8) { alert("level out of range!"); }
    style = gl.POINTS;
    points = [];
    doTriangle(1, 0, 2);
    setupDrawing();
    render(style);
}

function setupDrawing() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function initGL() {
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert( "Sorry - WebGL is not available." ); 
    }    
}

function doTriangle(size, angle, level) {

    var vertices = 
    [
        vec2(-size/2, -size/2),
        vec2(      0,  size/2),
        vec2( size/2, -size/2)
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2], level);
                   
    for (var i = 0; i < points.length; ++i) {
    
        var x = points[i][0];
        var y = points[i][1];
        var r = Math.sqrt(x*x + y*y);
        
        points[i][0] = x * Math.cos(r * angle) - y * Math.sin(r * angle);
        points[i][1] = x * Math.sin(r * angle) + y * Math.cos(r * angle);    
    }
}

function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
    console.log(count);
    if (count === 0) {
        triangle(a, b, c);
    }
    else {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(ac, ab, bc, count);
    }
}

function render(style) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(style, 0, points.length);
}

//end