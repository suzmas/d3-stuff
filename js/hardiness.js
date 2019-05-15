
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
  const adjTemp = temp + 60;
  let zone = Math.round(adjTemp / 10);
  if (zone < 1) { zone = 1; }
  return zone;
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
  .range([0, 240]);

const xAxis = d3.axisBottom(x)
  .ticks(10)
  .tickFormat(d => tempToZone(d));

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
        .on('mouseover', (d) => {
          const tooltip = document.getElementById('hardiness-tooltip');
          tooltip.style.visibility = 'visible';
          tooltip.querySelector('.title').innerText = `Zone ${d.properties.zone}`;
          tooltip.style.left = `${d3.event.pageX}px`;
          tooltip.style.top = `${d3.event.pageY}px`;
        })
        .attr('class', d => `z${d.properties.zone}`)
        .attr('d', path)
        .style('fill', d => color(d.properties.t))
        .style('color', d => tempToZone(d.properties.t))
      .append('title')
        .text(d => d.properties.zone);
  });
