const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../index'); 

let db;
let userId;
let userEmail;
const firebaseToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0MzRmMzFkN2Y3NWRiN2QyZjQ0YjgxZDg1MjMwZWQxN2ZlNTk3MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbG9naXN0aXgtNDc0OTYiLCJhdWQiOiJsb2dpc3RpeC00NzQ5NiIsImF1dGhfdGltZSI6MTczODg3NTMwMCwidXNlcl9pZCI6InYyS0x4M29RMFlnVVV6a2dXZFZhV1RiTU1XdjEiLCJzdWIiOiJ2MktMeDNvUTBZZ1VVemtnV2RWYVdUYk1NV3YxIiwiaWF0IjoxNzM4ODc1MzAwLCJleHAiOjE3Mzg4Nzg5MDAsImVtYWlsIjoiamVzdXNyZWRyb2pvQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImplc3VzcmVkcm9qb0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.m2vVzkxxcoIro0YnnodR99Pt3p4xgsudxKORewTLhPv3Qtb5DdiIFf3S755btBXA96K1Nj6Y4Wm9p2zDo9jK1XDt2mt5Q_W1O-QpMVI0fkluXOHiYww7XieClP0KjsmyNcXrQmULd7bOG-IESdgDCucS88qYbK4rtx1O2wis8DJYA4VfwDVRkwr9XBQ_EEe0X81_ZovIx1p9-Z4LjKRH23UyMFSV-SxSAaHb9Ba3AqdXS12pXS79itet5GVjRQQtO856KlCJblpdyigBRdzbYRpIQ9KUawd-XujthOtJVE5cLAF749gA1B66UoPq4S_11NS6mJjB2chY3PseqIEUtA"
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

describe('Users API Tests', () => {
    test('POST /api/users/signUp - Sign-Up a User', async () => {
        const newUser = { 
            name: 'User1',
            email: 'user@example.com',
            password: 'Password_001',
            lastName: 'Last Name',
            company:'Example Company',
            role :'admin',
            address: 'C/Topo',
            phone: '234567893',
            profile:'img.png' };
        
        const response = await request(app)
            .post('/api/users/signUp')
            .send(newUser)
            .expect(201);
        
        userEmail = newUser.email;
        expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente.');
        
    });

    test('GET /api/users/:email - Get user by email', async () => {
        const response = await request(app)
            .get(`/api/users/${userEmail}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .expect(200);
        userId = response.body._id;
        expect(response.body).toHaveProperty('email', userEmail );
    });

    test('PUT /api/users/:id - Update brand', async () => {
        const updatedUser= { name: 'Updated Name', lastName: 'Updated lastName' };
        
        const response = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${firebaseToken}`)
            .send(updatedUser)
            .expect(200);
        
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name', 'Updated Name');
            expect(response.body).toHaveProperty('lastName', 'Updated lastName');
    });

  });