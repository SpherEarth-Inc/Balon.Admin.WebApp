import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClass = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

export function Spinner({ className, size = "md", label = "Loading" }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-brand-green", sizeClass[size], className)}
      aria-label={label}
      role="status"
    />
  );
}

type PageSpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

/** Centered green spinner for full-page or section loading states. */
export function PageSpinner({ className, size = "lg" }: PageSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center py-12", className)}
      role="status"
      aria-label="Loading"
    >
      <Spinner size={size} />
    </div>
  );
}
