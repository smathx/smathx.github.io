"use strict";

var gl;

function main() {

  var canvas;
  
  var control = [];
  var items = [];
  var materials = [];
  var view = {};

  var animate = false;
  
  initialiseSliders();
  initialiseOptionControls();
  initialisePerspectiveControls();
  //initialiseLocationControls();
  //initialiseAngleControls();
  //initialiseScaleControls();
  initialiseLightingControls();
  initialiseMaterialControls();

  if (!initialiseWebGL())
    return;

  initialiseMouse();        // must be after webgl initialisation

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Program setup

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  // Attributes

  var a_position = gl.getAttribLocation(program, "a_position");
  var a_normal = gl.getAttribLocation(program, "a_normal");

  // Uniforms

  var u_projection = gl.getUniformLocation(program, "u_projection");
  var u_modelView = gl.getUniformLocation(program, 'u_modelView');
  var u_view = gl.getUniformLocation(program, 'u_view');

  var u_ambientProduct1 = gl.getUniformLocation(program, 'u_ambientProduct1');
  var u_diffuseProduct1 = gl.getUniformLocation(program, 'u_diffuseProduct1');
  var u_specularProduct1 = gl.getUniformLocation(program, 'u_specularProduct1');
  var u_lightPosition1 = gl.getUniformLocation(program, 'u_lightPosition1');
  var u_shininess1 = gl.getUniformLocation(program, 'u_shininess1');

  var u_ambientProduct2 = gl.getUniformLocation(program, 'u_ambientProduct2');
  var u_diffuseProduct2 = gl.getUniformLocation(program, 'u_diffuseProduct2');
  var u_specularProduct2 = gl.getUniformLocation(program, 'u_specularProduct2');
  var u_lightPosition2 = gl.getUniformLocation(program, 'u_lightPosition2');
  var u_shininess2 = gl.getUniformLocation(program, 'u_shininess2');

  // Buffers

  createItem(createSphere(50),        [ 100, 0,  100], materials[0]);
  createItem(createCylinder(50, 100), [-100, 0,  100], materials[1]);
  createItem(createCube(100),         [-100, 0, -100], materials[2]);
  createItem(createCone(50, 100),     [ 100, 0, -100], materials[3]);
  
  var grid = createGrid(-500, 500, 50);
  var gridPlane = false;

  var translation = [ 0, 0, 0 ];
  var rotation = [ 0, 0, 0 ];
  var scale = [ 1, 1, 1 ];

  setView();
//  drawScene();
    tick();


  function tick() {
    requestAnimFrame(tick);
    drawScene();
  }

  function initialiseOptionControls() {
    var gridPlaneE = document.getElementById('gridPlane');
    gridPlaneE.onclick = function () {
        gridPlane = gridPlaneE.checked;
        drawScene();
    };

    var animateE = document.getElementById('animate');
    animateE.onclick = function () {
        animate = animateE.checked;
    };

    control.eyeDistance = document.getElementById('eyeDistance');
    control.eyeDistance.oninput = function () {
        view.distance = Number(control.eyeDistance.value);
    };
    control.eyeDistance.oninput();
    
    control.eyeTheta = document.getElementById('eyeTheta');
    control.eyeTheta.oninput = function () {
        view.theta = 90 - Number(control.eyeTheta.value);
    };
    control.eyeTheta.oninput();
    
    control.eyePhi = document.getElementById('eyePhi');
    control.eyePhi.oninput = function () {
        view.phi = Number(control.eyePhi.value);
    };
    control.eyePhi.oninput();
    
    control.resetViewBtn = document.getElementById('resetViewBtn');
    control.resetViewBtn.onclick = setView;
  }
  
  function setViewControls() {
      updateSlider(control.eyeDistance, view.distance);
      updateSlider(control.eyeTheta, 90 - view.theta);
      updateSlider(control.eyePhi, view.phi);
  }

  function initialisePerspectiveControls() {
    view.fieldOfView = 45;
    view.nearLimit = 1;
    view.farLimit = 1000;
  }

  function initialiseLocationControls() {
    var locationX = document.getElementById('locationX');
    locationX.oninput = function () {
        updatePosition(0, locationX);
    };
    var locationY = document.getElementById('locationY');
    locationY.oninput = function () {
        updatePosition(1, locationY);
    };
    var locationZ = document.getElementById('locationZ');
    locationZ.oninput = function () {
        updatePosition(2, locationZ);
    };
  }

  function initialiseAngleControls() {
    var angleX = document.getElementById('angleX');
    angleX.oninput = function () {
        updateRotation(0, angleX);
    };
    var angleY = document.getElementById('angleY');
    angleY.oninput = function () {
        updateRotation(1, angleY);
    };
    var angleZ = document.getElementById('angleZ');
    angleZ.oninput = function () {
        updateRotation(2, angleZ);
    };
  }

  function initialiseScaleControls() {
    var scaleX = document.getElementById('scaleX');
    scaleX.oninput = function () {
        updateScale(0, scaleX);
    };
    var scaleY = document.getElementById('scaleY');
    scaleY.oninput = function () {
        updateScale(1, scaleY);
    };
    var scaleZ = document.getElementById('scaleZ');
    scaleZ.oninput = function () {
        updateScale(2, scaleZ);
    };
  }

  function getColour(value) {
    var field = value.match(/#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/);

    return [ parseInt(field[1], 16) / 255,
             parseInt(field[2], 16) / 255,
             parseInt(field[3], 16) / 255,
             1];
  }

  function initialiseLightingControls() {

    control.lights = [];

    function createLight() {
        control.lights.push({
            position: [ 0, 0, 0 ],
            diffuse:  [ 1, 1, 1, 1 ],
            ambient:  [ 1, 1, 1, 1 ],
            specular: [ 1, 1, 1, 1 ]
        });
    }

    createLight();
    createLight();

    control.lights.forEach(function(light, index) {
        ++index; // count from one

        light.switch = document.getElementById('light' + index + 'Switch');
        light.switch.onclick = function () {
            light.enabled = light.switch.checked;
            drawScene();
        };        
        light.switch.onclick();
        
        light.positionX = document.getElementById('light' + index + 'PositionX');
        light.positionX.oninput = function () {
            light.position[0] = Number(light.positionX.value);
            drawScene();
        };
        light.positionX.oninput();
        light.positionY = document.getElementById('light' + index + 'PositionY');
        light.positionY.oninput = function () {
            light.position[1] = Number(light.positionY.value);
            drawScene();
        };
        light.positionY.oninput();
        light.positionZ = document.getElementById('light' + index + 'PositionZ');
        light.positionZ.oninput = function () {
            light.position[2] = Number(light.positionZ.value);
            drawScene();
        };
        light.positionZ.oninput();

        light.ambientE = document.getElementById('light' + index + 'Ambient');
        light.ambientE.oninput = function () {
            light.ambient = getColour(light.ambientE.value);
            drawScene();
        };
        light.ambientE.oninput();

        light.diffuseE = document.getElementById('light' + index + 'Diffuse');
        light.diffuseE.oninput = function () {
            light.diffuse = getColour(light.diffuseE.value);
            drawScene();
        };
        light.diffuseE.oninput();

        light.specularE = document.getElementById('light' + index + 'Specular');
        light.specularE.oninput = function () {
            light.specular = getColour(light.specularE.value);
            drawScene();
        };
        light.specularE.oninput();
    });
}

  function updateMaterial() {
    //items.forEach(function(item) {
    //    item.material = material;
    //});
    drawScene();
  }

  function initialiseMaterialControls() {
    materials.push(createMaterial());
    materials.push(createMaterial());
    materials.push(createMaterial());
    materials.push(createMaterial());
            
    materials.forEach(function (material, index) {
        ++index;
        
        material.ambientE = document.getElementById('materialAmbient' + index);
        material.ambientE.oninput = function () {
            material.ambient = getColour(material.ambientE.value).slice();
            updateMaterial();
        };
        material.ambientE.oninput();

        material.diffuseE = document.getElementById('materialDiffuse' + index);
        material.diffuseE.oninput = function () {
            material.diffuse = getColour(material.diffuseE.value).slice();
            updateMaterial();
        };
        material.diffuseE.oninput();

        material.specularE = document.getElementById('materialSpecular' + index);
        material.specularE.oninput = function () {
            material.specular = getColour(material.specularE.value).slice();
            updateMaterial();
        };
        material.specularE.oninput();

        material.shininessE = document.getElementById('materialShininess' + index);
        material.shininessE.oninput = function () {
            material.shininess = material.shininessE.value;
            updateMaterial();
        };
        material.shininessE.oninput();
    });
}

  function initialiseMouse() {
    control.mouseDown = false;
    view.theta = 0;
    view.phi = 0;
    view.distance = 100;
    control.lastX = 0;
    control.lastY = 0;
    
    // Hook mouse down and wheel events to canvas - ignore outside.

    canvas.onmousedown = function (event) {
        control.mouseDown = true;
        control.lastX = event.clientX;
        control.lastY = event.clientY;
    };

    canvas.onwheel = function (event) {
        view.distance += event.deltaY / 2;
        if (view.distance < 0) view.distance = 0;
        if (view.distance > 1000) view.distance = 1000;
        setViewControls();
    };

    // Hook mouse up and move events to page.

    document.onmouseup = function (event) {
        control.mouseDown = false;
    };

    document.onmousemove = function (event) {
        if (!control.mouseDown) {
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        view.theta += newY - control.lastY;
        
        if (view.theta < -90) view.theta = -90;
        if (view.theta >= 90) view.theta = 89.999;
        
        view.phi += newX - control.lastX;

        if (view.phi < -180) view.phi = -180;
        if (view.phi > 180) view.phi = 180;
        
        control.lastX = newX;
        control.lastY = newY;
        
        setViewControls();
    };
  }

  function setView() {
    view.theta = 45;
    view.phi = 45;
    view.distance = 500;
    view.fieldOfView = 45;
    view.nearLimit = 1;
    view.farLimit = 1000;
    setViewControls();
  }

  function updateFieldOfView(ui) {
    fieldOfView = Number(ui.value);
    drawScene();
  }

  function updatePosition(index, ui) {
    translation[index] = Number(ui.value);
    drawScene();
  }

  function updateRotation(index, ui) {
    rotation[index] = Number(ui.value);
    drawScene();
  }

  function updateScale(index, ui) {
    scale[index] = Number(ui.value);
    drawScene();
  }

  function createItem(shape, position, material, rotation, scale) {
    var item = {
                shape:    shape,
                position: position || [ 0, 0, 0 ],
                rotation: rotation || [ 0, 0, 0 ],
                scale:    scale || [ 1, 1, 1 ],
                material: material || createMaterial()
                };

    items.push(item);
    return item;
  }

  function createMaterial(ambient, diffuse, specular, shininess) {
    return {
            ambient:   ambient   || [ 0.2, 0.2, 0.2, 1.0 ],
            diffuse:   diffuse   || [ 1.0, 0.0, 0.0, 1.0 ],
            specular:  specular  || [ 1.0, 1.0, 1.0, 1.0 ],
            shininess: shininess || 100
            };
  }

  function drawScene() {
    if (!gl)
        return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var matrix;
    var aspectRatio = canvas.clientWidth / canvas.clientHeight;

    var projectionMatrix = perspective(view.fieldOfView, aspectRatio, 
                                       view.nearLimit, view.farLimit);

    // ???? check this bit
    var theta = radians(view.theta);        // elevation, +/- 90
    var phi = radians(view.phi);            // azimuth, +/- 180
    var eye = vec3( 
                    view.distance * Math.sin(theta) * Math.sin(phi),
                    view.distance * Math.cos(theta),
                    view.distance * Math.sin(theta) * Math.cos(phi)
                    );
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var cameraMatrix = lookAt(eye, target, up);

    items.forEach(function (item) {

      matrix = mat4();
      matrix = mult(matrix, cameraMatrix);

      if (animate) {
        item.rotation[0] += 1.1;
        item.rotation[1] += 1.3;
        item.rotation[2] += 1.7;          
      }
      
      matrix = mult(matrix, translate(item.position));
      matrix = mult(matrix, rotateX(item.rotation[0]));
      matrix = mult(matrix, rotateY(item.rotation[1]));
      matrix = mult(matrix, rotateZ(item.rotation[2]));
      matrix = mult(matrix, scalem(item.scale));

      gl.uniformMatrix4fv(u_modelView, false, flatten(matrix));
      gl.uniformMatrix4fv(u_view, false, flatten(cameraMatrix));
      gl.uniformMatrix4fv(u_projection, false, flatten(projectionMatrix));

// ???? ought to be in a loop
      // first light source
      var light = control.lights[0];
      
      gl.uniform4fv(u_lightPosition1, vec4(light.position));

      var ambientProduct = mult(light.ambient, item.material.ambient);
      var diffuseProduct = mult(light.diffuse, item.material.diffuse);
      var specularProduct = mult(light.specular, item.material.specular);
      
      if (!light.enabled) {
        ambientProduct = [ 0, 0, 0, 1 ];
        diffuseProduct = [ 0, 0, 0, 1 ];
        specularProduct = [ 0, 0, 0, 1 ];
      }

      gl.uniform4fv(u_ambientProduct1, flatten(ambientProduct));
      gl.uniform4fv(u_diffuseProduct1, flatten(diffuseProduct));
      gl.uniform4fv(u_specularProduct1, flatten(specularProduct));
      gl.uniform1f(u_shininess1, item.material.shininess);

      // second light source
      var light = control.lights[1];
      
      gl.uniform4fv(u_lightPosition2, vec4(light.position));

      ambientProduct = mult(light.ambient, item.material.ambient);
      diffuseProduct = mult(light.diffuse, item.material.diffuse);
      specularProduct = mult(light.specular, item.material.specular);
      
      if (!light.enabled) {
        ambientProduct = [ 0, 0, 0, 1 ];
        diffuseProduct = [ 0, 0, 0, 1 ];
        specularProduct = [ 0, 0, 0, 1 ];
      }

      gl.uniform4fv(u_ambientProduct2, flatten(ambientProduct));
      gl.uniform4fv(u_diffuseProduct2, flatten(diffuseProduct));
      gl.uniform4fv(u_specularProduct2, flatten(specularProduct));
      gl.uniform1f(u_shininess2, item.material.shininess);

      item.shape.setNormalBuffer(a_normal);
      item.shape.setVertexBuffer(a_position);
      item.shape.setIndexBuffer();
      gl.drawElements(gl.TRIANGLES, item.shape.numElements, gl.UNSIGNED_SHORT, 0);
    });

    if (gridPlane) {
      gl.uniformMatrix4fv(u_modelView, false, flatten(cameraMatrix));
      
      gl.uniform4fv(u_ambientProduct1, [0.2,0.2,0.2,1]);
      gl.uniform4fv(u_diffuseProduct1, [0.2,0.2,0.2,1]);
      gl.uniform4fv(u_specularProduct1, [1,1,1,1]);
      gl.uniform1f(u_shininess1, 10);
      gl.uniform4fv(u_ambientProduct2, [0.2,0.2,0.2,1]);
      gl.uniform4fv(u_diffuseProduct2, [0.2,0.2,0.2,1]);
      gl.uniform4fv(u_specularProduct2, [1,1,1,1]);
      gl.uniform1f(u_shininess2, 10);

      grid.setVertexBuffer(a_position);
      gl.drawArrays(gl.LINES, 0, grid.vertexCount);
    }
  }

  function initialiseWebGL() {

    canvas = document.getElementById('webgl');

    if ((gl = WebGLUtils.setupWebGL(canvas)) === null) {
        alert('WebGL is not available!');
        return false;
    }

    gl.clearColor(0.1, 0.1, 0.1, 1.0);      // Clear to opaque grey.
    gl.clearDepth(1.0);                     // Clear everything.
    gl.enable(gl.DEPTH_TEST);               // Enable depth testing.
    gl.depthFunc(gl.LEQUAL);                // Near obscures far.
    gl.enable(gl.POLYGON_OFFSET_FILL);      // Fix grid 'stitching' problem
    gl.polygonOffset(1.0, 1.0);
    return true;
  }
}

window.addEventListener('load', main);
