let poiDataEn = [];
let poiDataKn = [];
let poiData = []; 
let markers = [];
let lang = 'en'; 

/**
 * Load points of interest data from JSON files
 */
function loadPointsOfInterestData() {
    const fetchEnData = fetch('files/poiDataEn.json')
        .then(response => response.json())
        .then(data => {
            poiDataEn = data;
            console.log("English POI data loaded successfully");
        });

    const fetchKnData = fetch('files/poiDataKn.json')
        .then(response => response.json())
        .then(data => {
            poiDataKn = data;
            console.log("Kannada POI data loaded successfully");
        });

    return Promise.all([fetchEnData, fetchKnData])
        .then(() => {
            
            poiData = lang === 'kn' ? poiDataKn : poiDataEn;
            return poiData;
        })
        .catch(error => {
            console.error("Failed to load POI data:", error);
        });
}

function updatePoiData() {
    poiData = lang === 'kn' ? poiDataKn : poiDataEn;
    displaySearchSuggestions(document.getElementById("searchInput")); 
    
    markers.forEach(marker => {
        
        
    });
    const sidePane = document.getElementById("detailsPane");
    if (sidePane.style.visibility === "visible" && sidePane.dataset.placeName) {
        openSidePane(sidePane.dataset.placeName); 
    }
}


function displaySearchSuggestions(searchInput) {
    const query = searchInput.value.trim().toLowerCase();
    const suggestionsContainer = document.getElementById("suggestions");

    suggestionsContainer.innerHTML = '';

    const matches = query.length === 0
        ? poiData
        : poiData.filter(place =>
            place.name.toLowerCase().includes(query)
        );

    matches.forEach(place => {
        const suggestionItem = document.createElement("p");
        suggestionItem.className = "suggestionListItems";
        suggestionItem.innerText = place.name;

        suggestionItem.addEventListener("click", () => {
            executeSearch(place.name);
        });

        suggestionsContainer.appendChild(suggestionItem);
    });
}

/**
 * Execute search query and focus map on the result
 */
function executeSearch(query) {
    if (query.length === 0) return;
    console.log("Searching for:", query);

    const matches = poiData.filter(place =>
        place.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length === 0) {
        console.log("No matches found for:", query);
        return;
    }

    const place = matches[0];

    let lat = parseFloat(place.lat.toFixed(4));
    let lon = parseFloat(place.lon.toFixed(4));
    console.log(lat, lon);

    const markerExists = markers.some(marker => {
        const markerLat = parseFloat(marker.getLatLng().lat.toFixed(5));
        const markerLon = parseFloat(marker.getLatLng().lng().toFixed(5));
        return markerLat === lat && markerLon === lon;
    });

    map.setView([place.lat, place.lon], 10);
    searchInput.value = '';
    document.getElementById('suggestions').innerHTML = '';

}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("focus", () => {
        displaySearchSuggestions(searchInput);
    });

    searchInput.addEventListener("input", () => {
        displaySearchSuggestions(searchInput);
    });

    searchInput.addEventListener("blur", () => {
        searchInput.value = '';
        document.getElementById('suggestions').innerHTML = '';
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            executeSearch(query);
        }
    });
}

/**
 * Open side pane with details about a location
 */
function openSidePane(name) {
    const mapElement = document.getElementById(MAP_CONTAINER_ID);

    if (mapElement.className != "smallMap") {
        mapElement.className = "smallMap";
    }

    const sidePane = document.getElementById("detailsPane");
    sidePane.style.visibility = "visible";
    sidePane.innerHTML = "";
    sidePane.dataset.placeName = name; 

    const titleDiv = document.createElement("div");
    titleDiv.id = "titleDiv";

    const title = document.createElement('h2');

    const languageSelect = document.createElement("select");
    languageSelect.id = "languageSelect";

    const enOption = document.createElement("option");
    enOption.value = "en";
    enOption.innerText = "English";
    languageSelect.appendChild(enOption);

    const knOption = document.createElement("option");
    knOption.value = "kn";
    knOption.innerText = "ಕನ್ನಡ";
    languageSelect.appendChild(knOption);

    if (typeof lang !== 'undefined') {
        languageSelect.value = lang;
    }

    languageSelect.addEventListener("change", function () {
        lang = this.value;
        console.log("Selected language:", lang);
        updatePoiData(); 
    });

    const closeButton = document.createElement("img");
    closeButton.src = "files/close.png";
    closeButton.width = 24;
    closeButton.height = 24;
    closeButton.addEventListener("click", closeSidePane);

    const detailsContent = document.createElement("div");
    detailsContent.id = "sidePaneContent";
    detailsContent.innerHTML = ""; 

    let placeDetails = null;
    for (let i = 0; i < poiData.length; i++) {
        if (name === poiData[i].name) {
            title.innerText = poiData[i].name;
            placeDetails = poiData[i];
            break;
        }
    }

    if (placeDetails) {
        detailsContent.innerHTML = lang === 'kn' && placeDetails.details_kn ? placeDetails.details_kn : placeDetails.details_en;
    }

    titleDiv.appendChild(title);
    titleDiv.appendChild(languageSelect);
    titleDiv.appendChild(closeButton);
    sidePane.appendChild(titleDiv);
    sidePane.appendChild(detailsContent);

    setupDetailsPaneListeners();
}

/**
 * Close the side pane and restore map to full width
 */
function closeSidePane() {
    const mapElement = document.getElementById(MAP_CONTAINER_ID);
    mapElement.className = "wideMap";

    const sidePane = document.getElementById("detailsPane");
    sidePane.style.visibility = "hidden";
    sidePane.innerHTML = "";
    delete sidePane.dataset.placeName; 
    map.setView([15.3350, 76.4620], 7);
}

function initializeUI() {
    initializeSearch();
    closeSidePane();
    updateItineraryDisplay();
    document.getElementById("languageSelect").value = lang; 
    
}

function initializeApplication() {
    loadPointsOfInterestData()
        .then(() => {
            initializeUI();
        });
}

document.addEventListener("DOMContentLoaded", initializeApplication);