import React from 'react';
import { HiUsers, HiOfficeBuilding, HiDocumentText } from 'react-icons/hi';

interface SidebarProps {
  onSelect: (section: SidebarSection) => void;
  selected: SidebarSection;
}

export type SidebarSection = 'users' | 'units' | 'forms';

const items = [
  { key: 'users', label: 'Kullanıcılar', icon: <HiUsers /> },
  { key: 'units', label: 'Birimler', icon: <HiOfficeBuilding /> },
  { key: 'forms', label: 'Formlar', icon: <HiDocumentText /> },
];


const Sidebar: React.FC<SidebarProps> = ({ onSelect, selected }) => (
  <aside className="h-full w-64 bg-gradient-to-b from-blue-800 via-blue-600 to-indigo-700 text-white flex flex-col py-8 px-4 shadow-2xl rounded-r-3xl relative">
    {/* Logo ve başlık */}
    <div className="mb-10 flex flex-col items-center select-none">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg mb-2">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.15"/><path d="M7 17l5-5 5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 7h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <div className="text-2xl font-black tracking-wide text-center drop-shadow-lg">Saha Asistan</div>
      <div className="text-xs text-blue-200 mt-1 tracking-widest">Yönetim Paneli</div>
    </div>
    {/* Menü */}
    <nav className="flex-1 flex flex-col gap-2">
      {items.map(item => (
        <button
          key={item.key}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-lg font-semibold transition-all duration-200 hover:bg-blue-900/70 focus:outline-none focus:ring-2 focus:ring-blue-300/40 ${selected === item.key ? 'bg-white/10 shadow-lg ring-2 ring-white/30 scale-[1.04]' : ''}`}
          onClick={() => onSelect(item.key as SidebarSection)}
        >
          <span className={`text-2xl ${selected === item.key ? 'text-yellow-300 drop-shadow' : 'text-blue-100'}`}>{item.icon}</span>
          <span className="tracking-wide">{item.label}</span>
        </button>
      ))}
    </nav>
    {/* Alt profil ve copyright */}
    <div className="mt-10 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow">
          <span>S</span>
        </div>
        <span className="text-sm text-blue-100 font-semibold">Superadmin</span>
      </div>
      <div className="text-xs text-blue-200 text-center select-none">© {new Date().getFullYear()} <span className="font-bold text-white/80">Saha Asistan</span></div>
    </div>
  </aside>
);

export default Sidebar;
