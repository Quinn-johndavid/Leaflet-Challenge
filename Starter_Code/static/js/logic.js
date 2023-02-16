var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createMaps(data.features);

});

// Function to determine marker size 
function markerSize(magnitude) {
    return magnitude * 20000;
}

// Functipon to determine marker color
function chooseColor(depth) {
    if (depth < 10) return "blue";
    else if (depth < 30) return "green";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "pink";
    else return "red";
}

function createMaps(earthquake) {
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: street
    });

    earthquake.forEach(function(quake) {
      var coords = quake.geometry.coordinates;
      var place = quake.properties.place;
      var mag = quake.properties.mag;
  
      L.circle([coords[1], coords[0]], {
          fillOpacity: 0.75,
          color: "black",
          weight: .5,
          fillColor: chooseColor(coords[2]),
          radius: markerSize(mag)
      }).bindPopup(`<h1>${place}</h1> <hr> <h3>Magnitude: ${mag} &emsp; Depth: ${coords[2]}</h3>`).addTo(myMap);
  });
    // ------- Legend specific -------------------------------------------
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");

        div.innerHTML += '<i style="background: blue"></i><span>-10-10</span><br>';
        div.innerHTML += '<i style="background: green"></i><span>10-30</span><br>';
        div.innerHTML += '<i style="background: yellow"></i><span>30-50</span><br>';
        div.innerHTML += '<i style="background: orange"></i><span>50-70</span><br>';
        div.innerHTML += '<i style="background: pink"></i><span>70-90</span><br>';
        div.innerHTML += '<i style="background: red"></i><span>90+</span><br>';

        return div;
    };

    legend.addTo(myMap);
    // ----------- Legend -------------------------------------------------------
}