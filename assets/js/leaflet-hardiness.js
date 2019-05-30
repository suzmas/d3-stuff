
const mymap = L.map('hardiness-map').setView([37.8, -96], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3V6bWFzIiwiYSI6ImNqdzlzbHY4ZjAybmEzeW10Z3dzcDY2cW4ifQ.VD3bq_R_nYPL8snODbm1cw',
}).addTo(mymap);
