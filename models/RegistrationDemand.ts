import mongoose from 'mongoose';
import { UserRole } from '@/types';

const registrationDemandSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.DRIVER,
    },
}, {
    timestamps: true,
});

const RegistrationDemand = mongoose.models.RegistrationDemand || mongoose.model('RegistrationDemand', registrationDemandSchema);

export default RegistrationDemand;
