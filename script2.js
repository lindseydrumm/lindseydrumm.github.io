/*
 * script for map
 *
 * Lindsey Drumm, March 2024
 */

document.addEventListener('DOMContentLoaded', function () {
  var map = L.map('map').setView([43.7044, -72.2887], 18);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.5
  }).addTo(map);

  var diningBuildingsLayer = L.layerGroup().addTo(map);
  var residentialBuildingsLayer = L.layerGroup().addTo(map);
  var librariesLayer = L.layerGroup().addTo(map);
  var classroomsLayer = L.layerGroup().addTo(map);
  var studentLifeLayer = L.layerGroup().addTo(map);
  var allLayers = L.layerGroup([diningBuildingsLayer, residentialBuildingsLayer, librariesLayer, classroomsLayer, studentLifeLayer]).addTo(map);

  var colors = {
      'dining': '#6A8AEE',
      'residential': '#FFAC7B',
      'libraries': '#EE6AB4',
      'academic': '#98614D',
      'student life': '#47C963'
    };

  // Load GeoJSON data using fetch
 fetch('data.geojson')
 .then(response => response.json())
 .then(geoJsonData => {
  // console.log('Loaded GeoJSON data:', geoJsonData);

  geoJsonData.features.forEach(function (feature) {
    var layer;
    var category = feature.properties.category;
    var type = feature.geometry.type;

    var panelContent = {
      id: feature.properties.name,                     
      tab:'Info',  
      title: feature.properties.name,              
      position: 'bottom'                 
    };

    if (category === 'dining') {
      layer = diningBuildingsLayer;
    } else if (category === 'residential') {
      layer = residentialBuildingsLayer;
    } else if (category === 'libraries') {
      layer = librariesLayer;
    } else if (category === 'academic') {
      layer = classroomsLayer;
    } else if (category === 'student life') {
      layer = studentLifeLayer;
    }

    if (layer && type == 'Polygon') {

      var defaultStyle = {
          fillColor: colors[category],
          color: colors[category], // Border color
          weight: 1,
          opacity: 0.2,
          fillOpacity: 0.9
        };

      // Add the GeoJSON feature to the respective layer
      L.geoJSON(feature, {
          style: function (feature) {
              return defaultStyle;
            },
        onEachFeature: function (feature, layer) {
          // Highlight feature on mouseover
          layer.on({
            mouseover: function (e) {
              var layer = e.target;
              layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.85
              });
              layer.openPopup();
            },
            mouseout: function (e) {
              // Restore the initial style on mouseout
              var layer = e.target;
              layer.setStyle(defaultStyle);
              layer.closePopup();
              }
          });

          // Bind popup with the name property
          layer.bindPopup(feature.properties.name); // Customize the popup content if needed
        }
      }).addTo(layer);
    } else if (type === 'Point') {

      var defaultStyle = {
          radius: 10,
          fillColor: colors[category],
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
      }

      L.geoJSON(feature, {
          style: function (feature) {
              return defaultStyle;
            },
          pointToLayer: function (feature, latlng) {
              // Customize the style for each point
              var marker = L.circleMarker(latlng, {
                  radius: 8,
                  fillColor: colors[category],
                  color: 'white',
                  weight: 2,
                  opacity: 0.9,
                  fillOpacity: 0.8
              });

              // Add click event to show sidebar
              marker.on('click', function () {
                sidebar.addPanel(panelContent);
                sidebar.open();
              });

              // Add mouseover event
              marker.on({
                  mouseover: function (e) {
                      var marker = e.target;
                      marker.setStyle({
                          radius: 10,
                          fillColor: colors[category],
                          fillOpacity: 1.5
                      });
                      marker.openPopup();
                      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                          marker.bringToFront();
                        }
                  },
                  mouseout: function (e) {
                      var layer = e.target;
                      layer.setStyle(defaultStyle);
                      marker.closePopup();
                  }
              });
              marker.bindPopup(feature.properties.name);
              return marker;
          }
      }).addTo(layer).bringToFront();
    }
  });


  // Add the GeoJSON layer to the map
  var overlayMaps = {
      "Dining Buildings": diningBuildingsLayer,
      "Residential Buildings": residentialBuildingsLayer,
      "Libraries": librariesLayer,
      "Classrooms": classroomsLayer,
      "Student Life": studentLifeLayer
  };
  L.control.layers(null, overlayMaps).addTo(map);
  // Add a message next to the layer control
  var message = L.control({ position: 'topright' });

  message.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<h>Select a Layer:</h>';
    return div;
  };

  // Style the message
  var style = document.createElement('style');
  style.innerHTML = `    
    .message {
    margin-top: 24px; /* Adjust margin as needed */
    background-color: #fff;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background-color 0.3s ease;
    }

    .message:hover {
      background-color: #f9f9f9;
    }
  `; // Adjust margin as needed
  document.head.appendChild(style);
  message.addTo(map);

  // add search bar
  var searchControl = new L.Control.Search({
    layer: allLayers,
    propertyName: 'name', // Property in the GeoJSON features to be searched
    marker: false,
    moveToLocation: function (latlng, title, map) {
        // Set the map view when a result is selected
        map.setView(latlng, 18);

        // Find the clicked feature based on the title
        var clickedFeature = allLayers.getLayers().find(function (layer) {
          return layer.feature.properties.name === title;
        });

        if (clickedFeature) {
          clickedFeature.setStyle({
              color: 'red',  // Highlighted color
              weight: 4       // Highlighted weight
          });

          // Open a popup for the clicked feature
          clickedFeature.openPopup();
        }
    }
  });

map.addControl(searchControl);


  })
  .catch(error => console.error('Error loading CSV:', error));

});
