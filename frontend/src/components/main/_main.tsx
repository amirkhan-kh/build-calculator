import React, { memo, ReactNode } from "react";

interface MainLayoutProps {
	children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return <div className="px-4 min-h-screen">{children}</div>;
};

export default memo(MainLayout);
