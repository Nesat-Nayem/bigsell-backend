"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistances = exports.getGeocodeFromCoords = exports.getPlaceDetails = exports.getPlacesAutocomplete = void 0;
const appError_1 = require("../../errors/appError");
const getPlacesAutocomplete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { input } = req.query;
        if (!input || typeof input !== 'string') {
            next(new appError_1.appError('Input parameter is required', 400));
            return;
        }
        const PLACES_API_KEY = process.env.PLACES_API_KEY;
        if (!PLACES_API_KEY) {
            next(new appError_1.appError('Places API key not configured', 500));
            return;
        }
        const response = yield fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment|geocode&key=${PLACES_API_KEY}&language=en`);
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Places API');
        }
        const data = yield response.json();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Place suggestions retrieved successfully',
            data
        });
    }
    catch (error) {
        console.error('Error in places autocomplete:', error);
        next(new appError_1.appError('Failed to fetch place suggestions', 500));
    }
});
exports.getPlacesAutocomplete = getPlacesAutocomplete;
const getPlaceDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { placeId } = req.params;
        if (!placeId) {
            next(new appError_1.appError('Place ID is required', 400));
            return;
        }
        const PLACES_API_KEY = process.env.PLACES_API_KEY;
        if (!PLACES_API_KEY) {
            next(new appError_1.appError('Places API key not configured', 500));
            return;
        }
        const response = yield fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,place_id&key=${PLACES_API_KEY}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Places API');
        }
        const data = yield response.json();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Place details retrieved successfully',
            data
        });
    }
    catch (error) {
        console.error('Error in place details:', error);
        next(new appError_1.appError('Failed to fetch place details', 500));
    }
});
exports.getPlaceDetails = getPlaceDetails;
const getGeocodeFromCoords = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            next(new appError_1.appError('Latitude and longitude are required', 400));
            return;
        }
        const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY || process.env.PLACES_API_KEY;
        if (!GEOCODING_API_KEY) {
            next(new appError_1.appError('Geocoding API key not configured', 500));
            return;
        }
        const response = yield fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GEOCODING_API_KEY}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Geocoding API');
        }
        const data = yield response.json();
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Geocoding successful',
                data: {
                    formatted_address: result.formatted_address,
                    place_id: result.place_id,
                    geometry: result.geometry
                }
            });
        }
        else {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'No address found for the given coordinates',
                data: null
            });
        }
    }
    catch (error) {
        console.error('Error in geocoding:', error);
        next(new appError_1.appError('Failed to get address from coordinates', 500));
    }
});
exports.getGeocodeFromCoords = getGeocodeFromCoords;
const calculateDistances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userLat, userLng, destinations } = req.body;
        if (!userLat || !userLng || !destinations || !Array.isArray(destinations)) {
            next(new appError_1.appError('User coordinates and destinations array are required', 400));
            return;
        }
        const DISTANCE_MATRIX_API_KEY = process.env.DISTANCE_MATRIX_API_KEY;
        if (!DISTANCE_MATRIX_API_KEY) {
            next(new appError_1.appError('Distance Matrix API key not configured', 500));
            return;
        }
        // Create destinations string for Google API
        const destinationsString = destinations
            .map(dest => `${dest.lat},${dest.lng}`)
            .join('|');
        const response = yield fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${destinationsString}&units=metric&key=${DISTANCE_MATRIX_API_KEY}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Distance Matrix API');
        }
        const data = yield response.json();
        if (data.status === 'OK' && data.rows && data.rows[0]) {
            const elements = data.rows[0].elements;
            const distances = elements.map((element, index) => ({
                hotelId: destinations[index].hotelId,
                distance: element.status === 'OK' ? {
                    text: element.distance.text,
                    value: element.distance.value, // in meters
                } : null,
                duration: element.status === 'OK' ? {
                    text: element.duration.text,
                    value: element.duration.value, // in seconds
                } : null,
                status: element.status
            }));
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: 'Distances calculated successfully',
                data: distances
            });
        }
        else {
            next(new appError_1.appError('Failed to calculate distances', 500));
        }
    }
    catch (error) {
        next(new appError_1.appError('Failed to calculate distances', 500));
    }
});
exports.calculateDistances = calculateDistances;
