import { gql } from 'apollo-server';

export default gql`
    type Disziplin {
        id: Int!
        name: String!
        best: String!
        einheit: String!
    }
    
    enum Best {
      high
      low
    }
    
    type DeleteDisziplinPayload {
        id: Int!
    }
    
    type allDisziplinPayload {
        total: Int
        disziplinen: [Disziplin!]
    }

    extend type Query {
        allDisziplin(name: String, offset: Int, limit: Int): allDisziplinPayload
        disziplin(id: Int!): Disziplin
    }

    extend type Mutation {
        addDisziplin(name: String!, best: Best!, einheit: String!): Disziplin!
        updateDisziplin(id: Int!, name: String, best: Best, einheit: String): Disziplin!
        deleteDisziplin(id: Int!): DeleteDisziplinPayload!
    }
`;
