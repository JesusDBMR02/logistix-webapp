const request = require('supertest');
const app = require('../index'); 
const { MongoClient } = require('mongodb');

let purchaseId;
let supplierId;
let productId;
const firebaseToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0MzRmMzFkN2Y3NWRiN2QyZjQ0YjgxZDg1MjMwZWQxN2ZlNTk3MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbG9naXN0aXgtNDc0OTYiLCJhdWQiOiJsb2dpc3RpeC00NzQ5NiIsImF1dGhfdGltZSI6MTczODg3NTMwMCwidXNlcl9pZCI6InYyS0x4M29RMFlnVVV6a2dXZFZhV1RiTU1XdjEiLCJzdWIiOiJ2MktMeDNvUTBZZ1VVemtnV2RWYVdUYk1NV3YxIiwiaWF0IjoxNzM4ODc1MzAwLCJleHAiOjE3Mzg4Nzg5MDAsImVtYWlsIjoiamVzdXNyZWRyb2pvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImplc3VzcmVkcm9qb0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.m2vVzkxxcoIro0YnnodR99Pt3p4xgsudxKORewTLhPv3Qtb5DdiIFf3S755btBXA96K1Nj6Y4Wm9p2zDo9jK1XDt2mt5Q_W1O-QpMVI0fkluXOHiYww7XieClP0KjsmyNcXrQmULd7bOG-IESdgDCucS88qYbK4rtx1O2wis8DJYA4VfwDVRkwr9XBQ_EEe0X81_ZovIx1p9-Z4LjKRH23UyMFSV-SxSAaHb9Ba3AqdXS12pXS79itet5GVjRQQtO856KlCJblpdyigBRdzbYRpIQ9KUawd-XujthOtJVE5cLAF749gA1B66UoPq4S_11NS6mJjB2chY3PseqIEUtA" 

beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const client =new MongoClient(process.env.MONGODB_URI);
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

    const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
            name: 'Producto Test',
            description: 'Descripción del producto',
            category: 'Electrónica',
            brand: 'Marca Test',
            supplier: supplierId,
            purchasePrice: 50,
            salePrice: 100,
            discount: 0,
            tax: 10,
            stock: 20,
            measuring: 'unidad',
            status: 'Activo',
            img: '',
            attributes: {},
            total: 100
        })
        .expect(201);

    productId = productResponse.body.product._id;
});

afterAll(async () => {
    await db.dropDatabase();  
});

describe('Purchase API Tests', () => {
    
    test('POST /api/purchases - Crear una compra', async () => {
        const newPurchase = {
            name: 'Compra Test',
            supplier: supplierId,
            products: [
                {
                    product: productId,
                    quantity: 2,
                    purchasePrice: 50
                }
            ],
            totalAmount: 100,
            paymentMethod: 'Efectivo',
            purchaseDate: new Date().toISOString(),
            status: 'Completado',
            notes: 'Compra de prueba'
        }
        const response = await request(app)
            .post('/api/purchases')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(newPurchase)
            .expect(201);

        purchaseId = response.body.purchase._id;
        expect(response.body.purchase).toHaveProperty('_id');
    });

    test('GET /api/purchases - Obtener todas las compras', async () => {
        const response = await request(app)
            .get('/api/purchases')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);

        
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/purchases/:id - Obtener una compra por ID', async () => {
        const response = await request(app)
            .get(`/api/purchases/${purchaseId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);


        expect(response.body).toHaveProperty('_id', purchaseId);
    });

    test('PUT /api/purchases/:id - Actualizar una compra', async () => {
        const response = await request(app)
            .put(`/api/purchases/${purchaseId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send({
                name: 'Compra Actualizada',
                totalAmount: 150, 
                status: 'Pendiente' 
            })
            .expect(200);


        expect(response.body).toHaveProperty('_id', purchaseId);
        expect(response.body).toHaveProperty('totalAmount', 150);
        expect(response.body).toHaveProperty('status', 'Pendiente');
    });

});
