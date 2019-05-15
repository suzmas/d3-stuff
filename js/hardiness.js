
const width = 800;
const height = 600;

function scale(scaleFactor) {
  return d3.geoTransform({
      point(x, y) {
        this.stream.point(x * scaleFactor, y * scaleFactor);
      },
  });
}

function tempToZone(temp) {
  const tempZoneMap = {
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
    '-20': 'blue',
  }
  ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b']);
}

const path = d3.geoPath()
    .projection(scale(0.8));

const svg = d3.select('.map').append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g');

const color = d3.scaleLinear()
  .domain([-35, 0, 35])
  .range(['#4575b4', '#ffffbf', '#a50026'])
  .interpolate(d3.interpolateHcl);

const x = d3.scaleLinear()
  .domain([-40, 40])
  .range([0, 290]);

const xAxis = d3.axisBottom(x)
  .ticks(18)
  .tickFormat((d) => {
    console.log(d);
    return 'blue';
  });

const key = svg.append('g')
    .attr('class', 'key')
    .attr('transform', `translate(10,${height - 40})`);

function pair(array) {
  return array.slice(1).map((b, i) => [array[i], b]);
}

key.selectAll('rect')
    .data(pair(x.ticks(10)))
  .enter().append('rect')
    .attr('height', 8)
    .attr('x', d => x(d[0]))
    .attr('width', d => x(d[1]) - x(d[0]))
    .style('fill', d => color(d[0]));

key.call(xAxis).append('text')
    .attr('class', 'caption')
    .attr('y', -6)
    .text('Avg. annual extreme minimum temperature, °F');

d3.json('js/ophz.json')
  .then((ophz) => {
    const zones = topojson.feature(ophz, ophz.objects.b);
    console.log(path.bounds(zones));

    g.selectAll('path')
        .data(zones.features)
      .enter().append('path')
        .on('mouseover', d => console.log(d.properties.zone))
        .attr('class', d => `z${d.properties.zone}`)
        .attr('d', path)
        .style('fill', d => color(d.properties.t))
      .append('title')
        .text(d => d.properties.zone);
  });
