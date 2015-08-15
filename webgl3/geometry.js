'use strict';

// Program control.

var canvas = null;
var gl = null;
var shaderProgram = null;

var view = {};

//-----------------------------------------------------------------------------

function main() {
    if (!initialiseWebGL())
        return;
    
    initialiseShaders();
    initialiseShaderParameters();
    
    initialiseUI();

    setView();
    tick();
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
}

//-----------------------------------------------------------------------------

var mvMatrix = mat4();
var mvMatrixStack = [];
var pMatrix = mat4();

function mvPushMatrix() {
    var copy = mat4(mvMatrix[0], mvMatrix[1], mvMatrix[2], mvMatrix[3]);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length <= 0) {
        throw 'Whoops! Pop on empty matrix stack';
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(mvMatrix));
    gl.uniform4fv(shaderProgram.colourUniform, [1,0,0,1]);
}

//-----------------------------------------------------------------------------

function setView() {
    view.rotationMatrix = mat4(1);
    view.position = vec3(0, 0, -4);
    
    view.fovy = 45;
    view.front = 0.1;
    view.back = 100;
    
    updateSlider(control.fieldOfViewAngleY, view.fovy);
    //updateSlider(control.fieldOfViewFront, view.front);
    //updateSlider(control.fieldOfViewBack, view.back);
}

function clearScene() {
    for (var i = 0; i < shapeInstances.length; ++i)
        removeItem(i);
    
    shapeInstances.length = 0;
    setCurrentItem(0);
    
    setView();
}

function removeItem(item_num) {
    shapeInstances[item_num] = null;
    
    if (item_num == currentItem)
        setCurrentItem(0);
    
    removeOptionFromSelect(item_num);
}

//-----------------------------------------------------------------------------

var shapeInstances = [];
var currentItem = 0;

function addShape(shape) {
    shapes.push(shape);
    return shapes.length-1;
}

function addShapeInstance(shape, name) {
    shape.label = name || 'Item ' + (shapeInstances.length + 1) + ': ' + shape.named;
    shapeInstances.push(shape);
    return shapeInstances.length-1;
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pMatrix = perspective(view.fovy, gl.viewportWidth / gl.viewportHeight, 
                          view.front, view.back);
    
    mvMatrix = mat4(1);
    mvMatrix = mult(mvMatrix, translate(view.position));
    mvMatrix = mult(mvMatrix, view.rotationMatrix);
    
    for (var i = 0; i < shapeInstances.length; ++i) {
        
        var shape = shapeInstances[i];
        
        if (shape === null)
            continue;
        
        mvPushMatrix();
        
        mvMatrix = mult(mvMatrix, translate(shape.location));
        mvMatrix = mult(mvMatrix, rotateX(shape.angle[0]));
        mvMatrix = mult(mvMatrix, rotateY(shape.angle[1]));
        mvMatrix = mult(mvMatrix, rotateZ(shape.angle[2]));
        
        shape.render();
        
        mvPopMatrix();
    }
}

//-----------------------------------------------------------------------------

function addCone(radius, height, sides) {
    var n = addShapeInstance(createCone(sides, radius, height, [1,0,0,1]));    
    addOptionToSelect(shapeInstances[n].label, n);
    setCurrentItem(n);
}

function addCube(width, height, depth) {
    var n = addShapeInstance(createCube(width, height, depth, [1,1,0,1]));
    addOptionToSelect(shapeInstances[n].label, n);
    setCurrentItem(n);
}

function addCylinder(radius, height, sides) {
    var n = addShapeInstance(createCylinder(radius, height, sides, [0,1,0,1]));
    addOptionToSelect(shapeInstances[n].label, n);
    setCurrentItem(n);
}

function addEllipsoid(width, height, depth, sides) {
    var n = addShapeInstance(createEllipsoid(width, height, depth, sides, [0,1,1,1]));
    addOptionToSelect(shapeInstances[n].label, n);
    setCurrentItem(n);
}

function addSphere(radius, sides) {
    var n = addShapeInstance(createSphere(radius, sides, [0,0,1,1]));
    addOptionToSelect(shapeInstances[n].label, n);
    setCurrentItem(n);
}

function addTube(radius_front, radius_back, height, sides, cap_front, cap_back) {
    var n = addShapeInstance(createTube(sides, radius_front, radius_back, height, 
                                        [1,0,1,1], cap_front, cap_back));
    addOptionToSelect(shapeInstances[n].label, n);
    setCurrentItem(n);
}

//-----------------------------------------------------------------------------

function initialiseWebGL() {

    canvas = document.getElementById('webgl');

    if ((gl = WebGLUtils.setupWebGL(canvas)) === null) {
        alert('WebGL is not available!');
        return false;
    }
    
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.clearColor(0.9, 0.9, 0.9, 1.0);      // Clear to opaque grey.
    gl.clearDepth(1.0);                     // Clear everything.
    gl.enable(gl.DEPTH_TEST);               // Enable depth testing.
    gl.depthFunc(gl.LEQUAL);                // Near obscures far.
    
    gl.enable(gl.POLYGON_OFFSET_FILL);      // Fix grid 'stitching' problem
    gl.polygonOffset(1.0, 1.0);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    return true;
}

function initialiseShaderParameters() {
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
    shaderProgram.colourUniform = gl.getUniformLocation(shaderProgram, 'fColour');
}

function initialiseShaders() {

    shaderProgram = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(shaderProgram);
}

//end