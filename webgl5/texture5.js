"use strict";

var gl;

function main() {
  var canvas;

  var control = [];
  var items = [];
  var materials = [];
  var view = {};
  var images = [];
  var frameCount = { count: 0, lastTime: 0 };

  var animate = false;

  initialiseSliders();
  initialiseViewControls();
  initialisePerspectiveControls();
  initialiseLightingControls();
  initialiseMaterialControls();

  if (!initialiseWebGL())
    return;

  initialiseMouse();        // must be after webgl initialisation
  initialiseImages();

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Program setup

  var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  // Attributes

  var a_position = gl.getAttribLocation(program, 'a_position');
  var a_normal = gl.getAttribLocation(program, 'a_normal');
  var a_texCoord = gl.getAttribLocation(program, 'a_texCoord');

  // Uniforms

  var u_projection = gl.getUniformLocation(program, 'u_projection');
  var u_modelView = gl.getUniformLocation(program, 'u_modelView');
  var u_view = gl.getUniformLocation(program, 'u_view');
  var u_grid = gl.getUniformLocation(program, 'u_grid');
  var u_gridColour = gl.getUniformLocation(program, 'u_gridColour');
  var u_mapType = gl.getUniformLocation(program, 'u_mapType');

  var u_material = {
    ambient:    gl.getUniformLocation(program, 'u_material.ambient'),
    diffuse:    gl.getUniformLocation(program, 'u_material.diffuse'),
    specular:   gl.getUniformLocation(program, 'u_material.specular'),
    shininess:  gl.getUniformLocation(program, 'u_material.shininess')
  };

  control.lights.forEach(function (light, index) {
    light.uniform = {
        enabled:    gl.getUniformLocation(program, 'u_lights['+index+'].enabled'),
        ambient:    gl.getUniformLocation(program, 'u_lights['+index+'].ambient'),
        diffuse:    gl.getUniformLocation(program, 'u_lights['+index+'].diffuse'),
        specular:   gl.getUniformLocation(program, 'u_lights['+index+'].specular'),
        position:   gl.getUniformLocation(program, 'u_lights['+index+'].position'),
    };
  });

  // Buffers

  createItem(createSphere(50),        [ 0, 0, 0], materials[0]);
  //createItem(createCylinder(50, 100), [-100, 0,  100], materials[1]);
  //createItem(createCube(100),         [-100, 0, -100], materials[2]);
  //createItem(createCone(50, 100),     [ 100, 0, -100], materials[3]);
  
  initialiseAngleControls();

  var grid = createGrid(-500, 500, 50);
  var gridPlane = false;
  
  var mapType = 0;

  setView();
  tick();


  function tick() {
    requestAnimFrame(tick);
    updateFrameRate();
    drawScene();
  }

  function updateFrameRate() {
    var now = Date.now();
    
    frameCount.count++;
    
    if ((now - frameCount.lastTime) > 1000) {
      var fps = frameCount.count * 1000 / (now - frameCount.lastTime);
      document.getElementById('frameRate').innerText = fps.toFixed(0);
      
      frameCount.lastTime = now;
      frameCount.count = 0;
    }
  }

  function initialiseImages() {
    var textures = [
                    'earth.png',
                    'moon.png',
                    'mars.png',
                    'jupiter.png',
                    'pluto.png',
                    'brick.png',
                    'wood.png',
                    'honeycomb.png'
                   ];

    textures.forEach(function (file) { loadTextureImage(file); });
    
    control.selectTexture = document.getElementById('selectTexture');
    control.selectTexture.onchange = function () {
        control.textureId = Number(control.selectTexture.value);
    }
    control.selectTexture.onchange();
    
    control.selectMapType = document.getElementById('selectMapType');
    control.selectMapType.onchange = function () {
        mapType = Number(control.selectMapType.value);
    }
    //control.selectMapType.onchange();
    
    // chequerboard pattern, red on white
    images.push({ texture: createTexture('#ff0000', '#ffffff') });                   
  }

  function loadTextureImage(file) {

    function textureLoaded(image) {
      console.log("Texture image file loaded: " + file);
      gl.bindTexture(gl.TEXTURE_2D, image.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image.HTMLimage);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    var image = { source: file,
                  texture: gl.createTexture(),
                  HTMLimage: new Image()
                };

    image.HTMLimage.onload = function () { textureLoaded(image); };
    image.HTMLimage.src = image.source;

    images.push(image);
  }

  function initialiseViewControls() {
 /*   var gridPlaneE = document.getElementById('gridPlane');
    gridPlaneE.onclick = function () {
        gridPlane = gridPlaneE.checked;
    };
*/
    control.perspectiveViewE = document.getElementById('perspectiveView');
    control.perspectiveViewE.onclick = function () {
        view.perspective = true;
    }
    
    var orthonormalViewE = document.getElementById('orthonormalView');
    orthonormalViewE.onclick = function () {
        view.perspective = false;
    }
    
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
      control.perspectiveViewE.checked = view.perspective;
      updateSlider(control.eyeDistance, view.distance);
      updateSlider(control.eyeTheta, 90 - view.theta);
      updateSlider(control.eyePhi, view.phi);
  }

  function initialisePerspectiveControls() {
    view.fieldOfView = 45;
    view.nearLimit = 1;
    view.farLimit = 1000;
  }

  function initialiseAngleControls() {
    function updateRotation(index, ui) {
      if (items.length > 0)
        items[0].rotation[index] = Number(ui.value);
    }

    var animateE = document.getElementById('animate');
    animateE.onclick = function () {
        animate = animateE.checked;
    };
    animateE.onclick();

    control.angleX = document.getElementById('angleX');
    control.angleX.oninput = function () {
        updateRotation(0, angleX);
    };
    control.angleX.oninput();
    
    control.angleY = document.getElementById('angleY');
    control.angleY.oninput = function () {
        updateRotation(1, angleY);
    };
    control.angleY.oninput();
    
    control.angleZ = document.getElementById('angleZ');
    control.angleZ.oninput = function () {
        updateRotation(2, angleZ);
    };
    control.angleZ.oninput();
    setAngleControls();
  }

  function setAngleControls() {
      function setAngle(angle) {
          if (angle > 360)
              angle = angle % 360;
          else if (angle < 0)
              angle = 360 + angle % 360;
          return angle;
      }
      
      if (items.length > 0) {
        updateSlider(control.angleX, setAngle(items[0].rotation[0]));
        updateSlider(control.angleY, setAngle(items[0].rotation[1]));
        updateSlider(control.angleZ, setAngle(items[0].rotation[2]));
      }
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
            enabled:  true,
            position: [ 0.0, 0.0, 0.0 ],
            diffuse:  [ 1.0, 1.0, 1.0, 1.0 ],
            ambient:  [ 1.0, 1.0, 1.0, 1.0 ],
            specular: [ 1.0, 1.0, 1.0, 1.0 ],
            animate:  false,
            angle:    0,
            vector:   vec4(0, 0, 0, 1)
        });
    }

    createLight();

    control.lights.forEach(function(light, index) {
        ++index; // count from one

        //light.switch = document.getElementById('light' + index + 'Switch');
        //light.switch.onclick = function () {
        //    light.enabled = light.switch.checked;
        //};
        //light.switch.onclick();

        light.animateE = document.getElementById('light' + index + 'Animate');
        light.animateE.onclick = function () {
            light.animate = light.animateE.checked;
            if (light.animate) {
                light.vector = vec4(light.position);
                light.angle = 0;
            }
        };

        light.positionX = document.getElementById('light' + index + 'PositionX');
        light.positionX.oninput = function () {
            light.position[0] = Number(light.positionX.value);
        };
        light.positionX.oninput();
        light.positionY = document.getElementById('light' + index + 'PositionY');
        light.positionY.oninput = function () {
            light.position[1] = Number(light.positionY.value);
        };
        light.positionY.oninput();
        light.positionZ = document.getElementById('light' + index + 'PositionZ');
        light.positionZ.oninput = function () {
            light.position[2] = Number(light.positionZ.value);
        };
        light.positionZ.oninput();

        light.ambientE = document.getElementById('light' + index + 'Ambient');
        light.ambientE.oninput = function () {
            light.ambient = getColour(light.ambientE.value);
        };
        light.ambientE.oninput();

        light.diffuseE = document.getElementById('light' + index + 'Diffuse');
        light.diffuseE.oninput = function () {
            light.diffuse = getColour(light.diffuseE.value);
        };
        light.diffuseE.oninput();

        light.specularE = document.getElementById('light' + index + 'Specular');
        light.specularE.oninput = function () {
            light.specular = getColour(light.specularE.value);
        };
        light.specularE.oninput();
    });
  }

  function setLightControls() {
    control.lights.forEach(function (light, index) {
      if (light.enabled) {
        updateSlider(light.positionX, light.position[0]);
        updateSlider(light.positionY, light.position[1]);
        updateSlider(light.positionZ, light.position[2]);
      }
    });
  }

  function updateMaterial() {
  }

  function initialiseMaterialControls() {
    materials.push(createMaterial());
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

        if (view.theta < 0.1) view.theta = 0.1;
        if (view.theta >= 180) view.theta = 180;

        view.phi += newX - control.lastX;

        if (view.phi < -180) view.phi = -180;
        if (view.phi > 180) view.phi = 180;

        control.lastX = newX;
        control.lastY = newY;

        setViewControls();
    };
  }

  function setView() {
    view.theta = 90;
    view.phi = 0;
    view.distance = 200;
    view.perspective = true;
    view.fieldOfView = 45;
    view.nearLimit = 1;
    view.farLimit = 1000;
    setViewControls();
  }

  function updateFieldOfView(ui) {
    fieldOfView = Number(ui.value);
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
            ambient:   ambient   || [ 1.0, 1.0, 1.0, 1.0 ],
            diffuse:   diffuse   || [ 1.0, 1.0, 1.0, 1.0 ],
            specular:  specular  || [ 1.0, 1.0, 1.0, 1.0 ],
            shininess: shininess || 100
            };
  }
