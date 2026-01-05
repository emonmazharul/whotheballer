import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/db/db.js';
import { questions } from '../src/db/schema.js';
import request from 'supertest';
import app from '../src/app';

const newQuestion = {
  "answer": "Kevin De Bruyne",
  answerToken:"soemasljasfjasflsfda;;jasdfasdasddasfasdfffffffffffffffffffffffffffasdfasdfffff",
  "difficulty": "medium",
  "clubs": [
    {
      "name": "Genk",
      "logo": "https://media.api-sports.io/football/teams/558.png"
    },
    {
      "name": "Chelsea",
      "logo": "https://media.api-sports.io/football/teams/49.png"
    },
    {
      "name": "Werder Bremen",
      "logo": "https://media.api-sports.io/football/teams/162.png"
    },
    {
      "name": "VfL Wolfsburg",
      "logo": "https://media.api-sports.io/football/teams/161.png"
    },
    {
      "name": "Manchester City",
      "logo": "https://media.api-sports.io/football/teams/50.png"
    },
    {
      "name": "SSC Napoli",
      "logo": "https://media.api-sports.io/football/teams/492.png"
    }
  ]
}



describe('Game API', () => {
  let questionValidId  = '';
  beforeAll(async () => {
    const q = await db.insert(questions).values(newQuestion).returning();
    questionValidId = q[0].id;
  });
  afterAll(async () => {
    await db.delete(questions);
    questionValidId = '';
  });

//   it('should return 400 when the question table is empty ', async () => {
//     const response = await request(app).get('/api/game/question');
//     expect(response.body).toBeTypeOf('object');
//     expect(response.body).toHaveProperty('error');

//     expect(response.status).toBe(400);
//   });

  it('should return 200 when trying to get an question', async () => {
    const response = await request(app).get('/api/game/question');
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("id");

    expect(response.status).toBe(200);
  });


  it('should return 200 when trying to get an question with a set difficulty ', async () => {
    const query = `difficulty=medium`;
    const response = await request(app).get('/api/game/question?'+query);
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("id");

    expect(response.status).toBe(200);
  });

  //   return 400 when diffculty is not set essy|medium|hard
  it('should return 400 when trying to get an question with a invaild difficulty  query', async () => {
    const query = `difficulty=something`;
    const response = await request(app).get('/api/game/question?'+query);
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("error");

    expect(response.status).toBe(400);
  });


  // return 400 when diffculty is not set essy|medium|hard
  it('should return 400 when no questions is available', async () => {
    const query = `difficulty=hard`;
    const response = await request(app).get('/api/game/question?'+query);
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("error");

    expect(response.status).toBe(400);
  });

  // return 400 when diffculty is not set essy|medium|hard
  it('should return 400 when requied body type is missing', async () => {
    const response = await request(app).post('/api/game/guess');
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("error");

    expect(response.status).toBe(400);
  });

  // return 400 when diffculty is not set essy|medium|hard
  it('should return 400 when requied body question type mismatch', async () => {
    const response = await request(app)
    .post('/api/game/guess')
    .set({
        questionId:'nouuid',
    })
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("error");

    expect(response.status).toBe(400);
  });


  it('should return 400 when requied body guess is missing', async () => {
    const response = await request(app)
    .post('/api/game/guess')
    .set({
        questionId:'3e13e94c-e41a-11f0-97a4-b3684d3b6ec0',
    })

    // expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("error");

    expect(response.status).toBe(400);
  });


  it('should return 200 when question id is valid and body is properly type', async () => {
    
    const response = await request(app)
    .post('/api/game/guess')
    .send({
        questionId:questionValidId,
        guess:"Kevin De Bruyne",
    })
    // expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("correct");
    expect(response.body.correct).toEqual(true);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(200);
  });


  it('should return 200 and return that anwer is false when the answer be false', async () => {
    
    const response = await request(app)
    .post('/api/game/guess')
    .send({
        questionId:questionValidId,
        guess:"Kevin De Bruyne",
    })
    // expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("correct");
    expect(response.body.correct).toEqual(false);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(200);
  });

  // it should return 401 when the user token is not valid
  it('should return 200 and when a loged in user anser correct', async () => {
    
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDhjNDdhYS0zNGUzLTQ4MDQtYTA1Mi04NzRjZDU1M2E1NzciLCJpYXQiOjE3NjY5NDQ1ODQsImV4cCI6MTc2NzU0OTM4NH0._flBkh3uUAzAv05n-XoVR7hTLz_9S85dybdzynePnwg"
    
    const response = await request(app)
    .post('/api/game/guess')
    .set('Authorization', 'Bearer ' + token)
    .send({
        questionId:questionValidId,
        guess:"Kevin De Bruyne",
    })
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("point");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("correct");
    expect(response.status).toBe(200);
  });

  it('should return 423 and when a loged in user anser question twice', async () => {
    
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMDhjNDdhYS0zNGUzLTQ4MDQtYTA1Mi04NzRjZDU1M2E1NzciLCJpYXQiOjE3NjY5NDQ1ODQsImV4cCI6MTc2NzU0OTM4NH0._flBkh3uUAzAv05n-XoVR7hTLz_9S85dybdzynePnwg"
    
    const response = await request(app)
    .post('/api/game/guess')
    .set('Authorization', 'Bearer ' + token)
    .send({
        questionId:questionValidId,
        guess:"Kevin De Bruyne",
    })
    expect(response.body).toBeTypeOf('object');
    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(423);
  });

}); 