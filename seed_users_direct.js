
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://si2:rani3ayan@cluster0.fzrafrb.mongodb.net/?appName=Cluster0";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'agent', 'driver'] },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const roles = ['admin', 'agent', 'driver'];

        for (const role of roles) {
            const email = `${role}@example.com`;
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                console.log(`User ${role} already exists`);
                continue;
            }

            const hashedPassword = await bcrypt.hash('password123', 10);

            await User.create({
                name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                email: email,
                password: hashedPassword,
                role: role
            });

            console.log(`Created user: ${role}`);
        }

        console.log('Seeding completed');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
