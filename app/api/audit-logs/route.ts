import { connectDB } from '@/lib/db';
import { withErrorHandler, successResponse, createPaginationMeta } from '@/lib/api-utils';
import { requireRoles } from '@/lib/auth';
import { UserRole } from '@/types';
import mongoose, { Schema, Document } from 'mongoose';

// AuditLog Schema
const auditLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    description: String,
    changes: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ['success', 'failed'], default: 'success' }
}, { timestamps: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export const GET = withErrorHandler(async (req: Request) => {
    await requireRoles(UserRole.ADMIN);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (searchParams.get('userId')) filter.userId = searchParams.get('userId');
    if (searchParams.get('entityType')) filter.entityType = searchParams.get('entityType');
    if (searchParams.get('action')) filter.action = searchParams.get('action');

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'firstName lastName email role'),
        AuditLog.countDocuments(filter)
    ]);

    return successResponse(logs, undefined, createPaginationMeta(page, limit, total));
});
