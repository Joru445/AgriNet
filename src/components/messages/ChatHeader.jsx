import defaultAvatar from "../../assets/img/defaultAvatar.png"

export default function ChatHeader({ user }) {
  if (!user) return null;

  return (
    <header className="w-full h-18 absolute border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={user.profilePicture || defaultAvatar}
          alt={user.fullname}
          className="w-11 h-11 rounded-full object-cover"
        />

        <div>
          <h3 className="font-semibold text-gray-900">
            {user.fullname}
          </h3>

          <p className="text-sm text-gray-500">
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
