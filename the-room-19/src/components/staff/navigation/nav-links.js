"use client";

import { useState, useEffect } from 'react';
import { GoHomeFill } from 'react-icons/go';
import { IoIdCard } from 'react-icons/io5';
import { FaCalendarCheck, FaBook, FaCalendarPlus } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdInventory } from "react-icons/md";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

// Map of links to display in the side navigation for staff.
const links = [
  {
    name: "Dashboard",
    href: "/staff/dashboard",
    icon: GoHomeFill,
  },
  {
    name: "Attendance",
    href: "/staff/dashboard/attendance",
    icon: IoIdCard,
  },
  {
    name: "Monitoring",
    href: "/staff/dashboard/data-collection",
    icon: FaCalendarCheck,
  },
  {
    name: "Events",
    href: "/staff/dashboard/reservation/event-list",
    icon: FaCalendarPlus,
    
  },
  {
    name: 'Book Management',
    href: '/staff/dashboard/book-management',
    icon: FaBook,
    subLinks: [
      { name: "Catalog", href: "/staff/dashboard/book-management/catalog" },
      {
        name: "Categorization",
        href: "/staff/dashboard/book-management/genre-settings",
      },
    ],
  },
  {
    name: "Inventory",
    href: "/staff/dashboard/inventory",
    icon: MdInventory,
    subLinks: [
      { name: "Books", href: "/staff/dashboard/inventory/book" },
      { name: "Utilities", href: "/staff/dashboard/inventory/utility" },
    ],
  },
];

function NavItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  hasSubLinks,
  isExpanded,
  onToggle,
  collapsed = false,
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded cursor-pointer",
        {
          "bg-[#eff0c3] text-[#52570d]": isActive,
          "text-[#5d7285]": !isActive,
          "justify-center": collapsed,
        },
        "hover:bg-gray-100 transition-colors duration-100"
      )}
      onClick={hasSubLinks ? onToggle : undefined}
    >
      <Icon size={18} />
      {!collapsed && (
        <div className="flex items-center justify-between flex-grow">
          <span className="font-medium">{label}</span>
          {hasSubLinks && (
            <MdKeyboardArrowDown
              size={20}
              className={clsx("transition-transform duration-300", {
                "rotate-180": isExpanded,
              })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SubNavItem({ href, label }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={clsx(
        "ml-7 py-2 px-3 block rounded",
        {
          "text-[#52570d]": pathname === href,
          "text-[#5d7285]": pathname !== href,
        },
        "hover:bg-gray-100 transition-colors duration-100"
      )}
    >
      {label}
    </Link>
  );
}

function SubNavLinks({ subLinks, isExpanded }) {
  return (
    <div
      className={clsx(
        "overflow-hidden transition-all duration-300 ease-in-out",
        {
          "max-h-0": !isExpanded,
          "max-h-[500px]": isExpanded, // Adjust this value based on your content
        }
      )}
    >
      {subLinks?.map((subLink) => (
        <SubNavItem
          key={subLink.name}
          href={subLink.href}
          label={subLink.name}
        />
      ))}
    </div>
  );
}

export default function NavLinks({ collapsed = false }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  useEffect(() => {
    const activeLink = links.find((link) =>
      link.subLinks?.some((sub) => sub.href === pathname)
    );
    if (activeLink) {
      setExpandedItems((prev) => ({
        ...prev,
        [activeLink.name]: true,
      }));
    }
  }, [pathname]);

  return (
    <div className="flex flex-col space-y-2">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.subLinks && link.subLinks.some((sub) => sub.href === pathname));

        return (
          <div key={link.name}>
            {link.name === "Dashboard" || !link.subLinks ? (
              <Link href={link.href}>
                <NavItem
                  icon={link.icon}
                  label={link.name}
                  isActive={isActive}
                  collapsed={collapsed}
                />
              </Link>
            ) : (
              <NavItem
                href={link.href}
                icon={link.icon}
                label={link.name}
                isActive={isActive}
                hasSubLinks={!collapsed && !!link.subLinks?.length}
                isExpanded={expandedItems[link.name]}
                onToggle={() => toggleExpand(link.name)}
                collapsed={collapsed}
              />
            )}
            {!collapsed && (
              <SubNavLinks
                subLinks={link.subLinks}
                isExpanded={expandedItems[link.name]}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
