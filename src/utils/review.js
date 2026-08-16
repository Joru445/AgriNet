export function isValidRating(rating) {
  const value = Number(rating);

  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function normalizeRating(rating) {
  const value = Number(rating);

  if (!isValidRating(value)) {
    throw new Error("Rating must be between 1 and 5.");
  }

  return value;
}

export function normalizeReviewComment(comment) {
  return String(comment ?? "").trim();
}

export function getRatingLabel(rating) {
  switch (Number(rating)) {
    case 1:
      return "Very poor";

    case 2:
      return "Poor";

    case 3:
      return "Average";

    case 4:
      return "Good";

    case 5:
      return "Excellent";

    default:
      return "";
  }
}

export function canReviewInquiry(inquiry) {
  return inquiry?.status === "completed" && inquiry?.reviewed !== true;
}

export function hasInquiryBeenReviewed(inquiry) {
  return inquiry?.reviewed === true;
}
