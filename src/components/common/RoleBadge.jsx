function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "Admin";

    case "farmer":
      return "Farmer";

    case "consumer":
      return "Consumer";

    default:
      return role || "Unknown";
  }
}

function getRoleClasses(role) {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";

    case "farmer":
      return "bg-green-100 text-green-700";

    case "consumer":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRoleClasses(
        role,
      )}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
