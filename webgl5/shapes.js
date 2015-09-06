'use strict';

function createShape(type) {

    var obj = function() {};

    obj.initialise = function (name) {
        this.type = name;
        this.vertexCount = 0;     
        this.vertices = [];    
        this.vertexBuffer = null;
        this.textureCoords = [];
        this.textureCoordBuffer = null;
        this.indices = [];  
        this.indexBuffer = null;
        this.normals = [];    
        this.normalBuffer = null;
        this.numElements = 0;
    };

    obj.addTriangle = function (x1, y1, z1, u1, v1,
                                x2, y2, z2, u2, v2,
                                x3, y3, z3, u3, v3) {
        this.addIndex(this.addVertex(x1, y1, z1, u1, v1));
        this.addIndex(this.addVertex(x2, y2, z2, u2, v2));
        this.addIndex(this.addVertex(x3, y3, z3, u3, v3));

        var t1 = subtract(vec3(x2, y2, z2), vec3(x1, y1, z1));
        var t2 = subtract(vec3(x3, y3, z3), vec3(x1, y1, z1));
        var normal = cross(t1, t2);
        
        this.addNormal(normal[0], normal[1], normal[2]);
        this.addNormal(normal[0], normal[1], normal[2]);
        this.addNormal(normal[0], normal[1], normal[2]);
    };

    obj.addVertex = function (x, y, z, u, v) {
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);

        this.textureCoords.push(u);
        this.textureCoords.push(v);
        
        return this.vertexCount++;
    };

    obj.addNormal = function (x, y, z) {
        this.normals.push(Math.abs(x) < 1e-10 ? 0: x);
        this.normals.push(Math.abs(y) < 1e-10 ? 0: y);
        this.normals.push(Math.abs(z) < 1e-10 ? 0: z);
    };

    obj.addIndex = function (index) {
        this.indices.push(index);
    };

    obj.createBuffers = function () {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        
        this.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        
        this.numElements = this.indices.length;
    };

    obj.setVertexBuffer = function (attrib) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
    };
    
    obj.setTextureCoordBuffer = function (attrib) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);
    };
    
    obj.setIndexBuffer = function () {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    };
    
    obj.setNormalBuffer = function (attrib) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
    };
    
    obj.initialise(type);
    return obj;
}

function createCube(size) {
    return createCuboid(size, size, size, 'cube');
}
    
function createCylinder(radius, height, num_sides) {
    return createTube(radius, radius, height, true, true, num_sides || 100, 'cylinder');
}

function createCone(radius, height, num_sides) {
    return createTube(radius, 0, height, true, false, num_sides || 100, 'cone');
}

function createSphere(radius, numSegments) {
    return createEllipsoid(radius, radius, radius, numSegments || 40, 'sphere');
}

function createCuboid(width, height, depth, type) {
    var obj = createShape(type || 'cuboid');

    var szX = width / 2;
    var szY = height / 2;
    var szZ = depth / 2;

    obj.addTriangle(-szX, -szY,  szZ, 0, 0,  szX, -szY,  szZ, 1, 0,  szX,  szY,  szZ, 1, 1);
    obj.addTriangle(-szX, -szY,  szZ, 0, 0,  szX,  szY,  szZ, 1, 1, -szX,  szY,  szZ, 0, 1);

    obj.addTriangle(-szX, -szY, -szZ, 1, 0, -szX,  szY, -szZ, 1, 1,  szX,  szY, -szZ, 0, 1);
    obj.addTriangle(-szX, -szY, -szZ, 1, 0,  szX,  szY, -szZ, 0, 1,  szX, -szY, -szZ, 0, 0);

    obj.addTriangle(-szX,  szY, -szZ, 0, 1, -szX,  szY,  szZ, 0, 0,  szX,  szY,  szZ, 1, 0);
    obj.addTriangle(-szX,  szY, -szZ, 0, 1,  szX,  szY,  szZ, 1, 0,  szX,  szY, -szZ, 1, 1);

    obj.addTriangle(-szX, -szY, -szZ, 0, 0,  szX, -szY, -szZ, 1, 0,  szX, -szY,  szZ, 1, 1);
    obj.addTriangle(-szX, -szY, -szZ, 0, 0,  szX, -szY,  szZ, 1, 1, -szX, -szY,  szZ, 0, 1);

    obj.addTriangle( szX, -szY, -szZ, 1, 0,  szX,  szY, -szZ, 1, 1,  szX,  szY,  szZ, 0, 1);
    obj.addTriangle( szX, -szY, -szZ, 1, 0,  szX,  szY,  szZ, 0, 1,  szX, -szY,  szZ, 0, 0);

    obj.addTriangle(-szX, -szY, -szZ, 0, 0, -szX, -szY,  szZ, 1, 0, -szX,  szY,  szZ, 1, 1);
    obj.addTriangle(-szX, -szY, -szZ, 0, 0, -szX,  szY,  szZ, 1, 1, -szX,  szY, -szZ, 0, 1);

    obj.createBuffers();
    return obj;
}

