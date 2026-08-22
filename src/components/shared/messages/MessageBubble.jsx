import { useAuth } from "../../../context/AuthContext";

import Avatar from "../../common/Avatar"

export default function MessageBubble({ user, message }) {
  const { profile } = useAuth();

  const mine = message.senderId === profile.uid;

  return (
    <div className={`flex gap-2 ${mine ? "justify-end" : "justify-start"} min-w-0`}>
      <Avatar src={user.profilePicture} name={user.fullname} size="sm" className={`${mine ? "hidden" : "flex shrink-0"}`} />
      <div
        className={`max-w-[85%] sm:max-w-[75%] min-w-0 rounded-2xl px-4 py-2.5 ${
          mine
            ? "bg-[#2D6A4F] text-white shadow-md shadow-green-900/20"
            : "bg-white text-gray-800 shadow-md shadow-black/10"
        }`}
        style={!mine ? { border: '1px solid var(--agri-border)' } : {}}
      >
        <p className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
}
