import NavLinks from './nav-links';

export default function SideNav() {
  return (
    <nav className="w-[270px] min-h-[100vh] max-h-screen bg-white shadow-lg flex flex-col">
      <div className="p-4 flex flex-col h-full">
        
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="w-12 h-12 bg-[#d9d9d9] rounded-full" />
          <div className="flex flex-col">
            <div className="text-[#5d7285] text-sm font-semibold">Naufal Eka Prasetya</div>
            <div className="flex items-center mt-1">
              <div className="bg-[#2e3105]  rounded-full px-3 pb-0.5">
                <span className="text-white text-xs font-semibold">Staff</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#767676]/30 mb-3" />

        <div className="flex-grow overflow-y-auto text-sm">
          <NavLinks />
        </div>

        <button className="w-full mt-4 bg-[#667a8a] text-white py-3 rounded flex items-center justify-center gap-2 hover:bg-[#556779]">
          <span className="icon-logout" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </nav>
  )
}

function NavItem({ icon, label, isActive = false }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded ${isActive ? 'bg-[#eff0c3] text-[#52570d]' : 'text-[#5d7285]'}`}>
      <span className={icon} />
      <span className="font-medium">{label}</span>
    </div>
  )
}

function SubNavItem({ label }) {
  return (
    <div className="ml-12 text-[#5d7285] py-2">
      {label}
    </div>
  )
}