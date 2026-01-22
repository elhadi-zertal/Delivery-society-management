import { auth, signOut } from "@/lib/auth";

export default async function DriverDashboard() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-green-500">Driver Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span>{session?.user?.email}</span>
                    <form action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/signin-up" });
                    }}>
                        <button type="submit" className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition">Sign Out</button>
                    </form>
                </div>
            </div>
            <p className="text-gray-400">Welcome, Driver. View your routes and shipments.</p>
        </div>
    );
}
