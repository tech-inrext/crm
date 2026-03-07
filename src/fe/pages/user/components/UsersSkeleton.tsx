import { memo } from "react";
import { Skeleton } from "@/components/ui/Component";

interface UsersSkeletonProps {
  isMobile?: boolean;
  rows?: number;
}

const UsersSkeleton = memo(
  ({ isMobile = false, rows = 10 }: UsersSkeletonProps) => {
    if (isMobile) {
      // Mobile card skeleton
      return (
        <div className="grid grid-cols-1 gap-3 mb-2">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                {/* Avatar skeleton */}
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  className="shrink-0"
                />
                <div className="flex-1">
                  {/* Name */}
                  <Skeleton variant="text" width="60%" height={24} />
                  {/* Email */}
                  <Skeleton variant="text" width="80%" height={20} />
                  {/* Designation */}
                  <Skeleton variant="text" width="40%" height={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Desktop table skeleton
    return (
      <div className="w-full">
        <div className="rounded-xl overflow-hidden shadow-lg bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table header skeleton */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <th key={index} className="px-6 py-4 text-left">
                      <Skeleton variant="text" width="80%" height={20} />
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Table body skeleton */}
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {colIndex === 4 ? (
                          // Action buttons skeleton
                          <div className="flex gap-2">
                            <Skeleton
                              variant="rectangular"
                              width={32}
                              height={32}
                              className="rounded"
                            />
                            <Skeleton
                              variant="rectangular"
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          </div>
                        ) : (
                          <Skeleton
                            variant="text"
                            width={colIndex === 0 ? "70%" : "85%"}
                            height={20}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination skeleton */}
        <div className="flex justify-center mt-4 gap-2">
          <Skeleton
            variant="rectangular"
            width={80}
            height={36}
            className="rounded"
          />
          <Skeleton
            variant="rectangular"
            width={200}
            height={36}
            className="rounded"
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={36}
            className="rounded"
          />
        </div>
      </div>
    );
  },
);

UsersSkeleton.displayName = "UsersSkeleton";

export default UsersSkeleton;
