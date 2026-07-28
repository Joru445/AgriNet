import { formatSeparator } from "../../utils/chat";

export default function MessageSeparator({ timestamp }) {
  return (
    <div className="flex justify-center items-center gap-3 my-5">

      <span className="text-xs text-gray-400 whitespace-nowrap">
        {formatSeparator(timestamp)}
      </span>

    </div>
  );
}
