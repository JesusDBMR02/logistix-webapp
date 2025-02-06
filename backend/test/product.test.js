const request = require('supertest');
const app = require('../index'); 
const { MongoClient } = require('mongodb');

let productId;
let supplierId;
const firebaseToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0MzRmMzFkN2Y3NWRiN2QyZjQ0YjgxZDg1MjMwZWQxN2ZlNTk3MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbG9naXN0aXgtNDc0OTYiLCJhdWQiOiJsb2dpc3RpeC00NzQ5NiIsImF1dGhfdGltZSI6MTczODg3NTMwMCwidXNlcl9pZCI6InYyS0x4M29RMFlnVVV6a2dXZFZhV1RiTU1XdjEiLCJzdWIiOiJ2MktMeDNvUTBZZ1VVemtnV2RWYVdUYk1NV3YxIiwiaWF0IjoxNzM4ODc1MzAwLCJleHAiOjE3Mzg4Nzg5MDAsImVtYWlsIjoiamVzdXNyZWRyb2pvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImplc3VzcmVkcm9qb0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.m2vVzkxxcoIro0YnnodR99Pt3p4xgsudxKORewTLhPv3Qtb5DdiIFf3S755btBXA96K1Nj6Y4Wm9p2zDo9jK1XDt2mt5Q_W1O-QpMVI0fkluXOHiYww7XieClP0KjsmyNcXrQmULd7bOG-IESdgDCucS88qYbK4rtx1O2wis8DJYA4VfwDVRkwr9XBQ_EEe0X81_ZovIx1p9-Z4LjKRH23UyMFSV-SxSAaHb9Ba3AqdXS12pXS79itet5GVjRQQtO856KlCJblpdyigBRdzbYRpIQ9KUawd-XujthOtJVE5cLAF749gA1B66UoPq4S_11NS6mJjB2chY3PseqIEUtA"

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('LogistiXTest');  
    app.locals.db = db;  

    const supplierResponse = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
            name: 'Proveedor Test',
            contact: 'Contacto Test',
            phone: '123456789',
            email: 'test@example.com',
            address: {
                street: 'Calle Test',
                city: 'Ciudad Test',
                state: 'Estado Test',
                postalCode: '12345',
                country: 'País Test'
            },
            supplierType: 'Mayorista',
            status: 'Activo',
            notes: 'Notas de prueba',
            suppliedProducts: []
        })
        .expect(201);

    supplierId = supplierResponse.body.supplier._id;
});

afterAll(async () => {
    await db.dropDatabase();  
});

describe('Products API Tests', () => {
    
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

    test('GET /api/products/:id - Obtener un producto', async () => {
        const response = await request(app)
            .get(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('_id', productId);
    });

    test('GET /api/products - Obtener todos los productos', async () => {
        const response = await request(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('PUT /api/products/:id - Actualizar un producto', async () => {
        const updatedProduct = {
            name: 'Producto Actualizado',
                description: 'Nueva descripción',
                salePrice: 120,
                stock: 30 
        };

        const response = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(updatedProduct)
            .expect(200);

        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('salePrice', 120);
    });

    test('DELETE /api/products/:id - Eliminar un producto', async () => {
        const response = await request(app)
            .delete(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('message', 'Producto eliminado correctamente');
    });

});