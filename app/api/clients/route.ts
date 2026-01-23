import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Client from '@/models/Client';
import {
    withErrorHandler,
    successResponse,
    createdResponse,
    errorResponse,
    getPaginationParams,
    createPaginationMeta,
    buildSearchFilter,
    buildSortOptions,
} from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { createClientSchema } from '@/lib/validations/schemas';

/**
 * GET /api/clients
 * List all clients with pagination and search
 */
export const GET = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const searchFilter = buildSearchFilter(searchParams, ['firstName', 'lastName', 'companyName', 'email']);
    const sortOptions = buildSortOptions(searchParams);

    // Additional filters
    const filter: Record<string, unknown> = { ...searchFilter };

    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
        filter.isActive = isActive === 'true';
    }

    const [clients, total] = await Promise.all([
        Client.find(filter).sort(sortOptions).skip(skip).limit(limit),
        Client.countDocuments(filter),
    ]);

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(clients, undefined, pagination);
});

/**
 * POST /api/clients
 * Create a new client
 */
export const POST = withErrorHandler(async (request: Request) => {
    await requireAuth();
    await connectDB();

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
        return errorResponse(parsed.error.issues.map(e => e.message).join(', '), 400);
    }

    const client = new Client(parsed.data);
    await client.save();

    return createdResponse(client, 'Client created successfully');
});
