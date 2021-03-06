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

d3.json('assets/js/constellations.json', function(error, constellations) {
  if (error) throw error;

  const request = new XMLHttpRequest();
  request.open('GET', './assets/js/constellation-data.json');
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    const constellationData = request.response;
    constellationCoords = constellations.map((c) => {
      const lines = [];
      c.lines.forEach((line) => {
        const xy1 = projectedCoords(c.stars[line[0]]);
        const xy2 = projectedCoords(c.stars[line[1]]);
        lines.push(xy1, xy2);
      });
      const cData = constellationData.filter(cn => cn.name == c.Name)[0];

      return {lines: lines, name: cData.name, desc: cData.desc, abbr: c.stars[0].bfID.split(' ')[1]};
    });

    svg.append('g')
        .attr('class', 'constellations')
      .selectAll('path')
        .data(constellationCoords)
      .enter().append('path')
        .on('mouseover', function(d) { displayTooltip(d.name, d.desc, [`${d3.event.pageX}px`, `${d3.event.pageY}px`]) })
        .attr('class', function(d) { return 'constellation ' + d.abbr; })
        .attr('d', function(d) {
          return 'M' + d.lines.join('L');
        });
  }
});

d3.csv('assets/js/stars.csv', type, function(error, stars) {
  if (error) throw error;

  svg.insert('g', '.ticks')
      .attr('class', 'stars')
    .selectAll('circle')
      .data(stars)
    .enter().append('circle')
      .attr('id', function(d, i) { return 'star-' + i; })
      .attr('class', function(d) {
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

function mouseovered(d) {
  var dx = d[0] - width / 2,
      dy = d[1] - height / 2,
      a = Math.atan2(dy, dx);
  crossDeclination.attr('r', Math.sqrt(dx * dx + dy * dy));
  crossRightAscension.attr('x2', width / 2 + width * Math.cos(a)).attr('y2', height / 2 + height * Math.sin(a));

  if (d.constellation) {
    d3.selectAll('.' + d.constellation).classed('star--active', true);
  }
}

function mouseouted(d) {
  d3.selectAll('.star--active').classed('star--active', false);
}

function displayTooltip(name, desc, xy) {
  console.log(xy);
  const tooltip = document.getElementById('constellation-tooltip');
  tooltip.style.visibility = 'visible';
  tooltip.querySelector('.name').innerText = name;
  tooltip.querySelector('.desc').innerText = desc;
  tooltip.style.left = xy[0];
  tooltip.style.top = xy[1];
}

function moveTooltip() {
}

function type(d) {
  var p = projection([(+d.RA_hour + d.RA_min / 60 + d.RA_sec / 3600) * 15, +d.dec_deg + d.dec_min / 60 + d.dec_sec / 3600]);
  d[0] = p[0], d[1] = p[1];
  d.magnitude = +d.magnitude;
  return d;
}

function projectedCoords(d) {
  var p = projection([+d.RAh * 15, +d.DEd]);
  return p[0] + ',' + p[1];
}

function flippedStereographic(lambda, phi) {
  var coslambda = Math.cos(lambda),
      cosphi = Math.cos(phi),
      k = 1 / (1 + coslambda * cosphi);
  return [
    k * cosphi * Math.sin(lambda),
    -k * Math.sin(phi)
  ];
}
