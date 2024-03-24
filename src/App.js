import React, { useState, useEffect } from 'react';
import Map from './map';
import RestaurantList from './restaurantList';

const apikey = 'LX5pktDkjopjKQkDRFHLk-LaAKBS4_UQttoqtkbMf9Q';

const calculateRouteDistance = async (startLat, startLng, destLat, destLng) => {
  const routingApiUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${destLat},${destLng}&return=summary&apiKey=${apikey}`;
  try {
    const response = await fetch(routingApiUrl);
    const data = await response.json();
    // Assuming the first route is the desired one, extract its length in kilometers
    const distance = data.routes[0].sections[0].summary.length / 1000; // Convert meters to kilometers
    return distance;
  } catch (error) {
    console.error("Error calculating route distance:", error);
    return null;
  }
};

function App() {
  const [userPosition, setUserPosition] = useState({ lat: 0, lng: 0 }); // Initialize to a default position
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantPosition, setRestaurantPosition] = useState(null);

  // Function to fetch the user's current location
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(position => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => {
        console.error("Error getting user's location", error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    const nearby = async () => {
      try {
        const response = await fetch(`https://discover.search.hereapi.com/v1/discover?at=${userPosition.lat},${userPosition.lng}&q=restaurant&apiKey=${apikey}&limit=10`);
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();

        const distancePromises = data.items.map(restaurant =>
          calculateRouteDistance(userPosition.lat, userPosition.lng, restaurant.position.lat, restaurant.position.lng)
          .then(distance => ({
            name: restaurant.title,
            location: restaurant.position,
            distance,
          }))
        );

        Promise.all(distancePromises).then(fetchedRestaurants => {
          // Filter restaurants to those within a 6 km distance
          const restaurantsWithinDistance = fetchedRestaurants.filter(restaurant => restaurant.distance < 6);
          setRestaurants(restaurantsWithinDistance);
        });
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    if (userPosition.lat !== 0 && userPosition.lng !== 0) { // Ensure default position is updated before fetching
      nearby();
    }
  }, [userPosition]); // This effect depends on userPosition

  const onClickHandler_ = (location) => {
    setRestaurantPosition(location);
  };

  return (
    <div>
      <Map
        apikey={apikey}
        userPosition={userPosition}
        // userPosition={{lat: 28.640380, lng : 77.366396}}
        restaurantPosition={restaurantPosition}
      />
      <RestaurantList list={restaurants} onClickHandler={onClickHandler_} />
    </div>
  );
}

export default App;