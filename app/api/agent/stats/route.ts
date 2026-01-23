import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import DeliveryTour from "@/models/DeliveryTour";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { ShipmentStatus, TourStatus, InvoiceStatus, UserRole } from "@/types";

export const GET = withAuth(async (session) => {
    try {
        await connectDB();

        const [
            totalShipments,
            pendingShipments,
            deliveredToday,
            activeTours,
            pendingInvoices,
            totalRevenue
        ] = await Promise.all([
            Shipment.countDocuments(),
            Shipment.countDocuments({ status: ShipmentStatus.PENDING }),
            Shipment.countDocuments({ 
                status: ShipmentStatus.DELIVERED,
                updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            DeliveryTour.countDocuments({ status: TourStatus.IN_PROGRESS }),
            Invoice.countDocuments({ status: InvoiceStatus.PENDING }),
            Invoice.aggregate([
                { $match: { status: InvoiceStatus.PAID } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        return NextResponse.json({
            shipments: {
                total: totalShipments,
                pending: pendingShipments,
                deliveredToday: deliveredToday
            },
            tours: {
                active: activeTours
            },
            invoices: {
                pending: pendingInvoices,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}, { roles: [UserRole.AGENT, UserRole.ADMIN] });
