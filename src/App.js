import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Map from './map';
import RestaurantList from './restaurantList';
import './App.css';

const apikey = 'hqHe5gq5KJWuLZx0go7_lB-rG5GGLpZN4Fj5f7Hqeo4';

const calculateRouteDistance = async (startLat, startLng, destLat, destLng) => {
  const routingApiUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLat},${startLng}&destination=${destLat},${destLng}&return=summary&apiKey=${apikey}`;
  try {
    var distance = 0;
    const response = await fetch(routingApiUrl);
    console.log(response.status)
    if (!response.ok) {
      if (response.status === 429) {
        // Handle rate limit error specifically
        console.error("Rate limit exceeded. Please try again later.");
      } else {
        // Handle other types of errors
        throw new Error('Network response was not ok.');
      }
    } else {
      const data = await response.json();
      // Assuming the first route is the desired one, extract its length in kilometers
      distance = data.routes[0].sections[0].summary.length / 1000; // Convert meters to kilometers
      console.log(distance)
    } 
    return distance;
  } catch (error) {
    console.error("Error calculating route distance:", error);
    return null;
  }
};
  // const lol = async () => {
  //   var starttttt = { lat: 28.358281, lng: 75.589055 };
  //   var endddddd = { lat: 28.366882, lng: 75.588221 };
  //     const routingParameters = {
  //     mode: `fastest;car`,
  //     waypoint0: `${starttttt.lat},${starttttt.lng}`,
  //     waypoint1: `${endddddd.lat},${endddddd.lng}`,
  //     representation: `display`,
  //     apiKey: apikey
  //   };

  //   const url = `https://route.ls.hereapi.com/routing/7.2/calculateroute.json?${new URLSearchParams(routingParameters)}`;
  //   fetch(url, {mode : 'no-cors'})
  //   .then(response => {
  //       if (!response.ok) {
  //           throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //   })
  //   .then(data => {
  //       console.log(data)
  //       // Extract waypoints from the response
  //       const route = data.response.route[0];
  //       const waypoints = route.waypoint.map(waypoint => ({
  //           lat: waypoint.originalPosition.latitude,
  //           lng: waypoint.originalPosition.longitude
  //       }));
  //       console.log('Waypoints:', waypoints);
  //   })
  //   .catch(error => {
  //       console.error('Error fetching route:', error);
  //   });
  // };

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
        // console.log(userPosition)
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
      // lol();
    }
  }, [userPosition]); // This effect depends on userPosition

  const onClickHandler_ = (location) => {
    setRestaurantPosition(location);
  };



  return (

        // <BrowserRouter>
        //   <Routes>
        //     <Route path="/home" element={<Map apikey={apikey} userPosition={userPosition} restaurantPosition={restaurantPosition} />}>
        //     <Route index element={<RestaurantList list={restaurants} onClickHandler={onClickHandler_} className="Restaurant-list" />} />
        //     </Route>
        //   </Routes>
        // </BrowserRouter>
        
        <div className='master'>
          <div className="Map-container">
              <Map
                apikey={apikey}
                userPosition={userPosition}
                restaurantPosition={restaurantPosition}/>
                <RestaurantList list={restaurants} onClickHandler={onClickHandler_} className="Restaurant-list" />
          </div>
        </div>
  );
}

export default App;