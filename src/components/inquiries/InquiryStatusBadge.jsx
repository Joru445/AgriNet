export default function InquiryStatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",

    ongoing: "bg-blue-100 text-blue-700",

    resolved: "bg-green-100 text-green-700",
  };

  const labels = {
    pending: "Pending",
    ongoing: "Ongoing",
    resolved: "Resolved",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
}
