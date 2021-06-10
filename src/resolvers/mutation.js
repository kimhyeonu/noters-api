require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server-express');

const gravatar = require('../utils/gravatar');

module.exports = {
  createNote: async (parent, args, { models }) => {
    return await models.Note.create({
      content: args.content,
      author: 'Adam Scott',
    });
  },

  updateNote: async (parent, { content, id }, { models }) => {
    return await models.Note.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );
  },

  deleteNote: async (parent, { id }, { models }) => {
    try {
      await models.Note.findOneAndRemove({ _id: id });
      return true;
    } catch (err) {
      return false;
    }
  },

  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const avatar = gravatar(email);

    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });

      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.error(err);
      throw new Error('계정을 생성하는 도중에 오류가 발생하였습니다!');
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      throw new AuthenticationError('사용자가 존재하지 않습니다!');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('잘못된 패스워드입니다.');
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
};
