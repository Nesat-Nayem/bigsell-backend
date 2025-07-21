"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placesRouter = void 0;
const express_1 = __importDefault(require("express"));
const places_controller_1 = require("./places.controller");
const router = express_1.default.Router();
// Get place autocomplete suggestions
router.get('/autocomplete', places_controller_1.getPlacesAutocomplete);
// Get place details by place ID
router.get('/details/:placeId', places_controller_1.getPlaceDetails);
// Get address from coordinates (reverse geocoding)
router.get('/geocode', places_controller_1.getGeocodeFromCoords);
// Calculate distances from user location to multiple destinations
router.post('/calculate-distances', places_controller_1.calculateDistances);
exports.placesRouter = router;
