
let width = 1000;
let height = 800;
let centered;

let projection = d3.geoAlbersUsa()
  .scale(1070)
  .translate([width / 2, height / 2]);

let path = d3.geoPath()
  .projection(null);

let svg = d3.select('.map').append('svg')
  .attr('width', width)
  .attr('height', height);


svg.append('rect')
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height);

let g = svg.append('g');

// var width = 960,
//     height = 500;

var color = d3.scaleLinear()
    .domain([-35, 0, 35])
    .range(['#4575b4', '#ffffbf', '#a50026'])
    .interpolate(d3.interpolateHcl);

// var x = d3.scaleLinear()
//     .domain([-40, 40])
//     .range([0, 240]);

// var xAxis = d3.axisBottom(x)
//     .ticks(13)
//     // .tickFormat(d3.format('+.0f'));

// var canvas = d3.select('#hardiness-map').append('canvas')
//     .attr('width', width)
//     .attr('height', height);

// var context = canvas.node().getContext('2d');

// var path;

// var svg = d3.select('#hardiness-map').append('svg')
//     .attr('width', width)
//     .attr('height', height)
//     .attr('class', 'key')
//   .append('g')
//     // .attr('transform', 'translate(60,' + (height - 60) + ')');

// var g = svg.append('g')
//     .attr('id', 'zones')

// svg.selectAll('rect')
//     .data(pair(x.ticks(10)))
//   .enter().append('rect')
//     .attr('height', 8)
//     .attr('x', function(d) { return x(d[0]); })
//     .attr('width', function(d) { return x(d[1]) - x(d[0]); })
//     .style('fill', function(d) { return color(d[0]); });

// svg.call(xAxis).append('text')
//     .attr('class', 'caption')
//     .attr('y', -6)
//     .text('Avg. annual extreme minimum temperature, °F');

d3.json('js/ophz.json')
  .then(function(ophz) {

  const zones = topojson.feature(ophz, ophz.objects.b);
  
  g.selectAll('path')
      .data(zones.features)
      .enter().append('path')
      .attr('class', function(d) { return 'z' + d.properties.zone; })
      .attr('d', path)
      .style('fill', function(d) { return color(d.properties.t); });
  
});
