import { Link } from "react-router-dom";

const notificationIcons = {
  inquiry: "ri-question-answer-line",
  message: "ri-message-3-line",
  transaction: "ri-shopping-bag-3-line",
  review: "ri-star-line",
  verification: "ri-shield-check-line",
  product: "ri-shopping-basket-line",
};

export default function NotificationItem({ notification }) {
  const icon = notificationIcons[notification.type] || "ri-notification-3-line";

  return (
    <Link
      to={notification.to || "/notifications"}
      className={`flex gap-4 rounded-2xl border p-4 transition ${
        !notification.read
          ? "border-[#2D6A4F]/20 bg-[#F3FAF6] hover:bg-[#EAF6EE]"
          : "border-gray-100 bg-white hover:bg-gray-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          !notification.read
            ? "bg-[#2D6A4F] text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        <i className={`${icon} text-lg`} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-gray-900">{notification.title}</h2>

          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2D6A4F]" />
          )}
        </div>

        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-gray-400">{notification.time}</p>
      </div>
    </Link>
  );
}
