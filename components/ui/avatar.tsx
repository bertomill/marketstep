"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar-base"
import { cn } from "@/lib/utils"

interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  user?: {
    firstName?: string;
    lastName?: string;
    photoURL?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-xl',
};

export function UserAvatar({ user, size = 'md', className, ...props }: UserAvatarProps) {
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '?';

  return (
    <Avatar 
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {user?.photoURL ? (
        <AvatarImage
          src={user.photoURL}
          alt={`${user.firstName} ${user.lastName}`}
          className="aspect-square h-full w-full"
        />
      ) : (
        <AvatarFallback className="bg-blue-600 text-white">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
} 