import SideNav from '@/components/user/sidenav';
import Header from '@/components/user/header';
 
export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Fixed header */}
      <div className="flex-none">
        <Header />
      </div>
      
      {/* Main content area with fixed sidenav */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed sidenav */}
        <div className="flex-none">
          <SideNav />
        </div>
        
        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}