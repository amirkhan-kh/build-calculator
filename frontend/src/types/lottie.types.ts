import { CSSProperties } from "react";
export interface LottieAnimationProps {
	animationData: null | object;
	className?: string;
	style?: CSSProperties;
	loop?: boolean;
	autoplay?: boolean;
	width?: number | string;
	height?: number | string;
	speed?: number;
	onComplete?: () => void;
}
