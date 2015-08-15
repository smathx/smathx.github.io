'use strict';

function createObject(name) {

    var obj = function() {};

    obj.initialise = function () {
        this.label                = '';
        this.named                = name;

        this.glVertexCount        = -1;     // The active vertex index
        this.glVertices           =  [];    // Vertex position list for gl
        this.glIndices            =  [];    // Index list for gl

        this.glPositionBuffer     =  null;  // Position buffer for gl
        this.glVertexIndexBuffer  =  null;  // Vertex buffer for gl

        this.fill                 = true;   // Fill object
        this.fillColour           = [ 1, 0, 0, 1];  // default to red
        this.wireframe            = true;   // Draw wireframeColour
        this.wireframeColour      = [ 0, 0, 0, 1];  // default to black

        this.location             = [ 0, 0, 0 ];
        this.angle                = [ 0, 0, 0 ];
    };

    obj.addTriangle = function (x1, y1, z1,
                               x2, y2, z2,
                               x3, y3, z3) {
        this.glIndices.push(this.addVertex(x1, y1, z1));
        this.glIndices.push(this.addVertex(x2, y2, z2));
        this.glIndices.push(this.addVertex(x3, y3, z3));
    };

    obj.addVertex = function (x, y, z) {
        this.glVertices.push(x);
        this.glVertices.push(y);
        this.glVertices.push(z);

        this.glVertexCount++;
        return this.glVertexCount;
    };

    obj.addIndex = function (index) {
        this.glIndices.push(index);
    };

    obj.createBuffers = function () {
        this.glPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glVertices), gl.STATIC_DRAW);
        this.glPositionBuffer.itemSize = 3;

        this.glVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.glIndices), gl.STATIC_DRAW);
        this.glVertexIndexBuffer.itemSize = 1;
        this.glVertexIndexBuffer.numItems = this.glIndices.length;
    };

    obj.render = function () {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.glPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.glPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glVertexIndexBuffer);

        if (obj.fill) {
            gl.uniform4fv(shaderProgram.colourUniform, obj.fillColour);
            gl.drawElements(gl.TRIANGLES, this.glVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        if (obj.wireframe) {
            gl.uniform4fv(shaderProgram.colourUniform, obj.wireframeColour);
            gl.drawElements(gl.LINE_STRIP, this.glVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    };

    obj.initialise();
    return obj;
}

function createCube(width, height, depth, colour) {
    var obj = createObject('Cube');

    var szX = width / 2;
    var szY = height / 2;
    var szZ = depth / 2;

    obj.addTriangle(-szX, -szY,  szZ,  szX, -szY,  szZ,  szX,  szY,  szZ);
    obj.addTriangle(-szX, -szY,  szZ,  szX,  szY,  szZ, -szX,  szY,  szZ);

    obj.addTriangle(-szX, -szY, -szZ, -szX,  szY, -szZ,  szX,  szY, -szZ);
    obj.addTriangle(-szX, -szY, -szZ,  szX,  szY, -szZ,  szX, -szY, -szZ);

    obj.addTriangle(-szX,  szY, -szZ, -szX,  szY,  szZ,  szX,  szY,  szZ);
    obj.addTriangle(-szX,  szY, -szZ,  szX,  szY,  szZ,  szX,  szY, -szZ);

    obj.addTriangle(-szX, -szY, -szZ,  szX, -szY, -szZ,  szX, -szY,  szZ);
    obj.addTriangle(-szX, -szY, -szZ,  szX, -szY,  szZ, -szX, -szY,  szZ);

    obj.addTriangle( szX, -szY, -szZ,  szX,  szY, -szZ,  szX,  szY,  szZ);
    obj.addTriangle( szX, -szY, -szZ,  szX,  szY,  szZ,  szX, -szY,  szZ);

    obj.addTriangle(-szX, -szY, -szZ, -szX, -szY,  szZ, -szX,  szY,  szZ);
    obj.addTriangle(-szX, -szY, -szZ, -szX,  szY,  szZ, -szX,  szY, -szZ);

    obj.fillColour = colour;
    obj.createBuffers();
    return obj;
}

function createCylinder(radius, height, num_sides, colour) {
    var shape = createTube(num_sides, radius, radius, height, colour, true, true);
    shape.named = 'Cylinder';
    return shape;
}

function createCone(num_sides, radius, height, colour) {
    var shape = createTube(num_sides, radius, 0, height, colour, true, false);
    shape.named = 'Cone';
    return shape;
}

function createTube(num_sides, radius_front, radius_back, height, colour,
                    cap_front, cap_back) {
    var obj = createObject('Tube');

    var numSegments = num_sides;

    for (var i = 0; i < numSegments; ++i) {

        var xf = radius_front * Math.cos(i / numSegments * 2 * Math.PI);
        var yf = radius_front * Math.sin(i / numSegments * 2 * Math.PI);

        var xf1 = radius_front * Math.cos((i+1) / numSegments * 2 * Math.PI);
        var yf1 = radius_front * Math.sin((i+1) / numSegments * 2 * Math.PI);

        var xb = radius_back * Math.cos(i / numSegments * 2 * Math.PI);
        var yb = radius_back * Math.sin(i / numSegments * 2 * Math.PI);

        var xb1 = radius_back * Math.cos((i+1) / numSegments * 2 * Math.PI);
        var yb1 = radius_back * Math.sin((i+1) / numSegments * 2 * Math.PI);

        var z = height/2;

        obj.addTriangle( xf,  yf,  z,  xb,  yb, -z, xb1, yb1, -z);
        obj.addTriangle(xb1, yb1, -z, xf1, yf1,  z,  xf,  yf,  z);

        if (cap_front && (radius_front > 0))
            obj.addTriangle( xf1,  yf1,  z,  0,  0,  z, xf, yf,  z);

        if (cap_back && (radius_back > 0))
            obj.addTriangle( xb,  yb, -z,  0,  0, -z, xb1, yb1, -z);
    }
    obj.fillColour = colour;
    obj.createBuffers();
    return obj;
}

function createSphere(radius, numSegments, colour) {
    var shape = createEllipsoid(radius, radius, radius, numSegments, colour);
    shape.named = 'Sphere';
    return shape;
}

function createEllipsoid(sizeX, sizeY, sizeZ, numSegments, colour) {

    var obj = createObject('Ellipsoid');

    var latitudeBands = numSegments;
    var longitudeBands = 2 * numSegments;

    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = sizeX * cosPhi * sinTheta;
            var y = sizeY * cosTheta;
            var z = sizeZ * sinPhi * sinTheta;

            obj.addVertex(x, y, z);
        }
    }

    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;

            obj.addIndex(first);
            obj.addIndex(second);
            obj.addIndex(first + 1);

            obj.addIndex(second);
            obj.addIndex(second + 1);
            obj.addIndex(first + 1);
        }
    }
    obj.fillColour = colour;
    obj.createBuffers();
    return obj;
}

//end
