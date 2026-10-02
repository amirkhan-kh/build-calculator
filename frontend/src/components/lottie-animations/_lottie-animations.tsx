"use client";

import Lottie from "lottie-react";

import { LottieAnimationProps } from "@/types/lottie.types";

export function LottieAnimation({
	animationData,
	className = "",
	style,
	loop = true,
	autoplay = true,
	width = "100%",
	height = "100%",
	onComplete,
}: LottieAnimationProps) {
	return (
		<div className={className} style={{ width, height, ...style }}>
			<Lottie
				animationData={animationData}
				loop={loop}
				autoplay={autoplay}
				onComplete={onComplete}
			/>
		</div>
	);
}
