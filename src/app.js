let map, directionsService, directionsRenderer;

window.initMap = () => {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: { lat: 0, lng: 0 },
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
        resultSection.innerText = "Please allow location access to get travel duration.";
        console.error('Error getting location:', error);
    }
})