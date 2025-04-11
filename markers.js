let itinerary = [];

// Create custom icons for different map features

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

        place: L.icon({
            iconUrl: 'icons/tourist.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        hillStation: L.icon({
            iconUrl: 'icons/hill-forest.svg',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35],
            shadowUrl: null
        }),

        crown: L.icon({
            iconUrl: 'icons/crown.svg',
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
        })
    };

    return icons;
}
