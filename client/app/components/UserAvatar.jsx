import React from 'react';
import { User } from 'lucide-react';

export const UserAvatar = ({ name, email, avatar, size = 'md', className = '' }) => {
  const getInitials = (fullName, emailAddress) => {
    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (emailAddress) {
      return emailAddress.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const initials = getInitials(name, email);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base font-semibold',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (avatar && avatar.trim()) {
    return (
      <img
        src={avatar}
        alt={name || 'User avatar'}
        className={`${currentSize} rounded-full object-cover border border-gray-200/80 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${currentSize} rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold tracking-tight uppercase shrink-0 border border-brand-200/50 ${className}`}
      title={name || email || 'User'}
    >
      {initials}
    </div>
  );
};

