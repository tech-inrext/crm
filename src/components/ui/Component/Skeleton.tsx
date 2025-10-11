import React from "react";
import Skeleton, { SkeletonProps } from "@mui/material/Skeleton";

interface SkeletonComponentProps extends SkeletonProps {
  children?: React.ReactNode;
}

const SkeletonComponent: React.FC<SkeletonComponentProps> = ({
  children,
  ...props
}) => {
  return <Skeleton {...props}>{children}</Skeleton>;
};

export default SkeletonComponent;