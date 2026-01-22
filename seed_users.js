
const createUsers = async () => {
    const roles = ['admin', 'agent', 'driver'];

    for (const role of roles) {
        const userData = {
            name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            email: `${role}@example.com`,
            password: 'password123',
            confirmPassword: 'password123',
            role: role
        };

        try {
            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            console.log(`User ${role} creation status:`, response.status, data);
        } catch (error) {
            console.error(`Failed to create ${role}:`, error);
        }
    }
};

createUsers();
