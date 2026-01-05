import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/db/db.js';
import { questions } from '../src/db/schema.js';
import request from 'supertest';
import app from '../src/app';



const questionBody = {
	"clubs": [
		{
			"logo": "https://media.api-sports.io/football/teams/157.png",
			"name": "Bayern Munich"
		},
		{
			"logo": "https://media.api-sports.io/football/teams/33.png",
			"name": "Manchester United"
		},
		{
			"logo": "https://media.api-sports.io/football/teams/1608.png",
			"name": "Chicago Fire"
		}
	],
	"difficulty": "hard",
  // "answer":"bastian schweinsteiger"
}

describe('Admin API', () => {
  beforeAll(async () => {
    await db.delete(questions);
  });

  it('should return 401 without specific header for admin', async () => {
    const response = await request(app).get('/api/admin/questions');
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(401);
  });

  it('should return 401 when trying to insert question without admin header', async () => {
    const response = await request(app).post('/api/admin/question');
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(401);
  });

  it('should return 400 when inserting question wihout any required value', async () => {
    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers);
    expect(response.body.error).toEqual("Invalid value");  
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(400);
  });

  it('should return 400 when inserting question wihout answer value', async () => {
    const questionBody = {
      "clubs": [
        {
          "logo": "https://media.api-sports.io/football/teams/157.png",
          "name": "Bayern Munich"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/33.png",
          "name": "Manchester United"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/1608.png",
          "name": "Chicago Fire"
        }
      ],
      "difficulty": "hard",
      // "answer":"bastian schweinsteiger"
    }

    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers)
      .send(questionBody);
    expect(response.body).toHaveProperty('error'); 
    expect(response.body.error).toEqual('Invalid value');  
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(400);
  });

   it('should return 400 when inserting question wihout difficulty value', async () => {
    const questionBody = {
      "clubs": [
        {
          "logo": "https://media.api-sports.io/football/teams/157.png",
          "name": "Bayern Munich"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/33.png",
          "name": "Manchester United"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/1608.png",
          "name": "Chicago Fire"
        }
      ],
      // "difficulty": "hard",
      "answer":"bastian schweinsteiger"
    }
    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers)
      .send(questionBody);
    expect(response.body).toHaveProperty('error'); 
    expect(response.body.error).toEqual("Difficulty must be easy, medium, or hard");  
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(400);
  });

  it('should return 400 when inserting question wihout clubs value', async () => {
    const questionBody = {
      "difficulty": "hard",
      "answer":"bastian schweinsteiger"
    }
    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers)
      .send(questionBody);
    expect(response.body).toHaveProperty('error'); 
    expect(response.body.error).toEqual("Clubs must be a non-empty array");  
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(400);
  });

  it('should return 400 when inserting question wihout proper format value', async () => {
    const questionBody = {
      "clubs": [
        {
          "logo": "https://media.api-sports.io/football/teams/157.png",
          // "name": "Bayern Munich"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/33.png",
          // "name": "Manchester United"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/1608.png",
          // "name": "Chicago Fire"
        }
      ],
      "difficulty": "hard",
      "answer":"bastian schweinsteiger"
    }
    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers)
      .send(questionBody);
    expect(response.body).toHaveProperty('error'); 
    expect(response.body.error).toEqual("Invalid value");  
    expect(response.body).toHaveProperty('error');
    expect(response.status).toBe(400);
  });

  it('should return 201 when inserting question wihout proper body', async () => {
    const questionBody = {
      "clubs": [
        {
          "logo": "https://media.api-sports.io/football/teams/157.png",
          "name": "Bayern Munich"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/33.png",
          "name": "Manchester United"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/1608.png",
          "name": "Chicago Fire"
        }
      ],
      "difficulty": "hard",
      "answer":"bastian schweinsteiger"
    }
    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers)
      .send(questionBody);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("difficulty"); 
    expect(response.body).toHaveProperty("clubs"); 
    expect(response.body.clubs).toBeTypeOf("object"); 
    expect(response.status).toBe(201);
  });

  it('should return 500 when inserting question which alreay exsist', async () => {
    const questionBody = {
      "clubs": [
        {
          "logo": "https://media.api-sports.io/football/teams/157.png",
          "name": "Bayern Munich"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/33.png",
          "name": "Manchester United"
        },
        {
          "logo": "https://media.api-sports.io/football/teams/1608.png",
          "name": "Chicago Fire"
        }
      ],
      "difficulty": "hard",
      "answer":"bastian schweinsteiger"
    }
    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .post('/api/admin/question')
      .set(headers)
      .send(questionBody);
    expect(response.body).toHaveProperty("error");
    expect(response.status).toBe(500);
  });

   it('should return 200 when try to get all questions', async () => {

    const headers = {
      [process.env.ADMIN_HEADER!]: process.env.ADMIN_API_KEY
    }
    const response = await request(app)
      .get('/api/admin/questions')
      .set(headers)
    expect(response.body).toHaveProperty("count");
    expect(response.body).toHaveProperty("questions");
    expect(response.status).toBe(200);
  });

}); 