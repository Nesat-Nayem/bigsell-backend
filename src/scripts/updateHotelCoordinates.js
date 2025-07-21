const mongoose = require('mongoose');
const { Hotel } = require('../app/modules/hotel/hotel.model');
require('dotenv').config();

// Sample coordinates for common locations in India
const locationCoordinates = {
  'Kothrud, Pune, Maharashtra, India': [73.8077, 18.5074],
  'S B Road': [73.8567, 18.5204],
  'Shop 16, 2nd Floor, The Pavallion Mall, Senapati Bapat Road, Pune': [73.8567, 18.5204],
  'Mumbai': [72.8777, 19.0760],
  'Delhi': [77.1025, 28.7041],
  'Bengaluru': [77.5946, 12.9716],
  'Chennai': [80.2707, 13.0827],
  'Hyderabad': [78.4867, 17.3850],
  'Kolkata': [88.3639, 22.5726],
  'Pune': [73.8567, 18.5204],
  'Ahmedabad': [72.5714, 23.0225],
  'Jaipur': [75.7873, 26.9124],
  'Surat': [72.8311, 21.1702],
  'Lucknow': [80.9462, 26.8467],
  'Kanpur': [80.3319, 26.4499],
  'Nagpur': [79.0882, 21.1458],
  'Indore': [75.8577, 22.7196],
  'Thane': [72.9781, 19.2183],
  'Bhopal': [77.4126, 23.2599],
  'Visakhapatnam': [83.3018, 17.6868],
  'Pimpri-Chinchwad': [73.8077, 18.6298],
  'Patna': [85.1376, 25.5941],
  'Vadodara': [73.1812, 22.3072],
  'Ghaziabad': [77.4538, 28.6692],
  'Ludhiana': [75.8573, 30.9010],
  'Agra': [78.0081, 27.1767],
  'Nashik': [73.7898, 19.9975],
  'Faridabad': [77.3178, 28.4089],
  'Meerut': [77.7064, 28.9845],
  'Rajkot': [70.8022, 22.3039],
  'Kalyan-Dombivali': [73.1645, 19.2403],
  'Vasai-Virar': [72.8397, 19.4912],
  'Varanasi': [82.9739, 25.3176],
  'Srinagar': [74.7973, 34.0837],
  'Aurangabad': [75.3433, 19.8762],
  'Dhanbad': [86.4304, 23.7957],
  'Amritsar': [74.8723, 31.6340],
  'Navi Mumbai': [73.0297, 19.0330],
  'Allahabad': [81.8463, 25.4358],
  'Ranchi': [85.3240, 23.3441],
  'Howrah': [88.2636, 22.5958],
  'Coimbatore': [76.9558, 11.0168],
  'Jabalpur': [79.9864, 23.1815],
  'Gwalior': [78.1828, 26.2124],
  'Vijayawada': [80.6480, 16.5062],
  'Jodhpur': [73.0243, 26.2389],
  'Madurai': [78.1198, 9.9252],
  'Raipur': [81.6296, 21.2514],
  'Kota': [75.8648, 25.2138],
  'Chandigarh': [76.7794, 30.7333],
  'Guwahati': [91.7362, 26.1445],
  'Solapur': [75.9064, 17.6599],
  'Hubli-Dharwad': [75.1240, 15.3647],
  'Bareilly': [79.4304, 28.3670],
  'Moradabad': [78.7733, 28.8386],
  'Mysore': [76.6394, 12.2958],
  'Gurgaon': [77.0266, 28.4595],
  'Aligarh': [78.0880, 27.8974],
  'Jalandhar': [75.5762, 31.3260],
  'Tiruchirappalli': [78.7047, 10.7905],
  'Bhubaneswar': [85.8245, 20.2961],
  'Salem': [78.1460, 11.6643],
  'Mira-Bhayandar': [72.8544, 19.2952],
  'Warangal': [79.5941, 17.9689],
  'Thiruvananthapuram': [76.9366, 8.5241],
  'Guntur': [80.4365, 16.3067],
  'Bhiwandi': [73.0634, 19.3002],
  'Saharanpur': [77.5460, 29.9680],
  'Gorakhpur': [83.3732, 26.7606],
  'Bikaner': [73.3119, 28.0229],
  'Amravati': [77.7500, 20.9374],
  'Noida': [77.3910, 28.5355],
  'Jamshedpur': [86.1844, 22.8046],
  'Bhilai Nagar': [81.3509, 21.1938],
  'Cuttack': [85.8781, 20.4625],
  'Firozabad': [78.3957, 27.1592],
  'Kochi': [76.2673, 9.9312],
  'Bhavnagar': [72.1519, 21.7645],
  'Dehradun': [78.0322, 30.3165],
  'Durgapur': [87.3119, 23.4781],
  'Asansol': [86.9842, 23.6739],
  'Nanded': [77.2663, 19.1383],
  'Kolhapur': [74.2433, 16.7050],
  'Ajmer': [74.6399, 26.4499],
  'Akola': [77.0082, 20.7002],
  'Gulbarga': [76.8343, 17.3297],
  'Jamnagar': [70.0692, 22.4707],
  'Ujjain': [75.7849, 23.1765],
  'Loni': [77.2863, 28.7333],
  'Siliguri': [88.3953, 26.7271],
  'Jhansi': [78.6569, 25.4484],
  'Ulhasnagar': [73.1526, 19.2215],
  'Jammu': [74.8570, 32.7266],
  'Sangli-Miraj & Kupwad': [74.5815, 16.8524],
  'Mangalore': [74.8560, 12.9141],
  'Erode': [77.7172, 11.3410],
  'Belgaum': [74.4977, 15.8497],
  'Ambattur': [80.1548, 13.1143],
  'Tirunelveli': [77.6933, 8.7139],
  'Malegaon': [74.5815, 20.5579],
  'Gaya': [85.0002, 24.7914],
  'Jalgaon': [75.5626, 21.0077],
  'Udaipur': [73.6677, 24.5854],
  'Maheshtala': [88.2482, 22.4986]
};

