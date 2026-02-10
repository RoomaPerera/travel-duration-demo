let map, directionsService, directionsRenderer;
let manualOrigin = null;
let startMarker = null;
window.initMap = function () {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: { lat: 7.8731, lng: 80.7718 },
    });

    directionsRenderer.setMap(map);
};
// get references
const destinationInput = document.getElementById('destination');
const modeSelect = document.getElementById('modeSelect');
const getDurationBtn = document.getElementById('getDuration');
const resultSection = document.getElementById('result');

// get user geolocation
const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    console.error("User or System denied Geolocation.");
                }
                reject(error);
            },
            (options)
        )
    })
}

// get travel duration using Google Maps API
getDurationBtn.addEventListener('click', async () => {
    if (manualOrigin) {
        calculateRoute(manualOrigin);
        return;
    }
    try {
        resultSection.innerText = "Finding your location...";
        const cords = await getUserLocation();
        const destination = destinationInput.value;
        const mode = modeSelect.value;
        const request = {
            origin: { lat: cords.latitude, lng: cords.longitude },
            destination: destination,
            travelMode: google.maps.TravelMode[mode]
        };
        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                const route = result.routes[0].legs[0];
                resultSection.innerText = `Estimated travel duration: ${route.duration.text} | Distance: ${route.distance.text}`;
            } else {
                resultSection.innerText = "Could not find the route to that destination.";
            }
        })
    } catch (error) {
        resultSection.innerText = "Location blocked. Please click on the map to pinpoint your starting location";
        map.setOptions({ draggableCursor: 'crosshair' });
        const clickListener = map.addListener("click", (event) => {
            manualOrigin = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            startMarker = new google.maps.Marker({
                position: manualOrigin,
                map: map,
                label: "Start"
            });
            resultSection.innerText = "Location set. Click 'Get Travel Duration' again to calculate";
            map.setOptions({ draggableCursor: null });
            google.maps.event.removeListener(clickListener);
        });
    }
})
function calculateRoute(origin) {
    const destination = destinationInput.value;
    const mode = modeSelect.value;
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[mode]
    };
    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const route = result.routes[0].legs[0];
            resultSection.innerText = `Duration: ${route.duration.text} | Distance: ${route.distance.text}`;
        } else {
            resultSection.innerText = "Error: Could not find route.";
        }
    });
}

if (typeof google !== 'undefined' && google.maps) {
    window.initMap();
} else {
    window.addEventListener('load', () => {
        if (window.initMap) window.initMap();
    });
}

const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
    manualOrigin = null;
    destinationInput.value = "";
    resultSection.innerText = "";
    directionsRenderer.setDirections({ routes: [] });
    if (startMarker) {
        startMarker.setMap(null);
        startMarker = null;
    }
});