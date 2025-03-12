'use client';

import Header from '@/components/layout/header';
import SideNav from '@/components/owner/navigation/sidenav';
import { useState } from 'react';

export default function Layout({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed header */}
      <div className="flex-none">
        <Header isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </div>
      
      {/* Main content area with fixed sidenav */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidenav */}
        <div className="flex-none">
          <SideNav isExpanded={isExpanded} />
        </div>
        
        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}