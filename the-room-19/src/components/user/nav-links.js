'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
const links = [
  { 
    name: 'Dashboard',
    href: '/user/dashboard',
    icon: 'dashboard-icon'
  },
  {
    name: 'Reservation',
    href: '/staff/dashboard/reservation',
    icon: 'reservation-icon',
    subLinks: [
      { name: 'Reserve a place', href: '/staff/dashboard/reservation/place' },
      { name: 'Reserve an activity', href: '/staff/dashboard/reservation/activity' }
    ]
  },
  {
    name: 'Book Loan',
    href: '/staff/dashboard/book-loan',
    icon: 'book-icon',
    subLinks: [
      { name: 'Loan Management', href: '/staff/dashboard/book-loan/management' }
    ]
  },
  {
    name: 'Attendance',
    href: '/staff/dashboard/attendance',
    icon: 'attendance-icon'
  },
  {
    name: 'Membership',
    href: '/staff/dashboard/membership',
    icon: 'membership-icon'
  },
  {
    name: 'Inventory',
    href: '/staff/dashboard/inventory',
    icon: 'inventory-icon'
  },
  {
    name: 'Settings',
    href: '/staff/dashboard/settings',
    icon: 'settings-icon'
  }
];

function NavItem({ href, icon, label, isActive = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded ${
        isActive ? 'bg-[#eff0c3] text-[#52570d]' : 'text-[#5d7285]'
      }`}
    >
      <span className={icon} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function SubNavItem({ href, label }) {
  return (
    <Link href={href} className="ml-12 text-[#5d7285] py-2 block">
      {label}
    </Link>
  );
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col space-y-2">
      {links.map((link) => (
        <div key={link.name}>
          <NavItem
            href={link.href}
            icon={link.icon}
            label={link.name}
            isActive={pathname === link.href}
          />
          {link.subLinks?.map((subLink) => (
            <SubNavItem
              key={subLink.name}
              href={subLink.href}
              label={subLink.name}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
