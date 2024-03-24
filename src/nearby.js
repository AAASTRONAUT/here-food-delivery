import React, { useState, useEffect } from 'react';
import H from '@here/maps-api-for-javascript';
// import 

const HereMapComponent = ({ restaurantList }) => {
    const [map, setMap] = useState(null);
    const [error, setError] = useState(null);
    var apikey = 'HjMSjUzWlqIQ2ON0-IOrSYCwbPq1IoclSauKu9xiM_8'
    // var defaultLayers;
    // var newMap;
    useEffect(() => {
        const platform = new H.service.Platform({
            apikey: 'HjMSjUzWlqIQ2ON0-IOrSYCwbPq1IoclSauKu9xiM_8'
        });

        const defaultLayers = platform.createDefaultLayers();
        const newMap = new H.Map(
            document.getElementById('mapContainer'),
            defaultLayers.vector.normal.map,
            {
                center: { lat: 0, lng: 0 }, // Default center position
                zoom: 12 // Default zoom level
            }
        );

        setMap(newMap);

        return () => {
            newMap.dispose();
        };
    }, []);

    useEffect(() => {
        if (!map) return;

        const handleUserLocation = (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            map.setCenter({ lat: latitude, lng: longitude });
            fetchNearbyRestaurants(latitude, longitude);
        };

        const handleLocationError = (error) => {
            setError(error.message);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(handleUserLocation, handleLocationError);
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    }, [map]);

    const fetchNearbyRestaurants = (latitude, longitude) => {
        fetch(`https://discover.search.hereapi.com/v1/discover?at=${latitude},${longitude}&q=restaurant&apiKey=${apikey}&limit=5`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(data => {
                restaurantList(data.items.map(restaurant => ({
                    name: restaurant.title,
                    address: restaurant.address.label,
                    // distance: calculateDistance(latitude, longitude, restaurant.position[0], restaurant.position[1])
                })));
            })
            .catch(error => {
                setError(error.message);
            });
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance * 1000; // Distance in meters
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    return (
        <div>
            {error && <p>Error: {error}</p>}
            <div id="mapContainer" style={{ width: '100%', height: '400px' }}></div>
            <ul>
                {restaurantList.map((restaurant, index) => (
                    <li key={index}>
                        <h3>{restaurant.name}</h3>
                        <p>{restaurant.address}</p>
                        {/* <p>The distance is {restaurant.distance.toFixed(2)} meters.</p> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HereMapComponent;
