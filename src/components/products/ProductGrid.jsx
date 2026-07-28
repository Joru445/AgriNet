import ProductCard from "./ProductCard";
import EmptyProducts from "./EmptyProducts";

export default function ProductGrid({ products, view, onEdit, onDelete }) {
  if (!products.length) {
    return <EmptyProducts />;
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            view="list"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          view="grid"
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
