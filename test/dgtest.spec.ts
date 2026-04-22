import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('D&D Combat API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dnd-combat-api-7f3660dcecb1.herokuapp.com';

  const character = {
    name: 'Kaya',
    strength: 10,
    dexterity: 7,
    hitPoints: 11,
    armorClass: 12
  };

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  // =========================
  // MONSTERS
  // =========================
  describe('MONSTERS', () => {

    it('Get monster names (page 1)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/names/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: { type: 'string' }
        });
    });

    it('Get monster details (goblin)', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/monsters/goblin`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            name: { type: 'string' }
          },
          required: ['name']
        });
    });

  });

  // =========================
  // CHARACTERS
  // =========================
  describe('CHARACTERS', () => {

    it('Get example character', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/characters/example`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            name: { type: 'string' },
            strength: { type: 'number' },
            dexterity: { type: 'number' },
            hitPoints: { type: 'number' },
            armorClass: { type: 'number' }
          },
          required: ['name', 'strength', 'dexterity', 'hitPoints', 'armorClass']
        });
    });

    it('Validate character (valid)', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson(character)
        .expectStatus(StatusCodes.OK);
    });

    it('Validate character (invalid)', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/characters/check`)
        .withJson({ name: '' })
        .expectStatus(StatusCodes.BAD_REQUEST); // ✅ correto
    });

  });

  // =========================
  // BATTLE
  // =========================
  describe('BATTLE', () => {

    it('Battle with goblin', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/battle/goblin`)
        .withJson(character)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            winner: { type: 'string' },
            rounds: { type: 'number' }
          },
          required: ['winner']
        });
    });

    it('Battle with invalid monster', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/battle/invalid-monster`)
        .withJson(character)
        .expectStatus(500) // ⚠️ BUG da API
        .expectJsonLike({
          error: 'Internal Server Error'
        });
    });

  });

});