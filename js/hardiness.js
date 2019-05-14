var width = 960,
    height = 500;

var color = d3.scaleLinear()
    .domain([-35, 0, 35])
    .range(['#4575b4', '#ffffbf', '#a50026'])
    .interpolate(d3.interpolateHcl);

var x = d3.scaleLinear()
    .domain([-40, 40])
    .range([0, 240]);

var xAxis = d3.axisBottom(x)
    .ticks(13)
    // .tickFormat(d3.format('+.0f'));

var canvas = d3.select('#hardiness-map').append('canvas')
    .attr('width', width)
    .attr('height', height);

var context = canvas.node().getContext('2d');

var path;

var svg = d3.select('#hardiness-map').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'key')
  .append('g')
    // .attr('transform', 'translate(60,' + (height - 60) + ')');

var g = svg.append('g')
    .attr('id', 'zones')

svg.selectAll('rect')
    .data(pair(x.ticks(10)))
  .enter().append('rect')
    .attr('height', 8)
    .attr('x', function(d) { return x(d[0]); })
    .attr('width', function(d) { return x(d[1]) - x(d[0]); })
    .style('fill', function(d) { return color(d[0]); });

svg.call(xAxis).append('text')
    .attr('class', 'caption')
    .attr('y', -6)
    .text('Avg. annual extreme minimum temperature, °F');

d3.json('js/ophz.json', function(error, ophz) {
  if (error) throw error;

  // topojson.feature(ophz, ophz.objects.b)
  //     .features
  //     .sort(function(a, b) { return a.t - b.t; })
  //     .forEach(render);

  const zones = topojson.feature(ophz, ophz.objects.b);
  path = d3.geoPath()
    .projection(d3.geoAlbersUsa().fitSize([width, height], zones));
  
  g.selectAll('path')
      .data(zones.features)
      .enter().append('path')
      .attr('id', function(d) {
        return 1;
      })
      .attr('d', path)
      .style('fill', 'blue');
  
});

function pair(array) {
  return array.slice(1).map(function(b, i) {
    return [array[i], b];
  });
}

function render(d) {
  var t = d.properties.t;
  if (t <= -98) return;
  context.fillStyle = color(t);
  context.beginPath();
  path(d);
  context.fill();
}
