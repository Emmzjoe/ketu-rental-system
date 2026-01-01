// API Helper for Frontend Integration
// Copy this code into your HTML file to connect to the backend

const API_BASE_URL = 'http://localhost:3001/api';

const API = {
    // Vehicles
    vehicles: {
        getAll: () => fetch(`${API_BASE_URL}/vehicles`).then(r => r.json()),
        getOne: (id) => fetch(`${API_BASE_URL}/vehicles/${id}`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // Customers
    customers: {
        getAll: () => fetch(`${API_BASE_URL}/customers`).then(r => r.json()),
        getOne: (id) => fetch(`${API_BASE_URL}/customers/${id}`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // Bookings
    bookings: {
        getAll: () => fetch(`${API_BASE_URL}/bookings`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // Payments
    payments: {
        getAll: () => fetch(`${API_BASE_URL}/payments`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // Maintenance
    maintenance: {
        getAll: () => fetch(`${API_BASE_URL}/maintenance`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/maintenance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/maintenance/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/maintenance/${id}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // Documents
    documents: {
        getAll: () => fetch(`${API_BASE_URL}/documents`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/documents/${id}`, {
            method: 'DELETE'
        }).then(r => r.json())
    },

    // Company
    company: {
        get: () => fetch(`${API_BASE_URL}/company`).then(r => r.json()),
        update: (data) => fetch(`${API_BASE_URL}/company`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json())
    },

    // Stats
    stats: {
        get: () => fetch(`${API_BASE_URL}/stats`).then(r => r.json())
    }
};

// Example Usage:
// API.vehicles.getAll().then(vehicles => console.log(vehicles));
// API.customers.create({ name: 'John Doe', email: 'john@example.com' });
// API.bookings.update(1, { status: 'completed' });
