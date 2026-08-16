export default function InquiryStatusBadge({ status }) {
  const styles = {
    accepted: "bg-amber-100 text-amber-700",

    ongoing: "bg-blue-100 text-blue-700",

    awaiting_proof: "bg-blue-100 text-blue-700",

    proof_submitted: "bg-blue-100 text-blue-700",

    completed: "bg-green-100 text-green-700",

    cancelled: "bg-gray-100 text-gray-600",
  };

  const labels = {
    accepted: "Accepted",
    ongoing: "Ongoing",
    awaiting_proof: "Awaiting Proof",
    proof_submitted: "Proof Submitted",
    completed: "Completed",

    cancelled: "Cancelled",
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
