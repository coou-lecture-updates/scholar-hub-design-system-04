import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarMenuProps {
  items: Array<{
    name: string;
    icon: React.ReactNode;
    path: string;
  }>;
  className?: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ items, className }) => {
  const location = useLocation();

  // Remove any announcement and role management items, and fix dashboard paths
  const processedItems = items
    .filter(
      (item) =>
        !item.name.toLowerCase().includes("announcement") &&
        !item.name.toLowerCase().includes("role management")
    )
    .map((item) => {
      if (
        item.name.toLowerCase().includes("dashboard") &&
        (item.path === "/admin" || item.path === "/admin-dashboard")
      ) {
        return { ...item, path: "/admin-dashboard" };
      }
      // Fix: Ensure "System Settings" path always correct
      if (
        item.name.toLowerCase().includes("settings") &&
        item.path !== "/admin/settings"
      ) {
        return { ...item, path: "/admin/settings" };
      }
      return item;
    });

  return (
    <nav className={cn("space-y-1", className)}>
      {processedItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out",
            "hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:shadow-sm",
            "active:scale-[0.98] active:transition-transform active:duration-75",
            location.pathname === item.path
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-200"
              : "text-gray-700 hover:text-purple-700"
          )}
        >
          <div className={cn(
            "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
            location.pathname === item.path ? "text-white" : "text-gray-500 group-hover:text-purple-600"
          )}>
            {item.icon}
          </div>
          <span className="truncate font-medium tracking-wide">
            {item.name}
          </span>
          {location.pathname === item.path && (
            <div className="ml-auto h-2 w-2 rounded-full bg-white shadow-sm animate-pulse" />
          )}
        </Link>
      ))}
    </nav>
  );
};

export default SidebarMenu;
