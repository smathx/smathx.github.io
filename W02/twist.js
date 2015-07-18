// twist.js    WebGL Assignment 1   18 July 2015

var canvas;
var gl;
var points = [];

window.onload = function init() {
    initGL();
    drawStuff();
}

function drawStuff() {
    var angle = document.getElementById("angle").value;
    var size  = document.getElementById("size").value;
    var level = document.getElementById("level").value;
    var style = document.getElementById("style").value;

    points = [];
    doTriangle(size, level);        
    twist(angle, points);
    
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

function doTriangle(size, level) {

    var vertices = 
    [
        vec2(size, 0),
        vec2(size * Math.cos(2 * Math.PI / 3), size * Math.sin(2 * Math.PI / 3)),
        vec2(size * Math.cos(4 * Math.PI / 3), size * Math.sin(4 * Math.PI / 3)),
    ];
    
    divideTriangle(vertices[0], vertices[1], vertices[2], level);
}

function twist(angle, vertices) {
    for (var i = 0; i < vertices.length; ++i) {
    
        var x = vertices[i][0];
        var y = vertices[i][1];
        var a = Math.sqrt(x*x + y*y) * angle;
        
        vertices[i] = [ x * Math.cos(a) - y * Math.sin(a), 
                        x * Math.sin(a) + y * Math.cos(a) ];    
    }
}

function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
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
    
    if (style == "lines") {
        for (var i = 0; i < points.length; i += 3)
            gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
    if (style == "points") {
        gl.drawArrays(gl.POINTS, 0, points.length);
    }
    if (style == "triangles") {
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    }
}

//end