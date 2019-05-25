
// Plant Details

function showPlants(d) {
  const request = new XMLHttpRequest();
  request.open('GET', `./data/plantsd-zone${d.properties.zone}.json`);
  request.responseType = 'json';
  request.send();
  request.onload = () => {
    const plants = request.response;
    const plantEls = plants.map(p => `
        <div class="plant">
            <img src="assets/images/${p.img_nm}" />
            <div class="details">
            <span class="title"><a href="${p.url}" target="_blank">${p.name}</a></span>
            <span class="family">${p.family}</span>
            <span class="sun">${p.sun}</span>
            <span class="water">${p.water}</span>
            <span class="maintenance">${p.maintenance}</span>
          </div>
        </div>`);
    document.querySelector('.grid').innerHTML = plantEls.join('');
  };
}


// D3

const width = document.getElementById('hardiness-map').clientWidth;
const height = width * (2 / 3);
const scaled = width / 775;


function scale(scaleFactor) {
  return d3.geoTransform({
      point(x, y) {
        this.stream.point(x * scaleFactor, y * scaleFactor);
      },
  });
}


function tempToZone(temp) {
  const adjTemp = temp + 60;
  let zone = Math.round(adjTemp / 10);
  if (zone < 1) { zone = 1; }
  return zone;
}

const path = d3.geoPath()
    .projection(scale(scaled));

const svg = d3.select('.map').append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .classed('svg-content', true);

const g = svg.append('g')
  .attr('id', 'zones');

const color = d3.scaleLinear()
  .domain([-35, 0, 35])
  .range(['#4575b4', '#ffffbf', '#a50026'])
  .interpolate(d3.interpolateHcl);

const x = d3.scaleLinear()
  .domain([-40, 40])
  .range([0, 240]);

const xAxis = d3.axisBottom(x)
  .ticks(10)
  .tickFormat(d => tempToZone(d));

const key = svg.append('g')
    .attr('class', 'key')
    .attr('transform', `translate(10,${height - 40})`);

const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

function pair(array) {
  return array.slice(1).map((b, i) => [array[i], b]);
}

function zoneHovered(d) {
  tooltip.html(`Zone ${d.properties.zone}`);
  tooltip.transition()
    .duration(200)
    .style('left', `${d3.event.pageX + 5}px`)
    .style('top', `${d3.event.pageY + 5}px`)
    .style('opacity', 1);
}

function zoneClicked(d) {
  showPlants(d);
  g.selectAll('.zone.active')
    .classed('active', false);
  this.classList.add('active');
}

key.selectAll('rect')
    .data(pair(x.ticks(10)))
  .enter().append('rect')
    .attr('height', 8)
    .attr('x', d => x(d[0]))
    .attr('width', d => x(d[1]) - x(d[0]))
    .style('fill', d => color(d[0]));

key.selectAll('text')
    .data(pair(x.ticks(10)))
  .enter().append('text')
    .attr('x', d => x(d[0]) + ((x(d[1]) - x(d[0])) * 0.5))
    .attr('width', d => x(d[1]) - x(d[0]))
    .style('transform', 'translate(50%, 0)')
    .text((d) => {
      console.log(d);
      return 'blue';
    });

key.call(xAxis).append('text')
    .attr('class', 'caption')
    .attr('y', -6)
    .text('Avg. annual extreme minimum temperature, °F');

d3.json('assets/js/ophz.json')
  .then((ophz) => {
    const zones = topojson.feature(ophz, ophz.objects.b);

    g.selectAll('path')
        .data(zones.features)
      .enter().append('path')
        .on('mouseover', zoneHovered)
        .on('mouseout', () => {
          tooltip.transition()
            .duration(600)
            .style('opacity', 0);
        })
        .on('click', zoneClicked)
        .attr('class', d => `z${d.properties.zone} zone`)
        .attr('d', (d) => {
          // console.log(d);
          const thepath = path(d);
          // console.log(`path:\n${thepath}`);
          return thepath;
        })
        .style('fill', d => color(d.properties.t))
        .style('color', d => tempToZone(d.properties.t))
      .append('title')
        .text(d => d.properties.zone);
  });
