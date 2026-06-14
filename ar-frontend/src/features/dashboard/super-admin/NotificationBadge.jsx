import { Bell } from "lucide-react";
import { cn } from "../../../shared/lib/utils";

export default function NotificationBadge({ count = 0 }) {
  return (
    <div className={cn(
      "relative inline-block",
      count > 0 && "animate-pulse"
    )}>
      <Bell size={20} className="text-muted-foreground" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}