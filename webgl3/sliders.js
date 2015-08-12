/**
    This function finds input 'range' controls with class 'slider' and 
    adds ticks and values.
 */

function initialiseSliders() {

  function setSlider(element) {

    function aInt(attribute) {
      var a = element.getAttribute(attribute);
      return a ? parseInt(a) : null;
    }
    
    if (element.classList.contains('ticks')) {

      var min = aInt('min');
      var max = aInt('max');

      if ((min != null) && (max != null)) {

        var step = aInt('step');
        var interval = aInt('interval');

        if (step == null)
          step = 1;

        if (interval)
          step = interval;

        var datalist = document.createElement('datalist');

        datalist.id = element.id + '-ticks';
        element.setAttribute('list', datalist.id);

        for (var i = min; i < max + step; i += step) {
          datalist.innerHTML += '<option value=' + i + '></option>';
        }
        element.parentNode.insertBefore(datalist, element.nextSibling);
      }
    }

    if (element.classList.contains('value')) {

      var output = document.createElement('output');

      output.id = element.id + '-output';
      output.className = 'slider-output';
      output.suffix = element.getAttribute('suffix');
      
      if (output.suffix == null)
        output.suffix = '';
        
      output.value = element.value + output.suffix;

      element.parentNode.insertBefore(output, element.nextSibling);

      element.addEventListener('input', function(event) {
        var slider = event.currentTarget;
        var output = document.getElementById(slider.id+'-output');
        output.value = slider.value + output.suffix;
      });
    }
  }

  var lists = document.querySelectorAll('.slider');
  var arr = Array.prototype.slice.call(lists);
  arr.forEach(setSlider);
}

function updateSlider(slider, value) {
    var output = document.getElementById(slider.id+'-output');
    
    slider.value = value;
    
    if (output != null)
        output.value = slider.value + output.suffix;
}

//end
