require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const db = require('./db');
const models = require('./models');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

// 익스프레스 애플리케이션을 생성한다.
const app = express();
// DB에 연결한다.
db.connect(DB_HOST);
// 아폴로 서버를 설정한다.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models };
  },
});

// 아폴로 GraphQL 미들웨어를 적용하고 경로를 '/api'로 설정한다.
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
