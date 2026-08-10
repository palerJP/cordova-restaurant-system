export type UserRole = 'customer' | 'owner' | 'admin';
export type PriceRange = 'budget' | 'moderate' | 'expensive' | 'premium';
export type ServiceType = 'dine_in' | 'takeout' | 'delivery';
export type BusinessStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  email_verified?: boolean;
  google_id?: string;
  facebook_id?: string;
  created_at: string;
}

export interface UserPreferences {
  preferred_cuisines: string[];
  dietary_restrictions: string[];
  budget_range?: PriceRange;
  preferred_services: ServiceType[];
  home_latitude?: number;
  home_longitude?: number;
  max_distance_km: number;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  price_range: PriceRange;
  services_offered: ServiceType[];
  cover_image_url?: string;
  business_permit_url?: string;
  status: BusinessStatus;
  rejection_reason?: string;
  avg_rating: number;
  review_count: number;
  view_count: number;
  is_active: boolean;
  cuisines: string[];
  dietary_options: string[];
  amenities: string[];
  distance_km?: number;
  created_at: string;
}

export interface RestaurantImage {
  id: string;
  restaurant_id: string;
  image_url: string;
  is_cover: boolean;
  sort_order: number;
}

export interface Attraction {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  dietary_tags: string[];
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  rating: number;
  comment?: string;
  owner_reply?: string;
  owner_reply_at?: string;
  status: 'visible' | 'flagged' | 'removed';
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
}

export interface Promotion {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  restaurant_slug?: string;
  title: string;
  description?: string;
  image_url?: string;
  discount_label?: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
}

export interface OperatingHour {
  id?: string;
  restaurant_id?: string;
  day_of_week: number; // 0=Sunday .. 6=Saturday
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface RecommendationResult {
  restaurant: Restaurant;
  score: number;
  scoreBreakdown: {
    cuisineMatch: number;
    budgetFit: number;
    proximity: number;
    dietaryMatch: number;
    rating: number;
  };
  reason: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: PageMeta;
}

export interface Cuisine {
  id: number;
  name: string;
  slug: string;
}
