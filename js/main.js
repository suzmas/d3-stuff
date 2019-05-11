var width = 960,
    height = 960,
    scale = width * 0.45;

var radius = d3.scale.linear()
    .domain([-1, 6])
    .range([8, 0]);

var projection = d3.geo.projection(flippedStereographic)
    .scale(scale)
    .clipAngle(130)
    .rotate([0, -90])
    .translate([width / 2, height / 2])
    .precision(0.1);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(0.5,0.5)');

svg.append('path')
    .datum(d3.geo.circle().origin([0, 90]).angle(90))
    .attr('class', 'horizon')
    .attr('d', path);

svg.append('path')
    .datum(d3.geo.graticule().minorStep([15, 10]))
    .attr('class', 'graticule')
    .attr('d', path);

var crossDeclination = svg.append('circle')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .attr('class', 'cross cross--declination');

var crossRightAscension = svg.append('line')
    .attr('x1', width / 2)
    .attr('y1', height / 2)
    .attr('x2', width / 2)
    .attr('y2', height / 2)
    .attr('class', 'cross cross--right-ascension');

var ticksRightAscension = svg.append('g')
    .attr('class', 'ticks ticks--right-ascension');

ticksRightAscension.selectAll('line')
    .data(d3.range(0, 1440, 5)) // every 5 minutes
  .enter().append('line')
    .each(function(d) {
      var p0 = projection([d / 4, 0]),
          p1 = projection([d / 4, d % 60 ? -1 : -2]);

      d3.select(this)
          .attr('x1', p0[0])
          .attr('y1', p0[1])
          .attr('x2', p1[0])
          .attr('y2', p1[1]);
    });

ticksRightAscension.selectAll('text')
    .data(d3.range(24)) // every hour
  .enter().append('text')
    .each(function(d) {
      var p = projection([d * 15, -4]);

      d3.select(this)
          .attr('x', p[0])
          .attr('y', p[1]);
    })
    .attr('dy', '.35em')
    .text(function(d) { return d + 'h'; });

svg.append('g')
    .attr('class', 'ticks ticks--declination')
  .selectAll('text')
    .data(d3.range(10, 91, 10))
  .enter().append('text')
    .each(function(d) {
      var p = projection([0, d]);

      d3.select(this)
          .attr('x', p[0])
          .attr('y', p[1]);
    })
    .attr('dy', '.35em')
    .text(function(d) { return d + '°'; });

d3.json('js/constellations.json', function(error, constellations) {
  if (error) throw error;

  constellationCoords = constellations.map((c) => {
    const lines = [];
    c.lines.forEach((line) => {
      const xy1 = projectedCoords(c.stars[line[0]]);
      const xy2 = projectedCoords(c.stars[line[1]]);
      lines.push(xy1, xy2);
    })
    return {lines: lines, name: c.Name, abbr: c.stars[0].bfID.split(' ')[1]};
  });
  console.log(constellationCoords);
  svg.append('g')
      .attr('class', 'constellations')
    .selectAll('path')
      .data(constellationCoords)
    .enter().append('path')
      .on('mouseover', function(d) { console.log(d.name); })
      .attr('class', function(d) { return 'constellation ' + d.abbr; })
      .attr('d', function(d) {
        return 'M' + d.lines.join('L');
      });
});

d3.csv('js/stars.csv', type, function(error, stars) {
  if (error) throw error;

  svg.insert('g', '.ticks')
      .attr('class', 'stars')
    .selectAll('circle')
      .data(stars)
    .enter().append('circle')
      .attr('id', function(d, i) { return 'star-' + i; })
      .attr('class', function(d) {
        console.log(d.constellation);
        return 'star ' + d.constellation;
      })
      .attr('r', function(d) {
        return radius(d.magnitude);
      })
      .attr('transform', function(d) { return 'translate(' + d[0] + ',' + d[1] + ')'; });

  svg.append('g')
      .attr('class', 'voronoi')
    .selectAll('path')
      .data(d3.geom.voronoi()(stars))
    .enter().append('path')
      .on('mouseover', mouseovered)
      .on('mouseout', mouseouted)
    .filter(function(d) { return d; })
      .attr('d', function(d) {
        return 'M' + d.join('L');
      })
      .datum(function(d) { return d.point; })
    .append('title')
      .text(function(d) { return 'HR' + d.ID + (d.greek_letter || d.constellation ? '\n' + d.constellation + ' ' + d.greek_letter : ''); });
});


// function mouseovered(d, i) {
//   var dx = d[0] - width / 2,
//       dy = d[1] - height / 2,
//       a = Math.atan2(dy, dx);
//   crossDeclination.attr('r', Math.sqrt(dx * dx + dy * dy));
//   crossRightAscension.attr('x2', width / 2 + width * Math.cos(a)).attr('y2', height / 2 + height * Math.sin(a));
//   console.log(d3.select('#star-' + i).node());
//   d3.select('#star-' + i).classed('star--active', true);
// }

function mouseovered(d, i) {
  var dx = d[0] - width / 2,
      dy = d[1] - height / 2,
      a = Math.atan2(dy, dx);
  crossDeclination.attr('r', Math.sqrt(dx * dx + dy * dy));
  crossRightAscension.attr('x2', width / 2 + width * Math.cos(a)).attr('y2', height / 2 + height * Math.sin(a));
  if (d.constellation) {
    d3.selectAll('.' + d.constellation).classed('star--active', true);
  }
}

function mouseouted(d, i) {
  d3.selectAll('.star--active').classed('star--active', false);

}

function type(d) {
  var p = projection([(+d.RA_hour + d.RA_min / 60 + d.RA_sec / 3600) * 15, +d.dec_deg]);
  d[0] = p[0], d[1] = p[1];
  d.magnitude = +d.magnitude;
  return d;
}

function projectedCoords(d) {
  var p = projection([+d.RAh * 15, +d.DEd]);
  return p[0] + ',' + p[1];
}

function flippedStereographic(lambda, phi)  {
  var coslambda = Math.cos(lambda),
      cosphi = Math.cos(phi),
      k = 1 / (1 + coslambda * cosphi);
  return [
    k * cosphi * Math.sin(lambda),
    -k * Math.sin(phi)
  ];
}