import React, { memo, ReactNode } from "react";

interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<main className="mx-auto w-full max-w-[1680px] px-3 pb-12 pt-5 sm:px-6">
			{children}
		</main>
	);
};

export default memo(MainLayout);
