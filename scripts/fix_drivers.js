
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://si2:rani3ayan@cluster0.fzrafrb.mongodb.net/?appName=Cluster0";

// Minimal Schemas for the script
const driverSchema = new mongoose.Schema({
    employeeId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: {
        street: String,
        city: String,
        postalCode: String,
        country: String
    },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    licenseType: { type: String, required: true },
    status: { type: String, default: 'available' },
    hireDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
});

const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const driverUsers = await User.find({ role: 'driver' });
        console.log(`Found ${driverUsers.length} users with driver role`);

        for (const user of driverUsers) {
            const existingDriver = await Driver.findOne({ email: user.email });
            if (existingDriver) {
                console.log(`Driver record already exists for ${user.email}`);
                continue;
            }

            const nameParts = user.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || 'Driver';

            // Generate employee ID (simplified for script)
            const lastDriver = await Driver.findOne({}, {}, { sort: { createdAt: -1 } });
            let nextNumber = 1;
            if (lastDriver && lastDriver.employeeId) {
                const lastNumber = parseInt(lastDriver.employeeId.replace('DRV', ''), 10);
                if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
            }
            const employeeId = `DRV${nextNumber.toString().padStart(4, '0')}`;

            await Driver.create({
                employeeId,
                firstName,
                lastName,
                email: user.email,
                phone: '000-000-0000',
                address: {
                    street: 'Reconciled',
                    city: 'Reconciled',
                    postalCode: '00000',
                    country: 'Reconciled'
                },
                licenseNumber: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                licenseType: 'B',
                status: 'available',
                hireDate: user.createdAt || new Date(),
                isActive: true
            });

            console.log(`Created Driver record for ${user.email} (${employeeId})`);
        }

        console.log('Reconciliation completed');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Reconciliation failed:', error);
        process.exit(1);
    }
}

run();
