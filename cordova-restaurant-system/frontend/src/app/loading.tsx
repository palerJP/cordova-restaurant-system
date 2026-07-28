import { RestaurantGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <div className="skeleton h-9 w-64 mb-6" />
      <RestaurantGridSkeleton count={6} />
    </div>
  );
}
