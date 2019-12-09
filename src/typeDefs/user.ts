import { gql } from 'apollo-server';

export default gql`
    enum Rolle {
        admin
        leiter
        schreiber
    }

    type User {
        username: String!
        password: String!
        rolle: Rolle!
    }

    type Query {
        allUsers: [User!]!
        user(username: String!): User
    }

    type Mutation {
        addUser(username: String!, password: String!, rolle: Rolle!): User!
        deleteUser(rolle: Rolle): User!
        updateUser(username: String!, password: String!, rolle: Rolle!): User!
    }
`;
