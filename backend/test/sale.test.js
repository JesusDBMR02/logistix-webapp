const request = require('supertest');
const app = require('../index'); 
const { MongoClient } = require('mongodb');

let saleId;
let productId;
let supplierId;
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

describe('Sale API Tests', () => {
    
    test('POST /api/sales - Crear una venta', async () => {
        const newSale = {
            name: 'Venta Test',
            products: [
                {
                    product: productId,
                    quantity: 2,
                    total: 50
                }
            ],
            totalAmount: 100,
            paymentMethod: 'Efectivo',
            saleDate: new Date().toISOString(),
            status: 'Completado',
            notes: 'Venta de prueba'
        }
        const response = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(newSale)
            .expect(201);

        saleId = response.body.sale._id;
        expect(response.body.sale).toHaveProperty('_id');
    });

    test('GET /api/sales - Obtener todas las ventas', async () => {
        const response = await request(app)
            .get('/api/sales')
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);

        
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/sales/:id - Obtener una venta por ID', async () => {
        const response = await request(app)
            .get(`/api/sales/${saleId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);


        expect(response.body).toHaveProperty('_id', saleId);
    });

    test('PUT /api/sales/:id - Actualizar una venta', async () => {
        const response = await request(app)
            .put(`/api/sales/${saleId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send({
                name: 'Venta Actualizada',
                totalAmount: 150, 
                status: 'Pendiente' 
            })
            .expect(200);


        expect(response.body).toHaveProperty('_id', saleId);
        expect(response.body).toHaveProperty('totalAmount', 150);
        expect(response.body).toHaveProperty('status', 'Pendiente');
    });

});