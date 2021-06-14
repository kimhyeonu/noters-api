const faker = require('faker');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const seedNotes = async (users) => {
  console.log('Seeding Notes.');

  let notes = [];
  const noteNumber = 25;

  for (let i = 0; i < noteNumber; i++) {
    let randomNumber = [Math.floor(Math.random() * users.length)];
    let content = '';

    const response = await fetch(
      'https://jaspervdj.be/lorem-markdownum/markdown.txt'
    );

    if (response.ok) {
      content = await response.text();
    } else {
      content = faker.lorem.paragraph();
    }

    let note = {
      content,
      author: mongoose.Types.ObjectId(users[randomNumber]._id),
      favoriteCount: 0,
      favoritedBy: [],
    };

    notes.push(note);
  }

  return notes;
};

module.exports = seedNotes;
