require('dotenv').config();

const models = require('../../models');
const db = require('../../db');
const seedUsers = require('./users');
const seedNotes = require('./notes');

const DB_HOST = process.env.DB_HOST;

const seed = async () => {
  console.log('Seeding Data.');

  db.connect(DB_HOST);

  // Seed Users
  const users = await models.User.create(await seedUsers());
  // Seed Notes
  await models.Note.create(await seedNotes(users));

  console.log('사용자 및 노트 데이터가 성공적으로 시딩되었습니다!');
  process.exit(0);
};

seed();

// module.exports = seed;
