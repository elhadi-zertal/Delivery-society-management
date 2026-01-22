import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Pricing from '@/models/Pricing';
import ServiceType from '@/models/ServiceType';
import Destination from '@/models/Destination';
import { PriceCalculationResult } from '@/types';

export interface PackageInput {
    weight: number;
    volume: number;
    quantity: number;
}

export interface PriceCalculationParams {
    serviceTypeId: string | Types.ObjectId;
    destinationId: string | Types.ObjectId;
    packages: PackageInput[];
}

/**
 * Calculate shipment price based on service type, destination, and packages
 * Formula: Base + (Weight × WeightRate) + (Volume × VolumeRate)
 */
export async function calculateShipmentPrice(
    params: PriceCalculationParams
): Promise<PriceCalculationResult> {
    await connectDB();

    const { serviceTypeId, destinationId, packages } = params;

    // Get pricing for the route
    const pricing = await Pricing.findActiveForRoute(serviceTypeId, destinationId);

    if (!pricing) {
        throw new Error('No active pricing found for this service type and destination combination');
    }

    // If the pricing doesn't have populated refs, fetch them
    let serviceMultiplier = 1;
    if (pricing.serviceType && typeof pricing.serviceType === 'object' && 'multiplier' in pricing.serviceType) {
        serviceMultiplier = (pricing.serviceType as unknown as { multiplier: number }).multiplier;
    } else {
        const serviceType = await ServiceType.findById(serviceTypeId);
        if (serviceType) {
            serviceMultiplier = serviceType.multiplier;
        }
    }

    // Calculate totals from packages
    const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight * pkg.quantity, 0);
    const totalVolume = packages.reduce((sum, pkg) => sum + pkg.volume * pkg.quantity, 0);

    // Apply pricing formula
    const baseAmount = pricing.baseRate * serviceMultiplier;
    const weightAmount = totalWeight * pricing.weightRate;
    const volumeAmount = totalVolume * pricing.volumeRate;

    let totalAmount = baseAmount + weightAmount + volumeAmount;

    // Apply minimum charge
    if (totalAmount < pricing.minCharge) {
        totalAmount = pricing.minCharge;
    }

    // Round to 2 decimal places
    const result: PriceCalculationResult = {
        baseAmount: Math.round(baseAmount * 100) / 100,
        weightAmount: Math.round(weightAmount * 100) / 100,
        volumeAmount: Math.round(volumeAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        breakdown: {
            baseRate: pricing.baseRate,
            weightRate: pricing.weightRate,
            volumeRate: pricing.volumeRate,
            totalWeight,
            totalVolume,
        },
    };

    return result;
}

/**
 * Get pricing details for a route
 */
export async function getPricingDetails(
    serviceTypeId: string | Types.ObjectId,
    destinationId: string | Types.ObjectId
) {
    await connectDB();

    const pricing = await Pricing.findActiveForRoute(serviceTypeId, destinationId);

    if (!pricing) {
        return null;
    }

    // Get service type and destination details
    const [serviceType, destination] = await Promise.all([
        ServiceType.findById(serviceTypeId),
        Destination.findById(destinationId),
    ]);

    return {
        pricing,
        serviceType,
        destination,
    };
}

/**
 * Estimate delivery date based on service type
 */
export async function estimateDeliveryDate(
    serviceTypeId: string | Types.ObjectId,
    pickupDate: Date = new Date()
): Promise<{ min: Date; max: Date }> {
    await connectDB();

    const serviceType = await ServiceType.findById(serviceTypeId);

    if (!serviceType) {
        throw new Error('Service type not found');
    }

    const minDate = new Date(pickupDate);
    minDate.setDate(minDate.getDate() + serviceType.estimatedDeliveryDays.min);

    const maxDate = new Date(pickupDate);
    maxDate.setDate(maxDate.getDate() + serviceType.estimatedDeliveryDays.max);

    return { min: minDate, max: maxDate };
}
