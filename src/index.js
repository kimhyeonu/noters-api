require('dotenv').config();

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const db = require('./db');
const models = require('./models');

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('토큰 발급에 문제가 발생하였습니다!');
    }
  }
};

// 익스프레스 애플리케이션을 생성한다.
const app = express();
// DB에 연결한다.
db.connect(DB_HOST);
// 아폴로 서버를 설정한다.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // 요청 헤더로부터 토큰을 가져온다.
    const token = req.headers.authorization;
    const user = getUser(token);
    console.log(`user: ${user}`);
    // context에 models와 user를 추가한다.
    return { models, user };
  },
});

// 아폴로 GraphQL 미들웨어를 적용하고 경로를 '/api'로 설정한다.
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