/*
  function createPattern(size) {
    var image = new Uint8Array(size * size * 4);
    var index = 0;

    for (var i = 0; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
            var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));

            image[index++] = 255 * c;
            image[index++] = 255 * c;
            image[index++] = 255 * c;
            image[index++] = 255;
        }
    }
    console.log(image);
    return image;
  }
*/
  function createTexture(colour1, colour2) {
    var canvas  = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = 512;
    canvas.height = 512;
    
    context.fillStyle = colour1;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = colour2;
 
    var step = canvas.height / 8;
 
    for (var j = 0; j < canvas.height; j += 2 * step) {
      for (var i = 0; i < canvas.width; i += step) {
        context.fillRect( i,  j, step / 2, step);
        context.fillRect( i+step/2, j+step, step/2, step);
      }
    }
    
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
  
  function drawScene() {
    if (!gl)
        return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var matrix;
    var projectionMatrix;
    var aspectRatio = canvas.clientWidth / canvas.clientHeight;

    if (view.perspective)
      projectionMatrix = perspective(view.fieldOfView, aspectRatio,
                                     view.nearLimit, view.farLimit);
    else
      projectionMatrix = ortho(-75, 75, -75, 75, view.nearLimit, view.farLimit);

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
        item.rotation[1] -= 1;
        setAngleControls();
      }

      matrix = mult(matrix, translate(item.position));
      matrix = mult(matrix, rotateX(item.rotation[0]));
      matrix = mult(matrix, rotateY(item.rotation[1]));
      matrix = mult(matrix, rotateZ(item.rotation[2]));
      matrix = mult(matrix, scalem(item.scale));

      gl.uniformMatrix4fv(u_modelView, false, flatten(matrix));
      gl.uniformMatrix4fv(u_view, false, flatten(cameraMatrix));
      gl.uniformMatrix4fv(u_projection, false, flatten(projectionMatrix));

      // set material
      gl.uniform4fv(u_material.ambient, item.material.ambient);
      gl.uniform4fv(u_material.diffuse, item.material.diffuse);
      gl.uniform4fv(u_material.specular, item.material.specular);
      gl.uniform1f(u_material.shininess, item.material.shininess);

      // set lights
      control.lights.forEach(function (light) {
        gl.uniform1i(light.uniform.enabled, light.enabled);

        if (light.enabled) {

          if (light.animate) {
            light.angle += 3;

            light.position[0] = 1000 * Math.cos(radians(light.angle));
            light.position[2] = 1000 * Math.sin(radians(light.angle));

            setLightControls();
          }

          gl.uniform4fv(light.uniform.ambient, flatten(light.ambient));
          gl.uniform4fv(light.uniform.diffuse, flatten(light.diffuse));
          gl.uniform4fv(light.uniform.specular, flatten(light.specular));
          gl.uniform4fv(light.uniform.position, flatten(vec4(light.position)));
        }
      });

      item.shape.setNormalBuffer(a_normal);
      item.shape.setVertexBuffer(a_position);
      item.shape.setTextureCoordBuffer(a_texCoord);
      item.shape.setIndexBuffer();
      
      var texture = images[control.textureId].texture;
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(gl.getUniformLocation(program, "texture"), texture);
      
      gl.uniform1i(u_mapType, mapType);

      gl.drawElements(gl.TRIANGLES, item.shape.numElements, gl.UNSIGNED_SHORT, 0);
    });

    if (gridPlane) {
      gl.uniform1i(u_grid, 1);
      gl.uniformMatrix4fv(u_modelView, false, flatten(cameraMatrix));
      gl.uniform4fv(u_gridColour, [0.9,0.9,0.9,1]);

      grid.setVertexBuffer(a_position);
      gl.drawArrays(gl.LINES, 0, grid.vertexCount);
      gl.uniform1i(u_grid, 0);
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
