"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
interface DebouncedInputProps
	extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
	value: string | number;
	onChange: (value: string) => void;
	debounce?: number;
}
export const DebouncedInput: React.FC<DebouncedInputProps> = ({
	value,
	onChange,
	debounce = 500,
	...props
}) => {
	const [innerValue, setInnerValue] = useState<string | number>(value ?? "");
	useEffect(() => {
		setInnerValue(value ?? "");
	}, [value]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (String(innerValue) !== String(value ?? "")) {
				onChange(String(innerValue));
			}
		}, debounce);
		return () => clearTimeout(timer);
	}, [innerValue, debounce, onChange, value]);

	return (
		<Input
			{...props}
			value={innerValue}
			onChange={(e) => setInnerValue(e.target.value)}
			className="bg-gradient-to-br from-indigo-100 via-indigo-50 to-indigo-100 "
		/>
	);
};
