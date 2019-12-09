import { gql } from 'apollo-server';

export default gql`
    type Disziplin {
        id: Int!
        name: String!
    }

    extend type Query {
        allDisziplin(name: String): [Disziplin!]
        diziplin(id: Int!): Disziplin
    }

    extend type Mutation {
        addDiziplin(name: String!): Disziplin!
        updateDiziplin(id: Int!, name: String): Disziplin
        deleteDiziplin(id: Int!): Disziplin
    }

`;
