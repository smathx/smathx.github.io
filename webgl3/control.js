/*
    User interface support functions.    
 */
 
'use strict';

var control = [];

function initialiseUI() {

    control.selectItem = document.getElementById('selectItem');
    control.selectItem.onchange = function () {
        setCurrentItem(control.selectItem.value);
    }

    initialiseMouse();
    initialiseSliders();
    initialiseButtons();

    initialiseDrawControls();
    initialiseViewControls();
    initialiseLocationControls();
    initialiseAngleControls();
    initialiseConeControls();    
    initialiseCubeControls();    
    initialiseCylinderControls();    
    initialiseEllipsoidControls();
    initialiseSphereControls();
    initialiseTubeControls();   

    setCurrentItem(0);
}
    
//--Mouse----------------------------------------------------------------------

function initialiseMouse() {
    control.mouseDown = false;
    
    // Hook mouse down and wheel events to canvas - ignore outside.
    
    canvas.onmousedown = function(event) {
        control.mouseDown = true;
        control.lastMouseX = event.clientX;
        control.lastMouseY = event.clientY;
    }
    
    canvas.onwheel = function(event) {
        view.position[2] -= event.deltaY / 100;
    }
    
    // Hook mouse up and move events to page.
    
    document.onmouseup = function(event) {
        control.mouseDown = false;
    }
    
    document.onmousemove = function(event) {    
        if (!control.mouseDown)
            return;
        
        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - control.lastMouseX
        var newRotationMatrix = rotate(deltaX, [0, 1, 0]);

        var deltaY = newY - control.lastMouseY;
        newRotationMatrix = mult(newRotationMatrix, rotate(deltaY, [1, 0, 0]));

        view.rotationMatrix = mult(newRotationMatrix, view.rotationMatrix);

        control.lastMouseX = newX
        control.lastMouseY = newY;
    }
}

//--Buttons--------------------------------------------------------------------

function initialiseButtons() {
    control.resetViewBtn = document.getElementById('resetViewBtn');
    control.resetViewBtn.onclick = setView;
    
    control.clearSceneBtn = document.getElementById('clearSceneBtn');
    control.clearSceneBtn.onclick = clearScene;
    
    control.removeItemBtn = document.getElementById('removeItemBtn');
    control.removeItemBtn.onclick = function () {
        removeItem(currentItem);
    }
}   

//--Draw-----------------------------------------------------------------------

function initialiseDrawControls() {
    control.wireframe = document.getElementById('wireframe');
    control.wireframe.onclick = function () {
        setWireframe(control.wireframe.checked);
    }
    control.fillobject = document.getElementById('fillobject');
    control.fillobject.onclick = function () {
        setFill(control.fillobject.checked);
    }
    control.fillColour = document.getElementById('fillColour');
    control.fillColour.oninput = function () {
        shapeInstances[currentItem].fillColour = getColour(control.fillColour.value);
    }
    control.fillColourSlider = document.getElementById('fillColourSlider');
    control.fillColourSlider.oninput = function () {
        shapeInstances[currentItem].fillColour = getColourSlider(control.fillColourSlider.value);
        control.fillColour.value = getHexRGBString(shapeInstances[currentItem].fillColour);
    }    
}

//--View-----------------------------------------------------------------------

function initialiseViewControls() {
    control.fieldOfViewAngleY = document.getElementById('fieldOfViewAngleY');
    control.fieldOfViewAngleY.oninput = function () {
        view.fovy = control.fieldOfViewAngleY.value;
    }    
    //control.fieldOfViewFront = document.getElementById('fieldOfViewFront');
    //control.fieldOfViewFront.oninput = function () {
    //    view.front = control.fieldOfViewFront.value;
    //}    
    //control.fieldOfViewBack = document.getElementById('fieldOfViewBack');
    //control.fieldOfViewBack.oninput = function () {
    //    view.back = control.fieldOfViewBack.value;
    //}    
}

//--Location-------------------------------------------------------------------

function initialiseLocationControls() {
    control.locationX = document.getElementById('locationX');
    control.locationX.oninput = function () {
        shapeInstances[currentItem].location[0] = control.locationX.value;
    }
    control.locationY = document.getElementById('locationY');
    control.locationY.oninput = function () {
        shapeInstances[currentItem].location[1] = control.locationY.value;
    }
    control.locationZ = document.getElementById('locationZ');
    control.locationZ.oninput = function () {
        shapeInstances[currentItem].location[2] = control.locationZ.value;
    }
}

//--Angle----------------------------------------------------------------------

