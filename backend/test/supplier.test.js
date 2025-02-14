const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../index');

let db;
let supplierId;
let productId;

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('LogistiXTest');  
    app.locals.db = db;  
});

afterAll(async () => {
    await db.dropDatabase();  
});

const firebaseToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0MzRmMzFkN2Y3NWRiN2QyZjQ0YjgxZDg1MjMwZWQxN2ZlNTk3MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbG9naXN0aXgtNDc0OTYiLCJhdWQiOiJsb2dpc3RpeC00NzQ5NiIsImF1dGhfdGltZSI6MTczODg3NTMwMCwidXNlcl9pZCI6InYyS0x4M29RMFlnVVV6a2dXZFZhV1RiTU1XdjEiLCJzdWIiOiJ2MktMeDNvUTBZZ1VVemtnV2RWYVdUYk1NV3YxIiwiaWF0IjoxNzM4ODc1MzAwLCJleHAiOjE3Mzg4Nzg5MDAsImVtYWlsIjoiamVzdXNyZWRyb2pvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImplc3VzcmVkcm9qb0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.m2vVzkxxcoIro0YnnodR99Pt3p4xgsudxKORewTLhPv3Qtb5DdiIFf3S755btBXA96K1Nj6Y4Wm9p2zDo9jK1XDt2mt5Q_W1O-QpMVI0fkluXOHiYww7XieClP0KjsmyNcXrQmULd7bOG-IESdgDCucS88qYbK4rtx1O2wis8DJYA4VfwDVRkwr9XBQ_EEe0X81_ZovIx1p9-Z4LjKRH23UyMFSV-SxSAaHb9Ba3AqdXS12pXS79itet5GVjRQQtO856KlCJblpdyigBRdzbYRpIQ9KUawd-XujthOtJVE5cLAF749gA1B66UoPq4S_11NS6mJjB2chY3PseqIEUtA"

describe('Supplier API Tests', () => {
    test('POST /api/suppliers - Crear un proveedor con productos', async () => {
        const newSupplier = {
            name: "Proveedor Test",
            contact: "John Doe",
            phone: "123456789",
            email: "supplier@example.com",
            address: {
                street: "Calle 123",
                city: "Ciudad X",
                state: "Estado Y",
                postalCode: "12345",
                country: "País Z"
            },
            supplierType: "Mayorista",
            status: "Activo",
            notes: "Proveedor confiable",
        };

        const response = await request(app)
            .post('/api/suppliers')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(newSupplier)
            .expect(201);
        supplierId = response.body.supplier._id;
        expect(response.body).toHaveProperty('message', 'Proveedor insertado correctamente.');
        expect(response.body.supplier).toHaveProperty('_id');
        expect(response.body.supplier).toHaveProperty('name', 'Proveedor Test');
    });
    test('POST /api/products - Crear un producto', async () => {
        const newProduct = {
            name: "Producto Test",
            description: "Un producto de prueba",
            category: "Electrónica",
            brand: "Marca X",
            supplier: supplierId,
            purchasePrice: 50,
            salePrice: 100,
            discount: 10,
            tax: 18,
            stock: 500,
            measuring: "Unidad",
            status: "Disponible",
            img: "imagen.jpg",
            attributes: { color: "Rojo", tamaño: "Mediano" },
            total: 200
        };

        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(newProduct)
            .expect(201);
        productId = response.body.product._id;
        expect(response.body).toHaveProperty('message', 'Producto insertado correctamente.');
        expect(response.body.product).toHaveProperty('_id');
    });

    test('GET /api/suppliers - Obtener todos los proveedores', async () => {
        const response = await request(app)
            .get('/api/suppliers')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);
            
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/suppliers/:id - Obtener un proveedor y sus productos', async () => {
        const response = await request(app)
            .get(`/api/suppliers/${supplierId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('_id', supplierId);
    });

    test('PUT /api/suppliers/:id - Actualizar un proveedor', async () => {
        const updatedSupplier = {
            name: "Proveedor Actualizado",
            contact: "Jane Doe",
            phone: "987654321",
            email: "updated@example.com",
            address: {
                street: "Avenida Nueva",
                city: "Otra Ciudad",
                state: "Otro Estado",
                postalCode: "67890",
                country: "Otro País"
            },
            supplierType: "Minorista",
            status: "Inactivo",
            notes: "Proveedor actualizado",
            suppliedProducts: [productId]
        };

        const response = await request(app)
            .put(`/api/suppliers/${supplierId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(updatedSupplier)
            .expect(200);

        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', 'Proveedor Actualizado');
        expect(response.body).toHaveProperty('status', 'Inactivo');
    });

});
