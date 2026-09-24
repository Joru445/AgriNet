import { useLanguage } from "../../../context/LanguageContext";
import Button from "../../ui/Button";
import Sheet from "../../ui/Sheet";

import FiltersSidebar from "./FiltersSidebar";

export default function MobileFiltersDrawer({
  open,
  filters,
  onChange,
  onReset,
  onClose,
}) {
  const { t } = useLanguage();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("nearby.filters")}
      maxWidth="max-w-full"
      bodyClassName="p-5"
      ariaLabel={t("nearby.filters")}
      footer={
        <Button variant="primary" size="md" fullWidth onClick={onClose}>
          {t("nearby.applyFilters")}
        </Button>
      }
    >
      <FiltersSidebar
        mobile
        filters={filters}
        onChange={onChange}
        onReset={onReset}
      />
    </Sheet>
  );
}