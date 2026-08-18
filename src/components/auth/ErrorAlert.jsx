export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-xs text-red-600 font-medium flex items-center gap-2">
        <i className="ri-error-warning-line text-sm"></i>
        <span>{message}</span>
      </p>
    </div>
  );
}
