"use client";

import { forwardRef, ImgHTMLAttributes, HTMLAttributes } from "react";
import { cn, initials } from "@/lib/utils";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fallback?: React.ReactNode;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
  "2xl": "h-24 w-24 text-2xl",
};

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, name, size = "md", src, fallback, alt, ...props }, ref) => {
    const showFallback = !src || fallback;

    return (
      <div
        className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted-100", sizeClasses[size], className)}
        {...props}
      >
        {showFallback ? (
          fallback || (
            <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-700 font-medium">
              {name ? initials(name) : "?"}
            </div>
          )
        ) : (
          <img
            ref={ref}
            src={src}
            alt={alt || name || "Avatar"}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: keyof typeof sizeClasses;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 5, size = "md", children, ...props }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children];
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div ref={ref} className={cn("flex -space-x-2", className)} {...props}>
        {visibleChildren.map((child, index) => (
          <div key={index} className="relative z-[auto]">
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-muted-100 border-2 border-white",
              sizeClasses[size],
              "text-muted-600 font-medium"
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";
