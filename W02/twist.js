// twist.js    WebGL Assignment 1   16 July 2015

var canvas;
var gl;
var points = [];
var NumTimesToSubdivide = 6;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert( "Sorry - WebGL is not available." ); 
    }
        
    var vertices = [
        vec2(-1/2, -1/2),
        vec2( 0,  1/2),
        vec2( 1/2, -1/2)
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2],
                   NumTimesToSubdivide);
                   
    var theta = 0;
    
    for (var i = 0; i < points.length; ++i) {
    
        var x = points[i][0];
        var y = points[i][1];
        var r = Math.sqrt(x*x+y*y);
        //console.log(points[i]);
        points[i][0] = x * Math.cos(r * theta) - y * Math.sin(r * theta);
        points[i][1] = x * Math.sin(r * theta) + y * Math.cos(r * theta);    
        //console.log(r);
        //console.log(x);
        //console.log(y);
        //console.log(points[i]);
    }
    console.log(points);
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

    render();
};

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
        //divideTriangle(ac, ab, bc, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length);
}

//end