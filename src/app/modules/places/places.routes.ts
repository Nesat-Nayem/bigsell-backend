import express from 'express';
import { getPlacesAutocomplete, getPlaceDetails, getGeocodeFromCoords, calculateDistances } from './places.controller';

const router = express.Router();

// Get place autocomplete suggestions
router.get('/autocomplete', getPlacesAutocomplete);

// Get place details by place ID
router.get('/details/:placeId', getPlaceDetails);


// Get address from coordinates (reverse geocoding)
router.get('/geocode', getGeocodeFromCoords);

// Calculate distances from user location to multiple destinations
router.post('/calculate-distances', calculateDistances);

export const placesRouter = router;

