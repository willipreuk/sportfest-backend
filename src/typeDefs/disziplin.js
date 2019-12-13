import { gql } from 'apollo-server';

export default gql`
    type Disziplin {
        id: Int!
        name: String!
    }
    
    type DeleteDisziplinPayload {
        id: Int!
    }

    extend type Query {
        allDisziplin(name: String): [Disziplin!]
        disziplin(id: Int!): Disziplin
    }

    extend type Mutation {
        addDisziplin(name: String!): Disziplin!
        updateDisziplin(id: Int!, name: String): Disziplin
        deleteDisziplin(id: Int!): DeleteDisziplinPayload
    }
`;
