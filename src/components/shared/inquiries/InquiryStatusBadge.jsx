export default function InquiryStatusBadge({ status }) {
  const styles = {
    accepted: "bg-amber-100 text-amber-700 font-semibold",

    ongoing: "bg-blue-100 text-blue-700 font-semibold",

    awaiting_proof: "bg-blue-100 text-blue-700 font-semibold",

    proof_submitted: "bg-orange-100 text-orange-700 font-semibold",

    completed: "bg-green-100 text-green-700 font-semibold",

    cancelled: "bg-gray-100 text-gray-600 font-semibold",
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
      className={`rounded-full px-2.5 py-1 text-xs ${
        styles[status] || "bg-gray-100 text-gray-600 font-semibold"
      }`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
}
