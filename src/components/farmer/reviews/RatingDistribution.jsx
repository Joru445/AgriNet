import { useLanguage } from "../../../context/LanguageContext";
import RatingBar from "./RatingBar";

export default function RatingDistribution({ distribution, getPercentage }) {
  const { t } = useLanguage();

  return (
    <div className="bg-[var(--agri-card)] rounded-2xl border border-[var(--agri-border)] p-6 space-y-4">
      <h3 className="font-semibold text-lg">{t("farmer.ratingBreakdown")}</h3>

      {[5, 4, 3, 2, 1].map((stars) => (
        <RatingBar
          key={stars}
          stars={stars}
          count={distribution[stars]}
          percentage={getPercentage(stars)}
        />
      ))}
    </div>
  );
}
