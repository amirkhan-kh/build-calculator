import * as React from "react";
import { cn } from "@/lib/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					"flex min-h-20 w-full resize-y rounded-lg border border-input bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
					className,
				)}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
