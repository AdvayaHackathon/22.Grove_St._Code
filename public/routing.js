
let currentRouteControl = null;

/**
 * Initialize routing between locations in the itinerary
 * Starting from user's location, visiting all places, and returning to start
 */
async function initializeRouting() {
    let userLocation = await getUserCurrentLocation();

    let itineraryLocations = await getItineraryLocations();

    let routeWaypoints = createRouteWaypoints(userLocation, itineraryLocations);

    updateMapRoute(routeWaypoints);
}

/**
 * Get the user's current geographic location
 * @returns {Promise<L.LatLng|null>} User's location or null if unavailable
 */
async function getUserCurrentLocation() {
    try {
        return await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLatLng = L.latLng(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    resolve(userLatLng);
                },
                () => {
                    console.log("Could not get user location");
                    resolve(null);
                }
            );
        });
    } catch (error) {
        console.error("Error getting user location:", error);
        return null;
    }
}

/**
 * Get location coordinates for all places in the itinerary
 * @returns {Promise<Array<L.LatLng>>} Array of coordinates for itinerary places
 */
async function getItineraryLocations() {
    try {
        const response = await fetch('files/tourist_poi.json');
        const allPlaces = await response.json();

        const selectedPlaces = allPlaces.filter(place =>
            itinerary.includes(place.name)
        );

        return selectedPlaces.map(place =>
            L.latLng(place.lat, place.lon)
        );
    } catch (error) {
        console.error("Failed to load itinerary locations:", error);
        return [];
    }
}


function createRouteWaypoints(userLocation, placeLocations) {
    if (userLocation) {
        return [
            userLocation,
            ...placeLocations,
            userLocation
        ];
    }
    else {
        return placeLocations;
    }
}


function updateMapRoute(waypoints) {
    if (currentRouteControl) {
        map.removeControl(currentRouteControl);
    }

    if (waypoints.length > 0) {
        currentRouteControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: true
        }).addTo(map);
    }
}

/**
 * Main function to update the route when the itinerary changes
 * Call this whenever the itinerary is updated
 */
async function updateRouteFromItinerary() {
    await initializeRouting();
}


const initRoutingWithLiveLocation = updateRouteFromItinerary;