'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import {
  LayoutDashboard, Users, Sprout, ShoppingBag, Bug, Droplets,
  LogOut, Leaf, Settings, ChevronRight
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/labour', label: 'Labour', icon: Users },
  { href: '/production', label: 'Leaf Production', icon: Sprout },
  { href: '/buyers', label: 'Buyers', icon: ShoppingBag },
  { href: '/crop-health/pest', label: 'Pest Reports', icon: Bug },
  { href: '/crop-health/irrigation', label: 'Irrigation', icon: Droplets },
];

const ownerItems = [
  { href: '/settings/users', label: 'Manage Users', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isOwner } = useAuth();

  return (
    <aside className="w-64 min-h-full bg-tea-900 flex flex-col">
      {/* Brand */}
      <div className="px-4 py-6 border-b border-tea-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-tea-600 shadow-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm font-serif leading-tight">SDM Tea Group</p>
            <p className="text-tea-400 text-xs">LLP – Sultanicherra</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-tea-500 text-xs uppercase font-semibold tracking-wider px-4 py-2">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}

        {isOwner && ownerItems.length > 0 && (
          <>
            <p className="text-tea-500 text-xs uppercase font-semibold tracking-wider px-4 py-2 pt-5">Admin</p>
            {ownerItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-tea-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-tea-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-tea-400 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-tea-300 hover:text-red-400 hover:bg-tea-800 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
