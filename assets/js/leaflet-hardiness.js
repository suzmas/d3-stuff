/* eslint-disable new-cap */
/* global L */


const map = L.map('hardiness-map').setView([37.8, -96], 4);


L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
}).addTo(map);

function ophzStyle(feature) {
  return {
    fillColor: getColor(feature.properties.DN),
    fillOpacity: 0.8,
    weight: 0,
    color: '#000',
  };
}

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


function scale(domain, range) {
  const dMin = domain[0];
  const dMax = domain[1];
  const rMin = range[0];
  const rMax = range[1];
  return value => rMin + (rMax - rMin)
                  * ((value - dMin) / (dMax - dMin));
}

const scaled = scale([-40, 40], [0, 100]);
const color1 = [69, 117, 180];
const color2 = [239, 195, 99];
const color3 = [165, 0, 38];

function transitionRGBChannel(val, max, start, end) {
  return start + (end - start) * val / max;
}

function transitionRGB(val, max, start, end) {
  const r1 = transitionRGBChannel(val, max, start[0], end[0]);
  const r2 = transitionRGBChannel(val, max, start[1], end[1]);
  const r3 = transitionRGBChannel(val, max, start[2], end[2]);
  return [r1, r2, r3];
}

// ex input transition3mid(35, 70, [69, 117, 180], [239, 195, 99], [165, 0, 38])
function transition3mid(val, max, start, mid, end) {
  const midPoint = max / 2;
  if (val < midPoint) {
    return transitionRGB(val, midPoint, start, mid);
  }
  return transitionRGB(val - midPoint, midPoint, mid, end);
}

function getColor(val) {
  const scaledVal = scaled(val);
  const rgb = `rgb(${(transition3mid(scaledVal, 100, color1, color2, color3)).join(',')}`;
  return rgb;
}