function initialiseAngleControls() {
    control.angleX = document.getElementById('angleX');
    control.angleX.oninput = function () {
        shapeInstances[currentItem].angle[0] = control.angleX.value;
    }
    control.angleY = document.getElementById('angleY');
    control.angleY.oninput = function () {
        shapeInstances[currentItem].angle[1] = control.angleY.value;
    }
    control.angleZ = document.getElementById('angleZ');
    control.angleZ.oninput = function () {
        shapeInstances[currentItem].angle[2] = control.angleZ.value;
    }
}

//--Cone-----------------------------------------------------------------------

function initialiseConeControls() {
    control.coneRadius = document.getElementById('coneRadius');
    control.coneHeight = document.getElementById('coneHeight');
    control.coneSides = document.getElementById('coneSides');
    
    control.addConeBtn = document.getElementById('addConeBtn');
    control.addConeBtn.onclick = function () {
        addCone(control.coneRadius.value, control.coneHeight.value,
                control.coneSides.value);
    }
}

function setConeControls(radius, height, sides) {
    control.coneRadius.value = radius;
    control.coneHeight.value = height;
    control.coneSides.value = sides;
}

//--Cube-----------------------------------------------------------------------

function initialiseCubeControls() {
    control.cubeWidth = document.getElementById('cubeWidth');
    control.cubeHeight = document.getElementById('cubeHeight');
    control.cubeDepth = document.getElementById('cubeDepth');
    
    control.addCubeBtn = document.getElementById('addCubeBtn');
    control.addCubeBtn.onclick = function () {
        addCube(control.cubeWidth.value, control.cubeHeight.value,
                                         control.cubeDepth.value);
    }
}

function setCubeControls(width, height, depth) {
    control.cubeWidth.value = width;
    control.cubeHeight.value = height;
    control.cubeDepth.value = depth;
}

//--Cylinder-------------------------------------------------------------------

function initialiseCylinderControls() {
    control.cylinderRadius = document.getElementById('cylinderRadius');
    control.cylinderHeight = document.getElementById('cylinderHeight');
    control.cylinderSides = document.getElementById('cylinderSides');
    
    control.addCylinderBtn = document.getElementById('addCylinderBtn');
    control.addCylinderBtn.onclick = function () {
        addCylinder(control.cylinderRadius.value, control.cylinderHeight.value,
                    control.cylinderSides.value);
    }
}

function setCylinderControls(radius, height, sides) {
    control.cylinderRadius.value = radius;
    control.cylinderHeight.value = height;
    control.cylinderSides.value = sides;
}

//--Ellipsoid------------------------------------------------------------------

function initialiseEllipsoidControls() {
    control.ellipsoidWidth = document.getElementById('ellipsoidWidth');
    control.ellipsoidHeight = document.getElementById('ellipsoidHeight');
    control.ellipsoidDepth = document.getElementById('ellipsoidDepth');
    control.ellipsoidSides = document.getElementById('ellipsoidSides');
    
    control.addEllipsoidBtn = document.getElementById('addEllipsoidBtn');
    control.addEllipsoidBtn.onclick = function () {
        addEllipsoid(control.ellipsoidWidth.value, 
                     control.ellipsoidHeight.value,
                     control.ellipsoidDepth.value, 
                     // ???? Must be rounded even though it's an integer.
                     Math.round(control.ellipsoidSides.value));
    }
}

function setEllipsoidControls(width, height, depth, sides) {
    control.ellipsoidWidth.value = width;
    control.ellipsoidHeight.value = height;
    control.ellipsoidDepth.value = depth;
    control.ellipsoidSides.value = sides;
}

//--Sphere---------------------------------------------------------------------

function initialiseSphereControls() {
    control.sphereRadius = document.getElementById('sphereRadius');
    control.sphereSides = document.getElementById('sphereSides');
    
    control.addSphereBtn = document.getElementById('addSphereBtn');
    control.addSphereBtn.onclick = function () {
        addSphere(control.sphereRadius.value, 
                  // ???? Must be rounded even though it's an integer.
                  Math.round(control.sphereSides.value));
    }
}

function setSphereControls(radius, height, sides) {
    control.sphereRadius.value = radius;
    control.sphereSides.value = sides;
}

//--Tube-----------------------------------------------------------------------

function initialiseTubeControls() {
    control.tubeRadiusFront = document.getElementById('tubeRadiusFront');
    control.tubeRadiusBack = document.getElementById('tubeRadiusBack');
    control.tubeHeight = document.getElementById('tubeHeight');
    control.tubeSides = document.getElementById('tubeSides');
    control.tubeCapFront = document.getElementById('tubeCapFront');
    control.tubeCapBack = document.getElementById('tubeCapBack');
    
    control.addTubeBtn = document.getElementById('addTubeBtn');
    control.addTubeBtn.onclick = function () {
        addTube(control.tubeRadiusFront.value, control.tubeRadiusBack.value, 
                control.tubeHeight.value, control.tubeSides.value,
                control.tubeCapFront.checked, control.tubeCapBack.checked); 
    }
}

