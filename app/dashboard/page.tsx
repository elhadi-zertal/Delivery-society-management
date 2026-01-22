import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (session?.user?.role === "admin") {
        redirect("/admin/dashboard");
    } else if (session?.user?.role === "agent") {
        redirect("/agent/dashboard");
    } else if (session?.user?.role === "driver") {
        redirect("/driver/dashboard");
    }

    return (
        <div className="p-10">Redirecting...</div>
    )
}
