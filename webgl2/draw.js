// Assignment 2 - due 25/7/15

"use strict";

var gl;

var max_num_points = 10000;
var num_points = 0;
var lines = [];
var num_lines = 0;
var mouse_down = false;
var canvas;
var colour;
var point_size = 10.0;
var line_style = 'lines';
var pointSizePtr;
var vBuffer;
var cBuffer;
var new_line = false;

window.onload = function init()
{
    setColour('red');

    canvas = document.getElementById("webgl");
    
    gl = WebGLUtils.setupWebGL(canvas);    
    if (!gl) { 
        alert( "Unable to set up WebGL." ); 
    }    
    
    canvas.addEventListener("mousedown", function(event){
        mouse_down = true;
        new_line = false;
        addPoint(event);
        lines[num_lines] = num_points;
    });

    canvas.addEventListener("mouseup", function(event){
        mouse_down = false;
        
        if (new_line) {
            addPoint(event);
            ++num_points;
        }
    });
    
    canvas.addEventListener("mousemove", function(event){       
        if (mouse_down) {
            if (!new_line) {
                ++num_points;
                ++num_lines;
                new_line = true;
            }
            addPoint(event);
            ++num_points;
            lines[num_lines] = num_points;
        }
    });
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Create buffer for points, 2 x 4 byte values for each one.
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 2 * 4 * max_num_points, gl.STATIC_DRAW);
    
    var aVertexPtr = gl.getAttribLocation(program, "aVertex");
    gl.vertexAttribPointer(aVertexPtr, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aVertexPtr);

    // Create buffer for colour, 4 x 4 byte values for each point.
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * max_num_points, gl.STATIC_DRAW);
    
    var aColourPtr = gl.getAttribLocation(program, "aColour");
    gl.vertexAttribPointer(aColourPtr, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(aColourPtr);

    // Set up uniform value for point size.
    
    pointSizePtr = gl.getUniformLocation(program, "u_pointSize");
    
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    render();
};

function addPoint(event) {
    if (num_points >= max_num_points)
        return;
            
    var t = mouseCoord(event);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 2 * 4 * num_points, flatten(t));
        
    t = vec4(colour);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * num_points, flatten(t));        
}

// Convert mouse coordinates taking offset and margin into account.
function mouseCoord(event) {
    var rect = canvas.getBoundingClientRect();
    return vec2(2 * (event.clientX - rect.left - 10) / canvas.width - 1, 
                2 * (canvas.height - (event.clientY - rect.top - 10)) / canvas.height - 1);
}                

// Render each line as points or lines.
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.lineWidth(point_size);    
    gl.uniform1f(pointSizePtr, point_size);
    
    var style = gl.LINE_STRIP;
    
    if (line_style == 'points')
        style = gl.POINTS;
        
    for (var n = 0; n < num_lines; ++n) 
        gl.drawArrays(style, lines[n], lines[n+1] - lines[n]);
        
    window.requestAnimFrame(render);
}

function wipeCanvas() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    num_points = 0;
    num_lines = 0;
    mouse_down = false;
}

function setColour(colour_name) {
    if (colour_name == 'red')
        colour = vec4(1, 0, 0, 1);
    if (colour_name == 'green')
        colour = vec4(0, 0.5, 0, 1);
    if (colour_name == 'blue')
        colour = vec4(0, 0, 1, 1);
    if (colour_name == 'yellow')
        colour = vec4(1, 1, 0, 1);
    if (colour_name == 'black')
        colour = vec4(0, 0, 0, 1);
}
 
function setPointSize() {
    point_size = document.getElementById("size").value;
}
 
function setLineStyle(style) {
    line_style = style;
}
 
function showValue(id, outputId) {
    var out = document.getElementById(outputId);
    var x = document.getElementById(id);
    out.value = x.value;
}
 