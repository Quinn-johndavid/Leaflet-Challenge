// Define the map creation function 
function createMap(eqs, plates) {

    // Base map layer
    var base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Topographic map layer
    var topographic = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Watercolor map layer
    var watercolor = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>)'
    })

    // Satalite map layer
    var satalite = L.tileLayer('https://core-sat.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}&scale=1&lang=ru_RU', {
        attribution: '<a href="https://yandex.ru" target="_blank">Yandex</a>'
      });

    // Map layers
    var baseMaps = {
        "<span style='color: blue'>Street Map</span>": base,
        "<span style='color: blue'>Topographical Map</span>": topographic,
        "<span style='color: blue'>Watercolor Map</span>": watercolor,
        "<span style='color: blue'>Satalite Map</span>": satalite
    };    

    // Overlays 
    var overlayMaps = {
        "<span style='color: blue'>Tectonic Plates</span>": plates,
        "<span style='color: red'>All Earthquakes</span>": eqs
    };

    // Map object
    var theMap = L.map("map", {
        center: [0, 12],
        zoom: 3,
        layers: [base, eqs]
    });

    // Add layer control panel to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(theMap);



    // Create legend object
    var legend = L.control({position: 'bottomright'});

    // Create labels for the legend
    legend.onAdd = function(){

        // Create the legend div
        var div = L.DomUtil.create('div', 'info legend'),
            levels = [0, 10, 30, 50, 100, 200, 500],
            labels = [];

        // create legend title
        div.innerHTML += '<center><h2>Earthquake<br>Depth</h2><hr></center>'
        
        // Adds a new colored entry to the legend for each item
        for (var i = 0; i < levels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
                levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + ' km<br>' : ' km +');
        };
        return div;
    };

    // add legend
    legend.addTo(theMap);

};

// Define function to assign colors based on earthquake depth
function getColor(depth){
    
    // Deeper depths have darker colors
    if (depth > 500){
        return '#b10026'
    } else if (depth > 200){
        return '#e31a1c';
    } else if (depth > 100){
        return '#fc4e2a'
    } else if(depth > 50) {
        return '#fd8d3c'
    } else if (depth > 30) {
        return '#feb24c'
    } else if (depth > 10) {
        return '#fed976'
    } else {
        return '#ffffb2'
    };
};

// function to create markers
function createMarkers(response1, response2) {

    // function to draw circle markers
    function ptToLayer(feature, latlng) {
        return L.circleMarker(latlng, {
            color: 'green',
            weight: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.6,
            radius: feature.properties.mag ** 1.5,
        });
    };

    // function to allow mousehovers
    function onEach(feature, layer) {
        layer.bindPopup(`<h2>${feature.properties.place}</h2><h3>
            Magnitude: ${feature.properties.mag} - 
            Depth: ${feature.geometry.coordinates[2]}km</h3><hr>
            <p>${new Date(feature.properties.time)}</p>`);

        // mousehover action
        layer.on('mouseover', function(d){
            this.openPopup();
        });
        layer.on('mouseout', function(e){
            this.closePopup();
        });
    };

    // Create geoJSON layer with earthquake data
    var gJsonLayer = L.geoJSON(response1.features, {
        onEachFeature: onEach,
        pointToLayer: ptToLayer
    });

    // Create layer for tectonic plates in blie
    var tectonicLayer = L.geoJSON(response2.features, {
        style: {
            color: 'blue',
            weight: 2
        }
    });


    // instantiate the map with the created layers
    createMap(gJsonLayer, tectonicLayer);
};


// URL to get Earthquake data from USGS.gov site
var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson';

// URL to get tectonic plate data from Hugo Ahlenius, Nordpil and Peter Bird GitHub page
var plateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// DataPromise with 
Promise.all([d3.json(earthquakeUrl), d3.json(plateUrl)]).then(function([data1, data2]){
    createMarkers(data1, data2);
});