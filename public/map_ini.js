const KARNATAKA_CENTER = [15.3350, 76.4620];
const DEFAULT_ZOOM = 8;
const MAP_CONTAINER_ID = 'map';
const KARNATAKA_BOUNDARY_FILE = 'files/karnataka_boundary.geojson';
const ICON_VISIBLE_ZOOM_LEVEL = 7;

let map; // Declare map as a global variable

function initializeMap() {
    map = L.map(MAP_CONTAINER_ID).setView(KARNATAKA_CENTER, DEFAULT_ZOOM);
    return map;
}


function addBaseMapLayer(map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}


function createFeatureLayers(map) {
    const layers = {
        temples: L.layerGroup().addTo(map),
        beaches: L.layerGroup().addTo(map),
        dams:L.layerGroup().addTo(map),
        wild:L.layerGroup().addTo(map),
        water:L.layerGroup().addTo(map),
        history:L.layerGroup().addTo(map),
        trek:L.layerGroup().addTo(map),
        college:L.layerGroup().addTo(map)
        
    };

    return layers;
}


function setupLayerControl(map, layers) {
    const overlays = {
        "temples": layers.temples,
        "beaches": layers.beaches,
        "dams": layers.dams,
        "wild": layers.wild,
        "waterFalls":layers.water,
        "history":layers.history,
        "trek":layers.trek,
        "college":layers.college
    };

    L.control.layers(null, overlays).addTo(map);
}

function updateIconVisibility() {
  const currentZoom = map.getZoom();
  while(1){
    if (featureLayers) {
      for (const layerName in featureLayers) {
          const layer = featureLayers[layerName];
          if (currentZoom >= ICON_VISIBLE_ZOOM_LEVEL && !map.hasLayer(layer)) {
              layer.addTo(map);
          } else if (currentZoom < ICON_VISIBLE_ZOOM_LEVEL && map.hasLayer(layer)) {
              map.removeLayer(layer);
          }
      }
  }
  }
}

function loadKarnatakaBoundary(map) {
    fetch(KARNATAKA_BOUNDARY_FILE)
        .then(response => response.json())
        .then(data => {
            const karnatakaLayer = L.geoJSON(data, {
                style: {
                    color: "blue",
                    weight: 2,
                    fillOpacity: 0.1
                }
            }).addTo(map);
            map.fitBounds(karnatakaLayer.getBounds());
        });
}


function initializeMapApplication() {
    const map = initializeMap();

    addBaseMapLayer(map);

    const featureLayers = createFeatureLayers(map);

    setupLayerControl(map, featureLayers);

    loadKarnatakaBoundary(map);

    enhanceMapWithPOIs(map, featureLayers);
}

initializeMapApplication();