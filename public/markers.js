
let itinerary = [];

/**
 * Create custom icons for different map features
 */
function createMapIcons() {
    const icons = {
        temple: L.icon({
            iconUrl: 'icons/hindu-temple.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        beach: L.icon({
            iconUrl: 'icons/beach.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        dams: L.icon({
            iconUrl: 'icons/dam.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        wild: L.icon({
            iconUrl: 'icons/tiger-face.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        water: L.icon({
            iconUrl: 'icons/waterfall-development.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        college: L.icon({
            iconUrl: 'icons/swamaji.png',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),
        history:L.icon({
            iconUrl:"icons/hourglass.svg",
            iconSize:[35,35],
            iconAnchor:[17,35],
            popupAnchor:[0,-35],
            shadowUrl:null
        }),
        trek: L.icon({
            iconUrl:"icons/mountain.svg",
            iconSize:[35,35],
            iconAnchor:[17,35],
            popupAnchor:[0,-35],
            shadowUrl:null
        }),
        hidden: L.icon({
            iconUrl:"icons/gem-stone.svg",
            iconSize:[35,35],
            iconAnchor:[17,35],
            popupAnchor:[0,-35],
            shadowUrl:null
        })
    };

    return icons;
}

/**
 * Get the appropriate icon for a point based on its category
 */
function getIconForCategory(category, icons) {
    const categoryToIcon = {
        "templesLayer": icons.temple, 
        "beachLayer": icons.beach, 
        "damsLayer":icons.dams,
        "wildLayer":icons.wild,
        "waterFallsLayer":icons.water,
        "historyLayer":icons.history,
        "trekLayer":icons.trek,
        "collegeLayer":icons.college,
        "hiddenLayer":icons.hidden
        
    };

    return categoryToIcon[category] || undefined;
}

/**
 * Add a marker to the appropriate layer based on its category
 */
function addMarkerToLayer(marker, category, layers) {
    const categoryToLayer = {
        "templesLayer": layers.temples,
        "beachLayer": layers.beaches,
        "damsLayer":layers.dams,
        "wildLayer":layers.wild,
        "waterFallsLayer":layers.water,
        "historyLayer":layers.history,
        "trekLayer":layers.trek,
        "collegeLayer":layers.college,
        "hiddenLayer":layers.hidden
    };

    if (categoryToLayer[category]) {
        marker.addTo(categoryToLayer[category]);
    }
}

/**
 * Create popup HTML content for a point of interest (now used for details pane)
 */
function createDetailsHTML(point, index) {
  const sliderId = `slider-${index}`;
  const infoId = `info-${index}`;
  const datalistId = `marks-${index}`;
  const buttonId = `add-btn-${index}`;

  let sliderHTML = '';
  let staticInfoHTML = '';

  
  if (Array.isArray(point.info) && point.timeline && point.info.length === point.timeline.length) {
      const options = point.timeline.map((label, i) =>
          `<option value="${i}" label="${label}"></option>`
      ).join('');

      sliderHTML = `
          <input
              type="range" min="0" max="${point.timeline.length - 1}" value="0"
              id="${sliderId}" list="${datalistId}" style="width: 100%"
              data-info="${encodeURIComponent(JSON.stringify(point.info))}"
          />
          <datalist id="${datalistId}">${options}</datalist>
          <p style="font-size: 23px;" id="${infoId}">${point.info[0]}</p>
      `;
  } else if (typeof point.info === "string") {
      staticInfoHTML = `<p>${point.info}</p>`;
  }

  
  return `
      <img src="${point.img}" style="width: 100%; max-height: 200px; object-fit: contain;" />
      ${sliderHTML || staticInfoHTML}
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <a href="${point.link}" target="_blank">Read more</a>
          <button id="${buttonId}" class="add-to-itinerary" data-name="${encodeURIComponent(point.name)}">Add to Itinerary</button>
      </div>
  `;
}

/**
 * Set up event listeners for interactive elements in the details pane
 */
function setupDetailsPaneListeners() {
    const detailsPane = document.getElementById("detailsPane");
    if (!detailsPane) return;

    
    const slider = detailsPane.querySelector('input[type="range"]');
    const infoPara = detailsPane.querySelector('p[id^="info-"]');

    if (slider && infoPara && slider.hasAttribute('data-info')) {
        try {
            const infoArray = JSON.parse(decodeURIComponent(slider.getAttribute('data-info')));
            slider.addEventListener('input', () => {
                const idx = parseInt(slider.value);
                if (!isNaN(idx) && idx < infoArray.length) {
                    infoPara.textContent = infoArray[idx];
                }
            });
        } catch (err) {
            console.warn("Invalid info array on slider:", err);
        }
    }

    
    const addButton = detailsPane.querySelector('.add-to-itinerary');
    if (addButton) {
        addButton.addEventListener('click', function() {
            const placeName = decodeURIComponent(this.getAttribute('data-name'));

            
            if (!itinerary.includes(placeName)) {
                itinerary.push(placeName);
                console.log(`Added ${placeName} to itinerary`);
                console.log("Current itinerary:", itinerary);

                
                this.textContent = "Added!";
                this.style.backgroundColor = "#4CAF50";
                this.style.color = "white";

                
                setTimeout(() => {
                    this.textContent = "Add to Itinerary";
                    this.style.backgroundColor = "";
                    this.style.color = "";
                }, 2000);

                
                updateItineraryDisplay();
                initRoutingWithLiveLocation();
            } else {
                
                this.textContent = "Already in itinerary";
                this.style.backgroundColor = "#FFA500";

                setTimeout(() => {
                    this.textContent = "Add to Itinerary";
                    this.style.backgroundColor = "";
                }, 2000);
            }
        });
    }
}

/**
 * Load points of interest from JSON file and add them to the map
 */
function loadPointsOfInterest(map, featureLayers) {
    const icons = createMapIcons();

    fetch('files/tourist_poi.json')
        .then(res => res.json())
        .then(data => {
            data.forEach((point, index) => {
                
                const detailsHTML = createDetailsHTML(point, index);

                
                const icon = getIconForCategory(point.category, icons);
                console.log(point.category);
                const marker = L.marker([point.lat, point.lon], { icon });

                
                marker.addEventListener("click", () => {
                    openSidePane(point.name, detailsHTML);
                    //executeSearch(point.name);
                    map.setView([point.lat, point.lon+0.5],10 ); 
                });

                
                addMarkerToLayer(marker, point.category, featureLayers);

                
                markers.push(marker);
            });

            
        })
        .catch(err => console.error("Failed to fetch or render tourist data:", err));
}

/**
 * Update the itinerary list in the UI
 */
function updateItineraryDisplay() {
    const itineraryContainer = document.getElementById('itinerary-list');
    if (!itineraryContainer) return;

    itineraryContainer.innerHTML = '';

    
    if (itinerary.length === 0) {
        itineraryContainer.innerHTML = '<p>Your itinerary is empty. Click "Add to Itinerary" on map locations to add them.</p>';
        return;
    }

    
    const list = document.createElement('ul');
    itinerary.forEach((place, index) => {
        const item = document.createElement('li');
        item.textContent = place;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = function() {
            itinerary.splice(index, 1);
            updateItineraryDisplay();
        };

        item.appendChild(removeBtn);
        list.appendChild(item);
    });

    itineraryContainer.appendChild(list);
}

/**
 * Add this function call to the main initialization function
 */
function enhanceMapWithPOIs(map, featureLayers) {
    loadPointsOfInterest(map, featureLayers);
    updateItineraryDisplay();
}