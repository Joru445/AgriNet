import { useNavigate } from "react-router-dom";

import all from "../../../assets/categories/all.webp";
import vegetables from "../../../assets/categories/vegetables.webp";
import fruits from "../../../assets/categories/fruits.webp";
import grains from "../../../assets/categories/grains.webp";
import livestocks from "../../../assets/categories/livestocks.webp";
import poultry from "../../../assets/categories/poultry.webp";
import herbs from "../../../assets/categories/herbs.webp";
import rootCrops from "../../../assets/categories/root-crops.webp";

const categories = [
  {
    id: "All",
    label: "All Produce",
    image: all,
  },
  {
    id: "Vegetables",
    label: "Vegetables",
    image: vegetables,
  },
  {
    id: "Fruits",
    label: "Fruits",
    image: fruits,
  },
  {
    id: "Grains",
    label: "Grains & Rice",
    image: grains,
  },
  {
    id: "Livestock",
    label: "Livestock",
    image: livestocks,
  },
  {
    id: "Poultry",
    label: "Poultry",
    image: poultry,
  },
  {
    id: "Herbs",
    label: "Herbs",
    image: herbs,
  },
  {
    id: "Root Crops",
    label: "Root Crops",
    image: rootCrops,
  },
];

export default function CategoryChips({ value = "All", onChange }) {
  const navigate = useNavigate();

  function handleCategoryChange(category) {
    // Marketplace page
    if (onChange) {
      onChange(category);
      return;
    }

    // Home page
    const params = new URLSearchParams();

    if (category !== "All") {
      params.set("category", category);
    }

    navigate(
      params.toString()
        ? `/marketplace?${params.toString()}`
        : "/marketplace",
    );
  }

  return (
    <div className="w-full flex items-center justify-start lg:justify-center gap-3 overflow-x-auto px-2 py-2 scrollbar-none">
      {categories.map((cat) => {
        const active = value === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`
              relative
              isolate
              flex
              h-24
              min-w-24
              sm:h-32
              sm:min-w-32
              shrink-0
              items-end
              overflow-hidden
              rounded-2xl
              px-3
              py-2.5
              text-xs
              sm:text-sm
              font-bold
              whitespace-nowrap
              transition-all
              duration-200
              cursor-pointer
              shadow-sm
              ${active
                ? "ring-2 ring-[#2D6A4F] ring-offset-2 scale-[1.02]"
                : "hover:scale-[1.02] hover:shadow-md"
              }
            `}
          >
            {/* Background Image */}
            <img
              src={cat.image}
              alt=""
              loading="lazy"
              aria-hidden="true"
              className="
                absolute
                inset-0
                -z-20
                h-full
                w-full
                object-cover
                transition-transform
                duration-300
                group-hover:scale-105
              "
            />

            {/* Dark gradient */}
            <div
              className={`
                absolute
                inset-0
                -z-10
                bg-gradient-to-t
                from-black/75
                via-black/20
                to-transparent
                transition-opacity
                ${active ? "opacity-90" : "opacity-80"}
              `}
            />

            {/* Active overlay */}
            {active && (
              <div className="absolute inset-0 -z-10 bg-[#1B4332]/25" />
            )}

            {/* Label */}
            <span className="relative z-10 text-left leading-tight text-white drop-shadow-md">
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}