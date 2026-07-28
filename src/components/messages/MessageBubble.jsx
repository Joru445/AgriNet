import { useAuth } from "../../context/AuthContext";

import defaultAvatar from "../../assets/img/defaultAvatar.png"

export default function MessageBubble({ user, message }) {
  const { profile } = useAuth();

  const mine = message.senderId === profile.uid;

  return (
    <div className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      <img
        src={user.profilePicture || defaultAvatar}
        alt={user.fullname}
        className={`w-10 h-10 rounded-full object-cover ${mine ? "hidden" : "flex"}`}
      />
      <div
        className={`max-w-[75%] rounded-3xl px-4 py-2 shadow-sm ${
          mine
            ? "bg-[#2D6A4F] text-white"
            : "bg-white text-gray-800 border"
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
}
