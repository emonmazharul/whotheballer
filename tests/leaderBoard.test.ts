import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/db/db.js';
import { questions,gameAttempts,userStats } from '../src/db/schema.js';
import request from 'supertest';
import app from '../src/app.js';


describe('Leaderboard API', () => {
  beforeAll(async () => {
    await db.delete(questions);
  });

  it('should return 200 when trying to see the leaderboard', async () => {
    const response = await request(app).get('/api/leaderboard');
    expect(response.body).toBeTypeOf('object');
    expect(response.status).toBe(200);
  });



  it('should return 401 when trying to check an user stat without valid token', async () => {
    const response = await request(app)
    .get("/api/leaderboard/user-standing")
    expect(response.status).toBe(401);
  });


  it('should return 200 when geting user-standing with valid token', async () => {
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDhjNDdhYS0zNGUzLTQ4MDQtYTA1Mi04NzRjZDU1M2E1NzciLCJpYXQiOjE3NjY5NDQ1ODQsImV4cCI6MTc2NzU0OTM4NH0._flBkh3uUAzAv05n-XoVR7hTLz_9S85dybdzynePnwg"
    const response = await request(app)
    .get("/api/leaderboard/user-standing")
    .set('Authorization', 'Bearer ' + token);
    expect(response.status).toBe(200);
  });

}); 