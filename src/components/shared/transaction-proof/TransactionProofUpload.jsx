import { useRef } from "react";

export default function TransactionProofUpload({
  selectedFile,
  previewUrl,
  processing,
  rejected,
  onSelectFile,
  onRemoveFile,
  onSubmit,
}) {
  const inputRef = useRef(null);

  function handleChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      onSelectFile(file);
    }

    event.target.value = "";
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-gray-900">
          Upload transaction proof
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Upload a clear photo showing the product you received.
        </p>
      </div>

      {rejected && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex gap-2">
            <i className="ri-error-warning-line text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Previous proof was rejected.
              </p>

              <p className="mt-1 text-xs text-red-600">
                Please upload another photo.
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="
            mt-5 flex min-h-56 w-full
            flex-col items-center justify-center
            rounded-xl border-2 border-dashed
            border-gray-200 bg-gray-50
            text-gray-500 transition
            hover:border-[#2D6A4F]
            hover:bg-green-50/30
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <i className="ri-image-add-line text-3xl" />

          <span className="mt-3 text-sm font-semibold text-gray-700">
            Upload proof image
          </span>

          <span className="mt-1 text-xs text-gray-400">
            JPG, PNG, or WEBP up to 10 MB
          </span>
        </button>
      ) : (
        <div className="mt-5">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img
              src={previewUrl}
              alt="Transaction proof preview"
              className="max-h-[500px] w-full object-contain"
            />
          </div>

          {selectedFile && (
            <p className="mt-2 truncate text-xs text-gray-400">
              {selectedFile.name}
            </p>
          )}

          <button
            type="button"
            onClick={onRemoveFile}
            disabled={processing}
            className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Remove image
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={processing || !selectedFile}
        className="
          mt-5 w-full rounded-xl
          bg-[#2D6A4F]
          px-4 py-3
          text-sm font-semibold text-white
          transition hover:bg-[#24583F]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {processing ? "Uploading..." : "Submit Proof"}
      </button>
    </section>
  );
}
