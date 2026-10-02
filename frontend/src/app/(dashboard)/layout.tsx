import DahboardLayout from "@/components/layouts/dashboard-layout/_dashboard-layout";
export default function DashboardGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DahboardLayout>{children}</DahboardLayout>;
}
