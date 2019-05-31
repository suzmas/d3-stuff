/* eslint-disable new-cap */
/* global L */


const map = L.map('hardiness-map').setView([37.8, -96], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw',
}).addTo(map);

const ophzStyle = {
  fillColor: 'blue',
  fillOpacity: 0.3,
  weight: 0.5,
  color: '#000',
};

const geoLayer = new L.geoJSON();
geoLayer.addTo(map);


function addGeojson() {
  const request = new XMLHttpRequest();
  request.open('GET', 'assets/js/lophz.json');
  request.responseType = 'json';
  request.onload = () => {
    L.geoJSON(request.response, {
      style: ophzStyle,
    }).addTo(map);
  };
  request.send();
}

addGeojson();

function interpolateColor(color1, color2, factor) {
  if (arguments.length < 3) { 
      factor = 0.5; 
  }
  var result = color1.slice();
  for (var i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
};
// My function to interpolate between two colors completely, returning an array
function interpolateColors(color1, color2, steps) {
  var stepFactor = 1 / (steps - 1),
      interpolatedColorArray = [];

  color1 = color1.match(/\d+/g).map(Number);
  color2 = color2.match(/\d+/g).map(Number);

  for(var i = 0; i < steps; i++) {
      interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
  }

  return interpolatedColorArray;
}

var scale = function(opts){
  var istart = opts.domain[0],
      istop  = opts.domain[1],
      ostart = opts.range[0],
      ostop  = opts.range[1];

  return function scale(value) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }
};

function transitionRGB(val, max, start, end) {
  return start + (end - start) * val / max;
}

function transition3(val, max, start, end) {
  const r1 = transitionRGB(val, max, start[0], end[0]);
  const r2 = transitionRGB(val, max, start[1], end[1]);
  const r3 = transitionRGB(val, max, start[2], end[2]);
  return [r1, r2, r3];
}


// ex input transition3mid(35, 70, [69, 117, 180], [239, 195, 99], [165, 0, 38])
// also random http://strimas.com/r/ebird-county/
function transition3mid(val, max, start, mid, end) {
  const midPoint = max / 2;
  if (val < midPoint) {
    return transition3(val, midPoint, start, mid);
  }
  return transition3(val - midPoint, midPoint, mid, end);
}
