import { connectDB } from '@/lib/db';
import DeliveryTour from '@/models/DeliveryTour';
import Driver from '@/models/Driver';
import Shipment from '@/models/Shipment'; // Required for populate
import Client from '@/models/Client'; // Required for nested populate
import Destination from '@/models/Destination'; // Required for nested populate
import {
    withErrorHandler,
    successResponse,
    errorResponse,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/driver/tours
 * Fetch tours assigned to the current driver
 */
export const GET = withErrorHandler(async (request: Request) => {
    const { user } = await requireAuth();
    await connectDB();

    // 1. Find the driver profile associated with this user
    const driver = await Driver.findOne({ email: user.email });
    if (!driver) {
        return errorResponse('Driver profile not found', 404);
    }

    // 2. Fetch tours for this driver
    const tours = await DeliveryTour.find({ driver: driver._id })
        .populate('vehicle')
        .populate({
            path: 'shipments',
            populate: ['client', 'destination'],
        })
        .populate('incidents')
        .sort({ date: -1 });

    return successResponse(tours);
});
