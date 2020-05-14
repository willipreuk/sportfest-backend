import { gql } from 'apollo-server';

export default gql`
    type Disziplin {
        id: Int!
        name: String!
        best: String!
        einheit: String!
        klasse: Boolean!
        highestWert: Float!
        lowestWert: Float!
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
        addDisziplin(name: String!, best: Best!, einheit: String!, klasse: Boolean!): Disziplin!
        updateDisziplin(id: Int!, name: String, best: Best, einheit: String, klasse: Boolean): Disziplin!
        deleteDisziplin(id: Int!): DeleteDisziplinPayload!
    }
`;
