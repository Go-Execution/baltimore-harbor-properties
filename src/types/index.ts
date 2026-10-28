export interface Amenity {
  name: string;
  icon: string;
  category: string;
}

export interface Commute {
  destination: string;
  time: string;
}

export interface Property {
  id: number;
  title: string;
  subtitle: string;
  neighborhood: string;
  address: string;
  price: number;
  cleaningFee: number;
  taxRate: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  sqft: number;
  rating: number;
  reviewsCount: number;
  badges: string[];
  coverImage: string;
  gallery: string[];
  description: string;
  amenities: Amenity[];
  commute: Commute[];
  reviews?: PropertyReview[];
  viewType?: string;
  bedType?: string;
  status?: 'Active' | 'Inactive' | 'Maintenance';
  featured?: boolean;
}

export interface PropertyReview {
  author: string;
  date: string;
  text: string;
  rating?: number;
}

export interface MaintenanceTicket {
  id: string;
  title: string;
  category: string;
  status: 'Dispatched' | 'Resolved' | 'Under Review';
  date: string;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  description?: string;
  room?: string;
}

export interface OwnerApproval {
  id: string;
  property: string;
  item: string;
  cost: string;
  status: 'Pending' | 'Approved' | 'Declined';
}

export interface Reservation {
  id: string;
  guest: string;
  property: string;
  dates: string;
  status: 'Pending' | 'In-Stay' | 'Arriving Today' | 'Confirmed' | 'Completed' | 'Cancelled';
  total: string;
  guestEmail?: string;
  guestPhone?: string;
  pinCode?: string;
  nights?: number;
  createdAt?: string;
}
