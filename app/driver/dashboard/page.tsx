import { auth } from "@/lib/auth/auth";
import { DriverDashboardContent } from "@/components/driver/DriverDashboard";

export default async function DriverDashboard() {
    const session = await auth();

    return <DriverDashboardContent session={session} />;
}
