import mongoose, { Schema } from 'mongoose';
import { IHotel } from './hotel.interface';

const WeeklyTimingSchema = new Schema({
  
  
  day: {
    
    type: String,
    required: true,
    trim: true
  },
  
  hours: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });




const GalleryImageSchema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  alt: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const FoodOptionSchema = new Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const MenuItemSchema = new Schema({
  id: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  spicy: {
    type: Boolean,
    default: false
  },
  isVeg: {
    type: Boolean,
    default: false
  },
  isEgg: {
    type: Boolean,
    default: false
  },
  isNonVeg: {
    type: Boolean,
    default: false
  },
  itemType: {
    type: [String],
    default: []
  },
  attributes: {
    type: [String],
    default: []
  },
  

  
  isQuick: {
    type: Boolean,
    default: false
  },
  isHighlyReordered: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  options: {
    type: [FoodOptionSchema],
    default: []
  },
  sortdesc: {
    type: String,
    trim: true
  },
  offer: {
    type: String,
    trim: true
  }

}, { _id: false });

const MenuCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  items: {
    type: [MenuItemSchema],
    default: []
  }
}, { _id: false });

const ReviewSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const BuffetSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  days: {
    type: [String],
    required: true
  },
  hours: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: true });


const PreBookOfferSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  slots: {
    type: String,
    required: true,
    trim: true
  },
  buttonText: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });



const WalkInOfferSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  validTime: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const BankBenefitSchema = new Schema({
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  bgColor: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const FeaturedInSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const AboutInfoSchema = new Schema({
  established: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  priceForTwo: {
    type: String,
    required: true,
    trim: true
  },
  cuisineTypes: {
    type: [String],
    required: true
  },
  facilities: {
    type: [String],
    required: true
  },
  featuredIn: {
    type: FeaturedInSchema,
    required: true
  }
}, { _id: false });

const HotelSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      unique: true
    },
    description: { 
      type: String, 
      required: true,
      trim: true
    },
    location: { 
      type: String, 
      required: true,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere' // Enable geospatial queries
      },
      address: {
        type: String,
        trim: true
      }
    },
    distance: { 
      type: String, 
      required: true,
      trim: true
    },
    cuisine: { 
      type: String, 
      required: true,
      trim: true
    },
    price: { 
      type: String, 
      required: true,
      trim: true
    },
    rating: { 
      type: Number, 
      required: true,
      min: 0,
      max: 5
    },
    mainImage: { 
      type: String, 
      required: true 
    },
    galleryImages: {
      type: [GalleryImageSchema],
      default: []
    },
    offer: { 
      type: String, 
      required: false,
      trim: true
    },
    weeklyTimings: {
      type: [WeeklyTimingSchema],
      default: []
    },
    menuCategories: {
      type: [MenuCategorySchema],
      default: []
    },
    menuItemTypes: {
      type: [String],
      default: ['Veg', 'Non-Veg', 'Contains Egg', 'Jain']
    },
    menuAttributes: {
      type: [String],
      default: ['Spicy', 'Sweet', 'Quick Preparation', 'Highly Reordered', 'Bestseller']
    },
    reviews: {
      type: [ReviewSchema],
      default: []
    },
    buffets: {
      type: [BuffetSchema],
      default: []
    },
    preBookOffers: {
      type: [PreBookOfferSchema],
      default: []
    },
    walkInOffers: {
      type: [WalkInOfferSchema],
      default: []
    },
    
    bankBenefits: {
      type: [BankBenefitSchema],
      default: []
    },
    aboutInfo: {
      type: AboutInfoSchema,
      default: null
    },
    
    vendorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    cgstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    sgstRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      }
    }
  }
);

export const Hotel = mongoose.model<IHotel>('Hotel', HotelSchema);
