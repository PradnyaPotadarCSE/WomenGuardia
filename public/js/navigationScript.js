let map;
let marker;
let watchId;
let radiusCircle; // To store the radius circle

function initMap() {
    // Initialize the map with Kolhapur as the default location
    let latitude = 16.7050;
    let longitude = 74.2433;
    const kolhapurCoordinates = [16.7050, 74.2433];
    map = L.map('map').setView(kolhapurCoordinates, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '© Guardia',
    }).addTo(map);

    // Add a marker for the initial location (Kolhapur)
    marker = L.marker(kolhapurCoordinates).addTo(map)
        .bindPopup('Welcome to Kolhapur!')
        .openPopup();

    // Draw or update the 5km radius circle
    if (radiusCircle) {
        radiusCircle.setLatLng([latitude, longitude]); // Update circle position
    } else {
        radiusCircle = L.circle([latitude, longitude], { radius: 5000, color: 'blue', fillOpacity: 0.1 }).addTo(map);
    }
    fetchPOIs(latitude, longitude, 5000, 'police');
}

function fetchPOIs(lat, lon, radius, type) {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="${type}"](around:${radius},${lat},${lon});out;`;

    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            data.elements.forEach(element => {
                // Add a marker for each police station
                L.marker([element.lat, element.lon]).addTo(map)
                    .bindPopup(`<strong>${element.tags.name || "Police Station"}</strong>`);
            });
        })
        .catch(error => console.error('Error fetching POIs:', error));
}

function updateLocation(position) {
    const { latitude, longitude } = position.coords;

    // Update the map and marker
    if (!marker) {
        marker = L.marker([latitude, longitude]).addTo(map);
    } else {
        marker.setLatLng([latitude, longitude]);
    }

    // Recenter the map
    map.setView([latitude, longitude], 13);

    // Draw or update the 5km radius circle
    if (radiusCircle) {
        radiusCircle.setLatLng([latitude, longitude]); // Update circle position
    } else {
        radiusCircle = L.circle([latitude, longitude], { radius: 5000, color: 'blue', fillOpacity: 0.1 }).addTo(map);
    }

    // Fetch police stations within 5km
    fetchPOIs(latitude, longitude, 5000, 'police');

    // Update location information
    document.getElementById('locationInfo').innerHTML = `
        <p>Latitude: ${latitude.toFixed(6)}</p>
        <p>Longitude: ${longitude.toFixed(6)}</p>
    `;
}

function handleLocationError(error) {
    console.error('Error getting location:', error);
    const errorMessage = error.message || 'Unknown error occurred while fetching location';
    document.getElementById('locationInfo').innerHTML = `
        <p>Error: ${errorMessage}</p>
    `;
}

document.getElementById('startTracking').addEventListener('click', () => {
    if ('geolocation' in navigator) {
        // Start watching the position
        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
        document.getElementById('locationInfo').innerHTML = `<p>Tracking started...</p>`;
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

document.getElementById('stopTracking').addEventListener('click', () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;

        // Remove the radius circle
        if (radiusCircle) {
            map.removeLayer(radiusCircle);
            radiusCircle = null;
        }

        document.getElementById('locationInfo').innerHTML = `<p>Tracking stopped.</p>`;
    } else {
        alert('Tracking is not active.');
    }
});

document.getElementById('shareLocation').addEventListener('click', () => {
    if (marker) {
        // Get the current marker position
        const latLng = marker.getLatLng();
        const lat = latLng.lat.toFixed(6);
        const lng = latLng.lng.toFixed(6);
        const message = `My current location: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`;

        if (navigator.share) {
            navigator.share({
                title: 'My Location',
                text: message,
                url: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`
            }).catch((error) => {
                console.error('Error sharing location:', error);
            });
        } else {
            alert(`Share functionality is not supported by your browser. Copy this link manually: ${message}`);
        }
    } else {
        alert('Please start tracking to get your current location before sharing.');
    }
});

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', initMap);
