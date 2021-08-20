// API url
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson'

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEveryFeature(feature, layer) {
    layer.bindPopup("<h3> Location: " + feature.properties.place +
      "</h3><hr><p>Date and Time: " + new Date(feature.properties.time) + "</p></hr><p>"+
      "Magnitude: " + feature.properties.mag + "</p>");
  }

  //need to make markers based on magnitude  and color by depth 
  function getColor(d) {
    let color = '';
    if (d < 1) {
      color = '#1a9850';
    } else if (d < 2) {
      color = '#91cf60';
    } else if (d < 3) {
      color = '#d9ef8b';
    } else if (d < 4) {
      color = '#fee08b';
    } else if (d < 5) {
      color = '#fc8d59';
    } else { // magnitude 5+
      color = '#d73027';
    }
    return color
}



  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEveryFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
          radius: feature.properties.mag*5,
          //opacity: .9,                            
          color: feature.properties.mag,
          fillColor: getColor(feature.geometry.coordinates[2]),
          //fillOpacity: 0.3,
      //  html: feature.properties.iconcategory[0].toUpperCase(),
      })
          .bindTooltip(feature.properties.name);}
    
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  // We create the dark view tile layer that will be an option for our map.
  let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      accessToken: API_KEY
    });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satelite Map": satelliteStreets
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.983810, 23.727539 
    ],
    zoom: 2,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
