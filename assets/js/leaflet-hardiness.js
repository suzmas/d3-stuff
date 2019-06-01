/* eslint-disable new-cap */
/* global L */


const map = L.map('hardiness-map').setView([37.8, -96], 4);


L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
}).addTo(map);


function scale(domain, range) {
  const dMin = domain[0];
  const dMax = domain[1];
  const rMin = range[0];
  const rMax = range[1];
  return value => rMin + (rMax - rMin)
                  * ((value - dMin) / (dMax - dMin));
}

const colorScale = scale([-40, 40], [0, 100]);
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
  const scaledVal = colorScale(val);
  const rgb = `rgb(${(transition3mid(scaledVal, 100, color1, color2, color3)).join(',')}`;
  return rgb;
}

function ophzStyle(feature) {
  return {
    fillColor: getColor(feature.properties.DN),
    fillOpacity: 0.8,
    weight: 0,
    color: '#000',
  };
}

function showPlants(plants) {
  const plantEls = plants.map(p => `
      <div class="plant">
        <a href="${p.url}" target="_blank"><img src="https://s3.amazonaws.com/ophz-plant-ims/images/${p.img_nm}" /></a>
        <div class="details">
          <h3 class="title"><a href="${p.url}" target="_blank">${p.name}</a></h3>
          <p class="family"><span class="label">Family</span> ${p.family}</p>
          <p class="sun"><span class="label">Sun</span> ${p.sun}</p>
          <p class="water"><span class="label">Water</span> ${p.water}</p>
          <p class="maintenance"><span class="label">Maintenance</span> ${p.maintenance}</p>
        </div>
        <a class="button" href="${p.url}" target="_blank">Details ></a>
      </div>`);
  document.querySelector('.grid').innerHTML = plantEls.join('');
}

function getPlants(zone) {
  fetch(`./data/plantsd-zone${zone}.json`)
      .then((response) => {
        response.json().then(data => showPlants(data));
      })
      .catch((err) => { console.log(err); });
}

function tempToZone(temp) {
  const zoneScale = scale([-50, 50], [2, 11]);
  const adjTemp = zoneScale(temp);
  const zone = Math.ceil(adjTemp);
  return zone;
}

function zoneClicked(e) {
  const layer = e.target;
  const temp = layer.feature.properties.DN;
  const zone = tempToZone(temp);
  getPlants(zone);
}

function zoneEvent(feature, layer) {
  layer.on({
    click: zoneClicked,
  });
}

function addGeojson() {
  const request = new XMLHttpRequest();
  request.open('GET', 'assets/js/lophz.json');
  request.responseType = 'json';
  request.onload = () => {
    L.geoJSON(request.response, {
      style: ophzStyle,
      onEachFeature: zoneEvent,
    }).addTo(map);
  };
  request.send();
}

addGeojson();