function createTube(radius_front, radius_back, height, cap_front, cap_back, num_sides, type) {
    var obj = createShape(type || 'tube');

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

        obj.addTriangle( xf,  yf,  z,  1 - i / numSegments, 0,
                         xb,  yb, -z,  1 - i / numSegments, 1, 
                         xb1, yb1,-z,  1 - (i + 1) / numSegments, 1);
                         
        obj.addTriangle(xb1, yb1, -z,  1 - (i + 1) / numSegments, 1,
                        xf1, yf1,  z,  1 - (i + 1) / numSegments, 0, 
                        xf,  yf,   z,  1 - i / numSegments, 0);

        if (cap_front && (radius_front > 0))
            obj.addTriangle( xf1, yf1,  z,  0.5+0.5 * xf1 / radius_front, 0.5+0.5*yf1 / radius_front, 
                               0,   0,  z,  0.5, 0.5,
                              xf,  yf,  z,  0.5+0.5*xf / radius_front, 0.5+0.5*yf / radius_front);

        if (cap_back && (radius_back > 0))
//            obj.addTriangle( xb,  yb, -z,  0,  0, -z, xb1, yb1, -z);
            obj.addTriangle(  xb,  yb, -z,  0.5+0.5 * xb / radius_front, 0.5+0.5*yb / radius_front, 
                               0,   0, -z,  0.5, 0.5,
                             xb1, yb1, -z,  0.5+0.5*xb1 / radius_front, 0.5+0.5*yb1 / radius_front);

    }
    
    obj.createBuffers();
    return obj;
}

function createEllipsoid(sizeX, sizeY, sizeZ, numSegments, type) {
    var obj = createShape(type || 'ellipsoid');

    var latitudeBands = numSegments;
    var longitudeBands = 2 * numSegments;

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = sizeX * cosPhi * sinTheta;
            var y = sizeY * cosTheta;
            var z = sizeZ * sinPhi * sinTheta;

            if (Math.abs(x) < 1e-10) x = 0;
            if (Math.abs(y) < 1e-10) y = 0;
            if (Math.abs(z) < 1e-10) z = 0;
            
            obj.addVertex(x, y, z, 1-longNumber / longitudeBands, 1-latNumber / latitudeBands);
            
            var normal = normalize(vec3(x,y,z), false);
            obj.addNormal(normal[0], normal[1], normal[2]);
        }
    }
    
    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            var third = first + 1;
            var fourth = third + longitudeBands + 1;            

            obj.addIndex(second);
            obj.addIndex(first);
            obj.addIndex(third);
            
            obj.addIndex(third);
            obj.addIndex(fourth);
            obj.addIndex(second);
        }
    } 
    
    obj.createBuffers();
    return obj;
}

function createGrid(from, to, step) {
    var obj = createShape('grid');
    
    for (var i = from; i <= to ; i += step) {
        obj.addVertex(i, 0, from);
        obj.addVertex(i, 0, to);
        obj.addVertex(from, 0, i);
        obj.addVertex(to, 0, i);
    }
    obj.createBuffers();
    return obj;
}

//end
