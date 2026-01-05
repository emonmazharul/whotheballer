import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken';
import { hashPassword } from '../src/utils/password';
import { db } from '../src/db/db.js';
import { users } from '../src/db/schema.js';
import request from 'supertest';
import app from '../src/app.js';

const userId = uuidv4();
const token = jwt.sign({userId,}, process.env.JWT_SECRET!);

const newUser = {
    id:userId,
    username:'testuser1',
    email:'testuser1@test.com',
    passwordHash: await hashPassword('Hello1234'),
    twitter:'testuser1',
    tokens: [token],
}

const userObj = {
    username:'testuser2',
    email:'testuser2@test.com',
    password: 'Hello1234',
    twitter:'testuser2',
}


describe('User API', () => {
  
  let userToken  = '';
  let id = '';
  beforeAll(async () => {
    const q = await db.insert(users).values(newUser).returning();
    id = q[0].id;
    userToken = q[0].tokens[0]
  });
  afterAll(async () => {
    await db.delete(users);
    id = '';
    userToken = ''
  });

  it('should return 200 when try to register a user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userObj)
    
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.status).toBe(201);
  });

  it('should return 400 and error to register with an existing email/username', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(userObj)

    expect(response.body).toHaveProperty("error");
  });

  it('should return 400 when trying to register user without proper body', async () => {
    const userValue = {...userObj}
    userValue.email = 'novalidemail';


    const response = await request(app)
      .post('/api/auth/register')
      .send()
    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(400);
  });

  it('shuld return 400 when trying to register user but missing a required body value', async () => {
    
    const userValue = {
        email:'useremail@test.com',
        password:'mypassword',
        // username:'userOne',
        twitter:'userOneTwoThree',
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send()
        expect(response.body).toHaveProperty("error");
        expect(response.status).toBe(400);
    });


    it('shuld return 400 when password is weak and doesnot align with code format', async () => {
    
        const userValue = {
            email:'useremail@test.com',
            password:'mypassword',
            username:'userOne',
            twitter:'userOneTwoThree',
        }

        const response = await request(app)
        .post('/api/auth/register')
        .send()
            expect(response.body).toHaveProperty("error");
            expect(response.status).toBe(400);
    });


    it('shuld return 400 when password is missing', async () => {
    
        const userValue = {
           
            // username:'testuser1',
            // email:'testuser1@test.com',
            password: 'Hello1234',
        }

        const response = await request(app)
        .post('/api/auth/login')
        .send(userValue)
            expect(response.body).toHaveProperty("error");
            expect(response.status).toBe(400);
    });

     it('shuld return 400 when email/username is missing', async () => {
    
        const userValue = {
           
            username:'testuser1',
            // email:'testuser1@test.com',
            // password: 'Hello1234',
        }

        const response = await request(app)
        .post('/api/auth/login')
        .send(userValue)
            expect(response.body).toHaveProperty("error");
            expect(response.status).toBe(400);
    });

    it('shuld return 400 when email and username both set', async () => {
    
        const userValue = {
           
            username:'testuser1',
            email:'testuser1@test.com',
            password: 'Hello1234',
        }

        const response = await request(app)
        .post('/api/auth/login')
        .send(userValue)
            expect(response.body).toHaveProperty("error");
            expect(response.status).toBe(400);
    });

    it('shuld return 401 when credentials is wrong', async () => {
    
        const userValue = {
           
            username:'testuser1',
            // email:'testuser1@test.com',
            password: 'Hello12344',
        }

        const response = await request(app)
        .post('/api/auth/login')
        .send(userValue)
            expect(response.body).toHaveProperty("error");
            expect(response.status).toBe(401);
    });


    it('shuld return 200 when credentials is right, login with email', async () => {
    
        const userValue = {
           
            // username:'testuser1',
            email:'testuser1@test.com',
            password: 'Hello1234',
        }

        const response = await request(app)
        .post('/api/auth/login')
        .send(userValue)
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.status).toBe(200);
    });


    it('shuld return 200 when credentials is right, login with username', async () => {
    
        const userValue = {
           
            username:'testuser1',
            // email:'testuser1@test.com',
            password: 'Hello1234',
        }

        const response = await request(app)
        .post('/api/auth/login')
        .send(userValue)
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.status).toBe(200);
    });



  
}); 