import { gql } from 'apollo-server';

export default gql`
    enum Rolle {
        admin
        leiter
        schreiber
    }

    type User {
        id: Int!
        username: String!
        password: String!
        rolle: Rolle!
    }

    type CreateUserPayload {
        username: String!
        rolle: String!
        id: Int!
    }

    type DeleteUserPayload {
        id: Int!
    }

    type UpdateUserPayload {
        id: Int!
        username: String!
        rolle: String!
    }

    type LoginPayload {
        jwt: String!
    }

    type Query {
        allUser: [User!]
        user(username: String, id: Int): User
        login(username: String!, password: String!): LoginPayload
    }

    type Mutation {
        addUser(username: String!, password: String!, rolle: Rolle!): CreateUserPayload!
        deleteUser(id: Int!): DeleteUserPayload!
        updateUser(id: Int!, username: String, password: String, rolle: Rolle): UpdateUserPayload!
    }
`;
