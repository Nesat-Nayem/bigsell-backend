import { Request, Response, NextFunction } from 'express';
import { appError } from '../../errors/appError';

export const getPlacesAutocomplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { input } = req.query;
    
    if (!input || typeof input !== 'string') {
      next(new appError('Input parameter is required', 400));
      return;
    }
    
    

    const PLACES_API_KEY = process.env.PLACES_API_KEY;
    
    if (!PLACES_API_KEY) {
      next(new appError('Places API key not configured', 500));
      return;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment|geocode&key=${PLACES_API_KEY}&language=en`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API');
    }

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Place suggestions retrieved successfully',
      data
    });
    
  } catch (error) {
    console.error('Error in places autocomplete:', error);
    next(new appError('Failed to fetch place suggestions', 500));
  }
};

export const getPlaceDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      next(new appError('Place ID is required', 400));
      return;
    }

    const PLACES_API_KEY = process.env.PLACES_API_KEY;
    
    if (!PLACES_API_KEY) {
      next(new appError('Places API key not configured', 500));
      return;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,place_id&key=${PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API');
    }

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Place details retrieved successfully',
      data
    });
    
  } catch (error) {
    console.error('Error in place details:', error);
    next(new appError('Failed to fetch place details', 500));
  }
};

export const getGeocodeFromCoords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      next(new appError('Latitude and longitude are required', 400));
      return;
    }

    const GEOCODING_API_KEY = process.env.GEOCODING_API_KEY || process.env.PLACES_API_KEY;
    
    if (!GEOCODING_API_KEY) {
      next(new appError('Geocoding API key not configured', 500));
      return;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GEOCODING_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Geocoding API');
    }

    const data = await response.json();
    
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
    } else {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'No address found for the given coordinates',
        data: null
      });
    }
    
  } catch (error) {
    console.error('Error in geocoding:', error);
    next(new appError('Failed to get address from coordinates', 500));
  }
};

export const calculateDistances = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userLat, userLng, destinations } = req.body;
    
    if (!userLat || !userLng || !destinations || !Array.isArray(destinations)) {
      next(new appError('User coordinates and destinations array are required', 400));
      return;
    }

    const DISTANCE_MATRIX_API_KEY = process.env.DISTANCE_MATRIX_API_KEY;
    
    if (!DISTANCE_MATRIX_API_KEY) {
      next(new appError('Distance Matrix API key not configured', 500));
      return;
    }

    // Create destinations string for Google API
    const destinationsString = destinations
      .map(dest => `${dest.lat},${dest.lng}`)
      .join('|');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${destinationsString}&units=metric&key=${DISTANCE_MATRIX_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Distance Matrix API');
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.rows && data.rows[0]) {
      const elements = data.rows[0].elements;
      const distances = elements.map((element: any, index: number) => ({
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
    } else {
      next(new appError('Failed to calculate distances', 500));
    }
    
  } catch (error: any) {
    next(new appError('Failed to calculate distances', 500));
  }
};
