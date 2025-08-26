import mongoose, { Schema } from 'mongoose';
import { IAbout } from './about.interface';

const AboutUsSchema = new Schema(
  {
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const CounterSchema = new Schema(
  {
    happyCustomers: { type: Number, default: 0 },
    electronicsProducts: { type: Number, default: 0 },
    activeSalesman: { type: Number, default: 0 },
    storeWorldwide: { type: Number, default: 0 },
  },
  { _id: false }
);

const AboutInfoSchema = new Schema(
  {
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const WhyChooseItemSchema = new Schema(
  {
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    shortDesc: { type: String, default: '' },
  },
  { _id: false }
);

const AboutSchema: Schema = new Schema(
  {
    aboutUs: { type: AboutUsSchema, default: {} },
    counter: { type: CounterSchema, default: {} },
    aboutInfo: { type: AboutInfoSchema, default: {} },
    whyChooseUs: { type: [WhyChooseItemSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        (ret as any).createdAt = new Date((ret as any).createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        (ret as any).updatedAt = new Date((ret as any).updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      },
    },
  }
);

export const About = mongoose.model<IAbout>('About', AboutSchema);
