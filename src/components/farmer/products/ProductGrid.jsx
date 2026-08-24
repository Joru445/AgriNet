import ProductCard from "./ProductCard";
import EmptyProducts from "./EmptyProducts";

export default function ProductGrid({ products, view, onAdd, onEdit, onDelete }) {
  if (!products.length) {
    return <EmptyProducts onAdd={onAdd} />;
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
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