async function updateHotelCoordinates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Get all hotels without coordinates
    const hotels = await Hotel.find({
      isDeleted: false,
      $or: [
        { coordinates: { $exists: false } },
        { 'coordinates.coordinates': { $exists: false } },
        { 'coordinates.coordinates': [] }
      ]
    });

    console.log(`Found ${hotels.length} hotels without coordinates`);

    let updatedCount = 0;

    for (const hotel of hotels) {
      let coordinates = null;
      
      // Try to find exact match first
      if (locationCoordinates[hotel.location]) {
        coordinates = locationCoordinates[hotel.location];
      } else {
        // Try to find partial match
        const locationKey = Object.keys(locationCoordinates).find(key => 
          key.toLowerCase().includes(hotel.location.toLowerCase()) ||
          hotel.location.toLowerCase().includes(key.toLowerCase())
        );
        
        if (locationKey) {
          coordinates = locationCoordinates[locationKey];
        }
      }

      if (coordinates) {
        await Hotel.findByIdAndUpdate(hotel._id, {
          coordinates: {
            type: 'Point',
            coordinates: coordinates, // [longitude, latitude]
            address: hotel.location
          }
        });
        
        console.log(`Updated coordinates for ${hotel.name} at ${hotel.location}`);
        updatedCount++;
      } else {
        console.log(`No coordinates found for ${hotel.name} at ${hotel.location}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} hotels with coordinates`);
    
    // Create 2dsphere index for geospatial queries
    await Hotel.collection.createIndex({ "coordinates": "2dsphere" });
    console.log('Created 2dsphere index for coordinates');

  } catch (error) {
    console.error('Error updating hotel coordinates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateHotelCoordinates();