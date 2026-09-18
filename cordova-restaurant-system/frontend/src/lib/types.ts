export type UserRole = 'customer' | 'owner' | 'admin';
export type PriceRange = 'budget' | 'moderate' | 'expensive' | 'premium';
export type ServiceType = 'dine_in' | 'takeout' | 'delivery';
export type BusinessStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type SubscriptionTier = 'none' | 'basic' | 'premium' | 'featured';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  accepts_marketing?: boolean;
  email_verified?: boolean;
  email_verified_at?: string | null;
  google_id?: string | null;
  facebook_id?: string | null;
  has_password?: boolean;
  preferences?: Record<string, any>;
  last_login_at?: string | null;
  created_at: string;
  // password_hash is stripped on the backend — never sent to client
}

export interface UserPreferences {
  preferred_cuisines: string[];
  dietary_restrictions: string[];
  budget_range?: PriceRange;
  preferred_services: string[];
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
  hours?: string;
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
  is_open?: boolean;
  category?: 'Fast Food' | 'Restaurant' | 'Cafe' | 'Street Food' | 'Resto Bar' | 'Pizza';
  subscription_tier?: SubscriptionTier;
  subscription_expires_at?: string;
  subscription_boost?: number;
  relevance_score?: number;
  final_score?: number;
  isSponsored?: boolean;
  matched_menu_items?: MenuItem[];
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
  dietary_tags?: string[];
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  rating: number;
  comment?: string;
  photos?: string[];
  reactions?: Record<string, number>;
  owner_reply?: string;
  owner_reply_at?: string;
  status: 'visible' | 'flagged' | 'removed';
  created_at: string;
  like_count: number;
  liked_by_me: boolean;
  visit_type?: string;
}

export interface Promotion {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  restaurant_slug?: string;
  restaurant_cover?: string;
  title: string;
  description?: string;
  image_url?: string;
  discount_label?: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
  payment_method?: 'gcash' | 'maya' | string;
  payment_reference?: string;
  payment_status?: 'pending_verification' | 'verified' | 'rejected' | string;
  created_at?: string;
}

export interface SubscriptionTransaction {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  restaurant_slug?: string;
  restaurant_cover?: string;
  tier: string;
  price: string;
  payment_method: 'gcash' | 'maya' | string;
  payment_reference: string;
  status: 'pending_verification' | 'verified' | 'rejected' | string;
  created_at: string;
  verified_at?: string;
  expires_at?: string;
  duration_days?: number;
  current_restaurant_tier?: string;
  current_restaurant_expires_at?: string;
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
