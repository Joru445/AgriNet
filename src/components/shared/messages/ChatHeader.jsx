import Avatar from "../../common/Avatar"
import BackButton from "../../common/BackButton";

export default function ChatHeader({ user }) {
  if (!user) return null;

  return (
    <header
      className="w-full h-16 sm:h-18 shrink-0 border-b px-4 sm:px-6 flex items-center justify-between shadow-xs z-10"
      style={{ backgroundColor: 'rgba(247,250,248,0.97)', borderColor: 'var(--agri-border)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center gap-3">
        <BackButton className="flex sm:hidden" />

        <Avatar src={user.profilePicture} name={user.fullname} />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.fullname}
            </h3>
            {user.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-base"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 truncate">
            @{user.username}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-xl hover:bg-gray-100 transition">
          <i className="ri-more-2-fill text-lg" />
        </button>
      </div>
    </header>
  );
}
