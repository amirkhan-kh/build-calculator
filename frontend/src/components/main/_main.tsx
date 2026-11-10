import React, { memo, ReactNode } from "react";

interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<div className="mx-auto w-full max-w-[1400px] px-4 min-h-screen">
			{children}
		</div>
	);
};

export default memo(MainLayout);
