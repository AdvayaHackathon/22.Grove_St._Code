let poiData = [];
let markers = [];
let poiDataKn = [];
let poiDataEn = [];
let currentLang = "en";
let currentPlace = null;

function loadPointsOfInterestData() {
    return Promise.all([
        fetch('files/poiDataEn.json')
            .then(response => response.json())
            .then(data => {
                poiDataEn = data;
                console.log("English POI data loaded successfully");
                return data;
            })
            .catch(error => {
                console.error("Failed to load English POI data:", error);
                return []; 
            }),
        fetch('files/poiDataKn.json')
            .then(response => response.json())
            .then(data => {
                poiDataKn = data;
                console.log("Kannada POI data loaded successfully");
                return data;
            })
            .catch(error => {
                console.error("Failed to load Kannada POI data:", error);
                return []; 
            })
    ]).then(([englishData, kannadaData]) => {
        poiData = englishData;
        console.log("Both English and Kannada POI data loaded.");
        return { en: englishData, kn: kannadaData }; 
    });
}

loadPointsOfInterestData();

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
    console.log(lat,lon);

    
    const markerExists = markers.some(marker => {
        const markerLat = parseFloat(marker.getLatLng().lat.toFixed(5));
        const markerLon = parseFloat(marker.getLatLng().lng.toFixed(5));
        return markerLat === lat && markerLon === lon;
    });

    
    map.setView([place.lat, place.lon], 10);
    searchInput.value = '';
    document.getElementById('suggestions').innerHTML='';

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
        document.getElementById('suggestions').innerHTML='';
    });

    
    searchInput.addEventListener("keydown", function(event) {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            executeSearch(query);
        }
    });
}

/**
 * Open side pane with details about a location
 */
function openSidePane(name, contentHTML) {
    const mapElement = document.getElementById(MAP_CONTAINER_ID);

    
    if (mapElement.className != "smallMap") {
        mapElement.className = "smallMap";
    }

    
    const sidePane = document.getElementById("detailsPane");
    sidePane.style.visibility = "visible";
    sidePane.innerHTML = "";

    
    const titleDiv = document.createElement("div");
    titleDiv.id = "titleDiv";

    const title = document.createElement('h2');

    
    const languageSelect = document.createElement("select");
    languageSelect.id = "languageSelect";

    const englishOption = document.createElement("option");
    englishOption.value = "en";
    englishOption.innerText = "English";
    languageSelect.appendChild(englishOption);

    const kannadaOption = document.createElement("option");
    kannadaOption.value = "kn";
    kannadaOption.innerText = "Kannada";
    languageSelect.appendChild(kannadaOption);

    
    languageSelect.addEventListener("change", handleLanguageChange);

    
    const closeButton = document.createElement("img");
    closeButton.src = "files/close.png";
    closeButton.width = 24;
    closeButton.height = 24;
    closeButton.addEventListener("click", closeSidePane);

    
    const detailsContent = document.createElement("div");
    detailsContent.id = "sidePaneContent";
    detailsContent.innerHTML = contentHTML; 

    
    for (let i = 0; i < poiData.length; i++) {
        if (name === poiData[i].name) {
            title.innerText = poiData[i].name;
            break;
        }
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
    map.setView([15.3350, 76.4620],7 );
}

function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    console.log("Selected language:", selectedLanguage);
    console.log("Current poiData:", poiData);

    // Update the global poiData based on the selected language
    if (selectedLanguage === 'en') {
        poiData = poiDataEn;
        currentLang = "en";
    } else if (selectedLanguage === 'kn') {
        poiData = poiDataKn;
        currentLang = "kn";
    }
    console.log("Updated poiData:", poiData);
    console.log("Current Place (before finding new data):", currentPlace);

    let newDataForPlace;
    if (currentPlace) {
        newDataForPlace = poiData.find(poi => poi.name === currentPlace);
        console.log("New data found for place:", newDataForPlace);
        if (newDataForPlace) {
            const detailsHTML = createDetailsHTML(newDataForPlace, 0);
            openSidePane(currentPlace, detailsHTML);
        } else {
            console.warn(`Could not find data for "${currentPlace}" in the selected language.`);
            // Optionally, you could display a message to the user
        }
    }
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
    map.setView([15.3350, 76.4620],7 );
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
    map.setView([15.3350, 76.4620],7 );
}

function initializeUI() {
    initializeSearch();

    closeSidePane();

    updateItineraryDisplay();
    
    
}

function initializeApplication() {
    loadPointsOfInterestData()
        .then(() => {
            initializeUI();
        });
}

document.addEventListener("DOMContentLoaded", initializeApplication);