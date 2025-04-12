const KARNATAKA_CENTER = [15.3350, 76.4620];
const DEFAULT_ZOOM = 8;
const MAP_CONTAINER_ID = 'map';
const KARNATAKA_BOUNDARY_FILE = 'files/karnataka_boundary.geojson';
const ICON_VISIBLE_ZOOM_LEVEL = 7;

let map; // Declare map as a global variable
let featureLayers; // Declare featureLayers as a global variable

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
        temples: L.layerGroup(),
        beaches: L.layerGroup(),
        dams:L.layerGroup(),
        wild:L.layerGroup(),
        water:L.layerGroup(),
        history:L.layerGroup(),
        trek:L.layerGroup(),
        college:L.layerGroup(),
        hidden:L.layerGroup()

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
        "trek": layers.trek,
        "college": layers.college,
        "hiddengems": layers.hidden
    };

    L.control.layers(null, overlays).addTo(map);
}

function updateIconVisibility() {
  const currentZoom = map.getZoom();
  if (featureLayers) {
    for (const layerName in featureLayers) {
        const layer = featureLayers[layerName];
        const visible = currentZoom >= ICON_VISIBLE_ZOOM_LEVEL;
        if (visible && !map.hasLayer(layer)) {
            layer.addTo(map);
        } else if (!visible && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    }
  }
}

function loadKarnatakaBoundary(map) {
    return fetch(KARNATAKA_BOUNDARY_FILE) // Return the promise
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
    featureLayers = createFeatureLayers(map);
    setupLayerControl(map, featureLayers);

    // Load data and then enhance the map
    loadPointsOfInterestData().then(() => {
        enhanceMapWithPOIs(map, featureLayers);
    });

    loadKarnatakaBoundary(map); // No need to wait for this to enhance POIs

    // Set up initial icon visibility and add listener for zoom changes
    updateIconVisibility();
    map.on('zoomend', updateIconVisibility);
}

initializeMapApplication();