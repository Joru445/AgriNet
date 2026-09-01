export default function ReviewEmpty({ type = "product" }) {
  const isProduct = type === "product";

  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--agri-hover)]">
        <i
          className={
            isProduct
              ? "ri-shopping-bag-3-line text-xl text-[var(--agri-text-muted)]"
              : "ri-user-star-line text-xl text-[var(--agri-text-muted)]"
          }
        />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-[var(--agri-text-secondary)]">
        No reviews yet
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--agri-text-muted)]">
        {isProduct
          ? "This product has not received any reviews yet."
          : "This farmer has not received any reviews yet."}
      </p>
    </div>
  );
}
