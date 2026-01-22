import { connectDB } from '@/lib/db';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import Shipment from '@/models/Shipment';
import Client from '@/models/Client';
import DeliveryTour from '@/models/DeliveryTour';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';

/**
 * GET /api/search?q=query
 * Global search across multiple collections
 */
export const GET = withErrorHandler(async (req: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return successResponse({ shipments: [], clients: [], tours: [], drivers: [], vehicles: [], total: 0 });
    }

    const regex = new RegExp(query, 'i');
    const limit = 5;

    // Parallel search
    const [shipments, clients, tours, users, vehicles] = await Promise.all([
        Shipment.find({
            $or: [{ trackingNumber: regex }, { 'recipient.name': regex }]
        }).limit(limit).select('trackingNumber status recipient.name'),

        Client.find({
            $or: [{ companyName: regex }, { firstName: regex }, { lastName: regex }, { email: regex }]
        }).limit(limit).select('firstName lastName companyName email phone'),

        DeliveryTour.find({
            // Assuming tours have a reference or name, but often just ID. 
            // We can search by ID if it's a valid objectId or if we store tour code.
            // For now, let's skip complex tour text search unless we have a 'tourCode'
        }).limit(limit),

        User.find({
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
        }).limit(limit).select('firstName lastName email role'),

        Vehicle.find({
            $or: [{ registrationNumber: regex }, { brand: regex }, { model: regex }]
        }).limit(limit)
    ]);

    const drivers = users.filter(u => u.role === 'driver');

    return successResponse({
        shipments,
        clients,
        tours,
        drivers,
        vehicles,
        total: shipments.length + clients.length + tours.length + drivers.length + vehicles.length
    });
});
