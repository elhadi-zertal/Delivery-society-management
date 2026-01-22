/**
 * Seed script to create test data for drivers.
 * Run with: node seed_tours.js
 * 
 * This creates:
 * - 2 Drivers (linked to driver@example.com or creates new driver users)
 * - 2 Vehicles
 * - 1 Client
 * - 1 Destination
 * - 1 Service Type
 * - 14 Shipments (7 per tour)
 * - 2 Delivery Tours
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

// Address helper
const makeAddress = (street, city, postal) => ({
    street,
    city,
    postalCode: postal,
    country: 'Algeria'
});

// Shipment destinations
const DESTINATIONS = [
    { name: 'Bab Ezzouar', address: makeAddress('123 Centre Commercial', 'Bab Ezzouar', '16040') },
    { name: 'Hussein Dey', address: makeAddress('45 Rue de la Liberté', 'Hussein Dey', '16000') },
    { name: 'Kouba', address: makeAddress('78 Boulevard Principal', 'Kouba', '16050') },
    { name: 'El Harrach', address: makeAddress('22 Rue du Marché', 'El Harrach', '16200') },
    { name: 'Rouiba', address: makeAddress('100 Zone Industrielle', 'Rouiba', '16012') },
    { name: 'Reghaia', address: makeAddress('55 Avenue Bord de Mer', 'Reghaia', '16121') },
    { name: 'Dar El Beida', address: makeAddress('12 Aéroport', 'Dar El Beida', '16033') },
    { name: 'Cheraga', address: makeAddress('8 Villa les Pins', 'Cheraga', '16014') },
    { name: 'Dely Ibrahim', address: makeAddress('33 Résidence Fleurie', 'Dely Ibrahim', '16320') },
    { name: 'Ben Aknoun', address: makeAddress('90 Campus Universitaire', 'Ben Aknoun', '16306') },
    { name: 'Hydra', address: makeAddress('5 Rue des Ambassades', 'Hydra', '16035') },
    { name: 'El Biar', address: makeAddress('17 Chemin des Crêtes', 'El Biar', '16030') },
    { name: 'Sidi M\'Hamed', address: makeAddress('200 Rue Didouche Mourad', 'Sidi M\'Hamed', '16000') },
    { name: 'Oued Smar', address: makeAddress('88 Zone Logistique', 'Oued Smar', '16270') },
];

async function seed() {
    console.log('🌱 Starting seed...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // --- Clear existing test data (optional, careful!) ---
    // await db.collection('drivers').deleteMany({});
    // await db.collection('vehicles').deleteMany({});
    // await db.collection('shipments').deleteMany({});
    // await db.collection('deliverytours').deleteMany({});

    // --- Create Drivers ---
    const driversData = [
        {
            employeeId: 'DRV0001',
            firstName: 'Karim',
            lastName: 'Benali',
            email: 'driver1@example.com',
            phone: '+213 555 123 456',
            address: makeAddress('10 Rue des Oliviers', 'Alger Centre', '16000'),
            licenseNumber: 'ALG-2020-1234',
            licenseExpiry: new Date('2028-06-15'),
            licenseType: 'C',
            status: 'available',
            hireDate: new Date('2022-03-01'),
            isActive: true,
        },
        {
            employeeId: 'DRV0002',
            firstName: 'Youcef',
            lastName: 'Hamidi',
            email: 'driver2@example.com',
            phone: '+213 555 789 012',
            address: makeAddress('25 Boulevard Zighout', 'Bab El Oued', '16000'),
            licenseNumber: 'ALG-2019-5678',
            licenseExpiry: new Date('2027-09-20'),
            licenseType: 'C',
            status: 'available',
            hireDate: new Date('2021-07-15'),
            isActive: true,
        }
    ];

    const drivers = [];
    for (const d of driversData) {
        const existing = await db.collection('drivers').findOne({ $or: [{ email: d.email }, { employeeId: d.employeeId }] });
        if (existing) {
            console.log(`  Driver ${d.email} or ${d.employeeId} already exists, using existing.`);
            drivers.push(existing);
        } else {
            const res = await db.collection('drivers').insertOne({ ...d, createdAt: new Date(), updatedAt: new Date() });
            drivers.push({ ...d, _id: res.insertedId });
            console.log(`  ✅ Created driver: ${d.firstName} ${d.lastName}`);
        }
    }

    // --- Create Vehicles ---
    const vehiclesData = [
        {
            registrationNumber: '00123-116-16',
            type: 'van',
            brand: 'Renault',
            model: 'Master',
            year: 2022,
            capacity: { weight: 1200, volume: 12 },
            fuelType: 'Diesel',
            fuelConsumption: 9.5,
            status: 'available',
            mileage: 45000,
            isActive: true,
        },
        {
            registrationNumber: '00456-116-16',
            type: 'truck',
            brand: 'Iveco',
            model: 'Daily',
            year: 2021,
            capacity: { weight: 3500, volume: 20 },
            fuelType: 'Diesel',
            fuelConsumption: 12.0,
            status: 'available',
            mileage: 78000,
            isActive: true,
        }
    ];

    const vehicles = [];
    for (const v of vehiclesData) {
        const existing = await db.collection('vehicles').findOne({ registrationNumber: v.registrationNumber });
        if (existing) {
            console.log(`  Vehicle ${v.registrationNumber} already exists, using existing.`);
            vehicles.push(existing);
        } else {
            const res = await db.collection('vehicles').insertOne({ ...v, createdAt: new Date(), updatedAt: new Date() });
            vehicles.push({ ...v, _id: res.insertedId });
            console.log(`  ✅ Created vehicle: ${v.brand} ${v.model} (${v.registrationNumber})`);
        }
    }

    // --- Create/Find a Client ---
    let client = await db.collection('clients').findOne({ email: 'testclient@example.com' });
    if (!client) {
        const clientRes = await db.collection('clients').insertOne({
            code: 'CLI0001',
            firstName: 'Ahmed',
            lastName: 'Boudiaf',
            companyName: 'Boudiaf Trading',
            email: 'testclient@example.com',
            phone: '+213 555 000 111',
            address: makeAddress('50 Rue du Commerce', 'Alger', '16000'),
            accountBalance: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        client = { _id: clientRes.insertedId };
        console.log('  ✅ Created client: Boudiaf Trading');
    } else {
        console.log('  Client testclient@example.com already exists, using existing.');
    }

    // --- Create/Find a Destination ---
    let destination = await db.collection('destinations').findOne({ city: 'Alger' });
    if (!destination) {
        const destRes = await db.collection('destinations').insertOne({
            code: 'DEST-ALG',
            city: 'Alger',
            country: 'Algeria',
            zone: 'Centre',
            baseRate: 500,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        destination = { _id: destRes.insertedId };
        console.log('  ✅ Created destination: Alger');
    } else {
        console.log('  Destination Alger already exists, using existing.');
    }

    // --- Create/Find a Service Type ---
    let serviceType = await db.collection('servicetypes').findOne({ name: 'standard' });
    if (!serviceType) {
        const stRes = await db.collection('servicetypes').insertOne({
            code: 'SVC-STD',
            name: 'standard',
            displayName: 'Standard Delivery',
            estimatedDeliveryDays: { min: 2, max: 5 },
            multiplier: 1.0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        serviceType = { _id: stRes.insertedId };
        console.log('  ✅ Created service type: Standard');
    } else {
        console.log('  Service type standard already exists, using existing.');
    }

    // --- Create Shipments ---
    const createShipment = async (index, destInfo) => {
        const shipmentNum = `SHP-${Date.now()}-${index.toString().padStart(3, '0')}`;
        return {
            shipmentNumber: shipmentNum,
            client: client._id,
            serviceType: serviceType._id,
            destination: destination._id,
            senderName: 'Boudiaf Trading',
            senderPhone: '+213 555 000 111',
            senderAddress: makeAddress('50 Rue du Commerce', 'Alger', '16000'),
            receiverName: `Receiver ${destInfo.name}`,
            receiverPhone: `+213 555 ${(100 + index).toString().padStart(3, '0')} ${(200 + index).toString().padStart(3, '0')}`,
            receiverAddress: destInfo.address,
            packages: [{ description: `Package ${index + 1}`, weight: 5 + index, volume: 0.05, quantity: 1 }],
            totalWeight: 5 + index,
            totalVolume: 0.05,
            priceBreakdown: { baseAmount: 500, weightAmount: 50, volumeAmount: 25, additionalFees: 0, discount: 0 },
            totalAmount: 575,
            status: 'pending',
            trackingHistory: [{ timestamp: new Date(), status: 'pending', description: 'Shipment created' }],
            isInvoiced: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    };

    // Tour 1 shipments (first 7 destinations)
    const tour1Shipments = [];
    for (let i = 0; i < 7; i++) {
        const shipment = await createShipment(i, DESTINATIONS[i]);
        const res = await db.collection('shipments').insertOne(shipment);
        tour1Shipments.push(res.insertedId);
    }
    console.log(`  ✅ Created ${tour1Shipments.length} shipments for Tour 1`);

    // Tour 2 shipments (next 7 destinations)
    const tour2Shipments = [];
    for (let i = 7; i < 14; i++) {
        const shipment = await createShipment(i, DESTINATIONS[i]);
        const res = await db.collection('shipments').insertOne(shipment);
        tour2Shipments.push(res.insertedId);
    }
    console.log(`  ✅ Created ${tour2Shipments.length} shipments for Tour 2`);

    // --- Create Tours ---
    const tourDate = new Date();
    tourDate.setHours(8, 0, 0, 0);

    const tour1 = {
        tourNumber: `TOUR-${Date.now()}-001`,
        date: tourDate,
        driver: drivers[0]._id,
        vehicle: vehicles[0]._id,
        shipments: tour1Shipments,
        status: 'planned',
        plannedRoute: {
            startLocation: 'Alger Centre (Dépôt)',
            endLocation: 'Dar El Beida',
            estimatedDistance: 45,
            estimatedDuration: 180,
        },
        deliveriesCompleted: 0,
        deliveriesFailed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const tour2 = {
        tourNumber: `TOUR-${Date.now()}-002`,
        date: tourDate,
        driver: drivers[1]._id,
        vehicle: vehicles[1]._id,
        shipments: tour2Shipments,
        status: 'in_progress',
        plannedRoute: {
            startLocation: 'Alger Centre (Dépôt)',
            endLocation: 'Oued Smar',
            estimatedDistance: 55,
            estimatedDuration: 210,
        },
        deliveriesCompleted: 2,
        deliveriesFailed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.collection('deliverytours').insertOne(tour1);
    console.log(`  ✅ Created Tour 1 for driver ${drivers[0].firstName} with vehicle ${vehicles[0].registrationNumber}`);

    await db.collection('deliverytours').insertOne(tour2);
    console.log(`  ✅ Created Tour 2 for driver ${drivers[1].firstName} with vehicle ${vehicles[1].registrationNumber}`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nTest driver emails for login:');
    console.log('  - driver1@example.com');
    console.log('  - driver2@example.com');
    console.log('\n(Note: You may need to create User accounts with these emails and "driver" role to log in)');

    await mongoose.disconnect();
}

seed().catch(console.error);
