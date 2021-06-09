const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const port = process.env.PORT || 4000;

let notes = [
  { id: '1', content: 'This is a note.', author: 'Adam Scott' },
  { id: '2', content: 'This is another note.', author: 'Harlow Everly' },
  { id: '3', content: 'Oh hey look, another note!', author: 'Riley Harrison' },
];

// GraphQL 스키마 언어로 스키마를 구성한다.
const typeDefs = gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Query {
    hello: String!
    notes: [Note!]!
    note(id: ID!): Note!
  }

  type Mutation {
    newNote(content: String!): Note!
  }
`;

// 스키마 필드를 위한 리졸버 함수를 제공한다.
const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
    notes: () => notes,
    note: (parent, args) => {
      return notes.find((note) => note.id === args.id);
    },
  },

  Mutation: {
    newNote: (parent, args) => {
      let noteValue = {
        id: String(notes.length + 1),
        content: args.content,
        author: 'Adam Scott',
      };
      notes.push(noteValue);
      return noteValue;
    },
  },
};

// 익스프레스 애플리케이션을 생성한다.
const app = express();
// 아폴로 서버를 설정한다.
const server = new ApolloServer({ typeDefs, resolvers });

// 아폴로 GraphQL 미들웨어를 적용하고 경로를 '/api'로 설정한다.
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
