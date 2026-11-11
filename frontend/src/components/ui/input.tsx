import { cn } from "@/lib/cn";
import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-slate-900 shadow-xs transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
					"file:-ml-1 file:mr-3 file:mt-[7px] file:h-6 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
