import { gql } from 'apollo-server';

export default gql`
    type Klasse {
        id: Int!
        stufe: Int!
        name: Int!
    }

    type DeleteKlassePayload {
        id: Int!
    }

    extend type Query {
        allklassen(stufe: Int): [Klasse!]
        klasse(id: Int!): Klasse
    }

    extend type Mutation {
        addKlasse(stufe: Int!, name: Int!): Klasse!
        deleteKlasse(id: Int!): DeleteKlassePayload!
        updateKlasse(id: Int!, stufe: Int, name: Int): Klasse!
    }
`;