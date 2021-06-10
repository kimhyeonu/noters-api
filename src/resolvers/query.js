module.exports = {
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  },

  notes: async (parent, args, { models }) => {
    return await models.Note.find();
  },

  user: async (parent, { username }, { models }) => {
    return await models.User.findOne({ username });
  },

  users: async (parent, args, { models }) => {
    return await models.User.find({});
  },

  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
};
