import SideNav from '@/components/staff/sidenav';
 
export default function Layout({ children }) {
  return (
    <div className="flex">
      <SideNav />
      {children}
    </div>
  );
}