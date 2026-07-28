import { NavLink } from "react-router-dom";

export default function BottomNavigation({ items }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex h-16">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center ${
                isActive ? "text-[#2D6A4F] font-bold" : "text-gray-500"
              }`
            }
          >
            <i className={`${item.icon} text-lg`} />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
