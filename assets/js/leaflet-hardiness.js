/* eslint-disable new-cap */
/* global L */

function showPlants(plants) {
  const plantEls = plants.map(p => `
      <div class="plant">
        <a href="${p.url}" target="_blank" class="img-ctr"><img src="https://s3.amazonaws.com/ophz-plant-ims/images/${p.img_nm}" /></a>
        <div class="details">
          <h3 class="title"><a href="${p.url}" target="_blank">${p.name}</a></h3>
          <p class="detail"><span class="label">Family</span> ${p.family}</p>
          <p class="detail"><span class="label">Sun</span> ${p.sun}</p>
          <p class="detail"><span class="label">Water</span> ${p.water}</p>
          <p class="detail"><span class="label">Maintenance</span> ${p.maintenance}</p>
          <a class="button" href="${p.url}" target="_blank">Details ></a>
        </div>
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

function updateZoneLabel(zone) {
  document.getElementById('zone-title').innerText = `Zone ${zone} Plants`;
}

const map = L.map('hardiness-map').setView([37.8, -96], 4);
const info = L.control({ position: 'topright' });
let geojson;

L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    minZoom: 4,
    maxZoom: 6,
}).addTo(map);

info.onAdd = function infoAdd(m) {
    const div = L.DomUtil.create('div', 'info');
    div.innerHTML = '<h4>USDA Plant Hardiness Zones</h4>';
    return div;
};
info.addTo(map);


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

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function transitionRGB(val, max, start, end) {
  const interpolationRatio = val / max;
  const r = lerp(start[0], end[0], interpolationRatio);
  const g = lerp(start[1], end[1], interpolationRatio);
  const b = lerp(start[2], end[2], interpolationRatio);
  return [r, g, b];
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
  const col = getColor(feature.properties.DN);
  return {
    fillColor: col,
    fillOpacity: 0.6,
    weight: 1,
    color: col,
    opacity: 0.7,
  };
}

function tempToZone(temp) {
  const zoneScale = scale([-45, 45], [2, 11]);
  const adjTemp = zoneScale(temp);
  const zone = Math.ceil(adjTemp);
  return zone;
}

function zoneMouseover(e) {
  const layer = e.target;
  layer.setStyle({
    fillOpacity: 0.8,
  });
}

function zoneMouseout(e) {
  geojson.resetStyle(e.target);
}

function zoneClicked(e) {
  const layer = e.target;
  console.log(layer.feature);
  updateZoneLabel(layer.feature.properties.zone);
  getPlants(layer.feature.properties.zone);
}

function onEachZone(feature, layer) {
  const temp = layer.feature.properties.DN;
  layer.feature.properties.zone = tempToZone(temp);
  layer.feature.properties.subZone = Math.abs(temp) % 10 < 5 ? 'a' : 'b';
  layer.on({
    mouseover: zoneMouseover,
    mouseout: zoneMouseout,
    click: zoneClicked,
  });
  layer.bindTooltip((l) => {
    const zoneStr = `${l.feature.properties.zone}${l.feature.properties.subZone}`;
    return `<div>Zone ${zoneStr}</div>`;
  }, {
    direction: 'center',
    offset: [30, 15],
    sticky: true,
  });
}

function addGeojson() {
  fetch('assets/js/llophz.json')
    .then((response) => {
      response.json().then((ophzGeo) => {
        geojson = L.geoJSON(ophzGeo, {
          style: ophzStyle,
          onEachFeature: onEachZone,
        });
        geojson.addTo(map);
      });
    })
    .catch((err) => { console.log(err); });
}

addGeojson();
