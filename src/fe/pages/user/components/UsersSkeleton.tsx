import { memo } from "react";
import { Skeleton } from "@/components/ui/Component";

interface UsersSkeletonProps {
  rows?: number;
}

const UsersSkeleton = memo(({ rows = 12 }: UsersSkeletonProps) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Avatar skeleton */}
                <Skeleton
                  variant="rectangular"
                  width={64}
                  height={64}
                  className="rounded-2xl shrink-0"
                />
                <div className="space-y-2">
                  {/* Name */}
                  <Skeleton variant="text" width={100} height={24} />
                  {/* Designation */}
                  <Skeleton variant="text" width={80} height={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-50 space-y-2">
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
              <div className="pt-2 space-y-2">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="50%" height={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex justify-center mt-8 gap-2">
        <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
        <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
        <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
      </div>
    </div>
  );
});

UsersSkeleton.displayName = "UsersSkeleton";

export default UsersSkeleton;