function setTubeControls(radius_front, radius_back, height, sides, 
                         cap_front, cap_back) {
    control.tubeRadiusFront.value = radius_front;
    control.tubeRadiusBack.value = radius_back;
    control.tubeHeight.value = height;
    control.tubeSides.value = sides;
    control.tubeCapFront.checked = cap_front;
    control.tubeCapBack.checked = cap_back;
}

//-----------------------------------------------------------------------------

function setWireframe(state) {
    for (var i = 0; i < shapeInstances.length; ++i)
        if (shapeInstances[i] != null)
            shapeInstances[i].wireframe = state;
}

function setFill(state) {
    for (var i = 0; i < shapeInstances.length; ++i)
        if (shapeInstances[i] != null)
            shapeInstances[i].fill = state;
}

//-----------------------------------------------------------------------------

function setCurrentItem(item) {
    var obj = null;
    
    if ((item >= shapeInstances.length) || ((obj = shapeInstances[item]) == null)) {
        item = 0;
        while ((item < shapeInstances.length) && ((obj = shapeInstances[item]) == null))
            ++item;
    }
    
    if (obj == null)
    {
        currentItem = 0;
        return;
    }

    obj.fill = control.fillobject.checked;
    obj.wireframe = control.wireframe.checked;
    
    currentItem = item;
    
    updateSlider(control.angleX, obj.angle[0]);
    updateSlider(control.angleY, obj.angle[1]);
    updateSlider(control.angleZ, obj.angle[2]);

    updateSlider(control.locationX, obj.location[0]);
    updateSlider(control.locationY, obj.location[1]);
    updateSlider(control.locationZ, obj.location[2]);

    updateSlider(control.fillColour, getHexRGBString(obj.fillColour));
    // ???? set colour slider
    
    selectOption(item);
}

function addOptionToSelect(name, id) {
    var option = document.createElement('option');
    option.text = name;
    option.value = id;
    control.selectItem.add(option);
}

function removeOptionFromSelect(id) {
    for (var i = 0; i < control.selectItem.options.length; ++i) 
        if (control.selectItem.options[i].value == id) {
            control.selectItem.remove(i);
            break;
        }
}

function selectOption(id) {
    for (var i = 0; i < control.selectItem.options.length; ++i) 
        if (control.selectItem.options[i].value == id) {
            control.selectItem.selectedIndex = i;
            break;
        }
}

//-----------------------------------------------------------------------------

function getColour(value) {
    console.log(value);
    var field = value.match(/#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/);

    return [ parseInt(field[1], 16) / 255,
             parseInt(field[2], 16) / 255,
             parseInt(field[3], 16) / 255,
             1];
 }
 
 function getHexRGBString(colour) {
    var r = Math.round(colour[0] * 255); 
    var g = Math.round(colour[1] * 255); 
    var b = Math.round(colour[2] * 255);
    var rgb = (r << 16) + (g << 8) + b;
    
    return '#' + ((1 << 24) + rgb).toString(16).slice(1);    
 }

 function getColourSlider(value) {
    var num_div = 10;       // number of divisions for each transition

    // blue to cyan
    if (value <= num_div) return [ 0, value/num_div, 1, 1 ];
    value -= num_div;

    // cyan to green
    if (value <= num_div) return [ 0, 1, 1 - value/num_div, 1 ];
    value -= num_div;

    // green to yellow
    if (value <= num_div) return [ value/num_div, 1, 0, 1 ];
    value -= num_div;

    // yellow to red
    if (value <= num_div) return [ 1, 1 - value/num_div, 0, 1 ];
    value -= num_div;

    // red to magenta
    if (value <= num_div) return [ 1, 0, value/num_div, 1 ];
    value -= num_div;

    // magenta to blue
    if (value <= num_div) return [ 1 - value/num_div, 0, 1, 1 ];
    value -= num_div;

    // blue to black
    num_div /= 2;
    
    if (value <= num_div) return [ 0, 0, 1-value/num_div, 1 ];
    value -= num_div;

    // black to white
    num_div *= 3;
    if (value <= num_div) 
        return [ value/num_div, value/num_div, value/num_div, 1 ];
        
    return [1, 1, 1, 1];    // white if all else fails
 }

//end