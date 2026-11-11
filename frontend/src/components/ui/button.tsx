import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
	"inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-sm shadow-ink/20 hover:bg-ink-soft",
				destructive:
					"bg-red-600 text-white shadow-sm shadow-red-900/20 hover:bg-red-700",
				"destructive-soft":
					"bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
				outline:
					"border border-border bg-white/80 text-slate-700 shadow-xs hover:border-slate-300 hover:bg-white hover:text-slate-900",
				secondary:
					"bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900",
				ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
				link: "h-auto px-0 text-brand underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4",
				sm: "h-8 rounded-md px-3 text-[13px]",
				lg: "h-10 px-5",
				icon: "size-9",
				"icon-sm": "size-8 rounded-md",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
