require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server-express');

const gravatar = require('../utils/gravatar');

module.exports = {
  createNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        '노트를 생성하기 위해서는 계정에 접속해야 합니다!'
      );
    }

    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
    });
  },

  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        '노트를 삭제하기 위해서는 계정에 접속해야 합니다!'
      );
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError(
        '노트를 수정하기 위한 권한이 존재하지 않습니다!'
      );
    }

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

  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError(
        '노트를 삭제하기 위해서는 계정에 접속해야 합니다!'
      );
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError(
        '노트를 삭제하기 위한 권한이 존재하지 않습니다!'
      );
    }

    try {
      await note.remove();
      return true;
    } catch (err) {
      return false;
    }
  },

  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    let note = await models.Note.findById(id);
    const hasUser = note.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          new: true,
        }
      );
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          new: true,
        }
      );
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
