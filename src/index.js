const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const port = process.env.PORT || 4000;

// GraphQL 스키마 언어로 스키마를 구성한다.
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// 스키마 필드를 위한 리졸버 함수를 제공한다.
const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
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
