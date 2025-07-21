import mongoose, { Document } from 'mongoose';
import { Types } from 'mongoose';


interface IWeeklyTiming {
  day: string;
  hours: string;
}



interface IGalleryImage {
  url: string;
  alt: string;
}

interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

interface IFoodOption {
  label: string;
  price: number;
}


interface IMenuItem {
  id: string;
  _id:string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  itemType?: string[];
  attributes?: string[];
  rating?: number;
  options?: IFoodOption[];
  sortdesc: string;  
  offer: string;
  // Add this property to fix the error
  addons?: any[]; // Add this if missing
  toObject(): any; // Add this method
}


interface IMenuCategory {
  name: string;
  image: string;
  items: IMenuItem[];
}

interface IPreBookOffer {
  title: string;
  description: string;
  slots: string;
  buttonText: string;
}

interface IWalkInOffer {
  title: string;
  description: string;
  validTime: string;
  icon: string;
}

interface IBankBenefit {
  bankName: string;
  description: string;
  code: string;
  bgColor: string;
}

interface IAboutInfo {
  established: string;
  location: string;
  priceForTwo: string;
  cuisineTypes: string[];
  facilities: string[];
  featuredIn: {
    title: string;
    image: string;
  };
}


export interface IHotel extends Document {
  name: string;
  description: string;
  location: string;
  coordinates?: ILocation; // Add geospatial coordinates
  distance: string;
  cuisine: string;
  price: string;
  rating: number;
  mainImage: string;
  galleryImages: IGalleryImage[];
  offer: string;
  weeklyTimings: IWeeklyTiming[];
  menuCategories: IMenuCategory[];
  menuItemTypes: string[];
  menuAttributes: string[];
  reviews: IReview[];
  buffets?: IBuffet[];
  preBookOffers: IPreBookOffer[];
  walkInOffers: IWalkInOffer[];
  bankBenefits: IBankBenefit[];
  aboutInfo: IAboutInfo;
  vendorId: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  cgstRate?: number;
  sgstRate?: number;
  serviceCharge?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IReview {
  name: string;
  rating: number;
  comment: string;
  date: Date;
}

interface IBuffet {
  _id: mongoose.Types.ObjectId; 
  name: string;
  type: string;
  days: string[];
  hours: string;
  price: number;
}

// Platform Activity interfaces
export interface IPlatformActivity {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'restored';
  message: string;
  actor: {
    name: string;
    phone: string;
    id: string;
  };
  target: {
    type: 'restaurant';
    name: string;
    id: string;
    location: string;
    cuisine: string;
    rating: number;
    image: string;
  };
  timestamp: Date;
  icon: string;
  color: string;
}

export interface IPlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  deletedRestaurants: number;
  todayAdded: number;
}

export interface IPlatformActivityResponse {
  activities: IPlatformActivity[];
  stats: IPlatformStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
