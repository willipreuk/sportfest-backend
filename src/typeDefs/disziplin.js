import { gql } from 'apollo-server';

export default gql`
    type Disziplin {
        id: Int!
        name: String!
        best: String!
        einheit: String!
    }
    
    type DeleteDisziplinPayload {
        id: Int!
    }
    
    type allDisziplinPayload {
        total: Int
        disziplinen: [Disziplin!]
    }

    extend type Query {
        allDisziplin(name: String): allDisziplinPayload
        disziplin(id: Int!): Disziplin
    }

    extend type Mutation {
        addDisziplin(name: String!): Disziplin!
        updateDisziplin(id: Int!, name: String): Disziplin!
        deleteDisziplin(id: Int!): DeleteDisziplinPayload!
    }
`;
