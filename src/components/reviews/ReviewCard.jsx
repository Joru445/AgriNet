import defaultAvatar from "../../assets/img/defaultAvatar.png";

import RatingStars from "./RatingStars";

export default function ReviewCard({ review }) {
  const reviewer = review.reviewer ?? {};

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex gap-4">
        <img
          src={reviewer.profilePicture || defaultAvatar}
          alt={reviewer.fullname}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{reviewer.fullname}</h3>

              <p className="text-xs text-gray-500">@{reviewer.username}</p>
            </div>

            <RatingStars rating={review.rating} />
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}
