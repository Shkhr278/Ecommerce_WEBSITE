import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn - className helper that composes clsx -> twMerge
 * Usage: cn("p-4", condition && "text-sm", someVar)
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
