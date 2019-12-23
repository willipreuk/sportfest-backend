import { gql } from 'apollo-server';

export default gql`
    enum Geschlecht {
        m
        w
    }

    type Schueler {
        id: Int!
        vorname: String!
        nachname: String!
        geschlecht: Geschlecht!
        klasse: Klasse!
        status: String
    }
    
    type DeleteSchuelerPayload {
        id: Int!
    }
    
    type UploadSchuelerPayload {
        schuelerCount: Int!
    }
    
    type allSchuelerPayload {
        total: Int
        schueler: [Schueler!]
    }

    extend type Query {
        allSchueler(idklasse: Int, offset: Int, limit: Int): allSchuelerPayload
        schueler(id: Int!): Schueler
    }
    
    extend type Mutation {
        addSchueler(vorname: String!, nachname: String!, geschlecht: Geschlecht, idklasse: Int!): Schueler!
        deleteSchueler(id: Int!): DeleteSchuelerPayload!
        updateSchueler(id: Int!, vorname: String, nachname: String, geschlecht: Geschlecht, idklasse: Int, status: String): Schueler!
        uploadSchueler(file: Upload!): UploadSchuelerPayload!
    }
`;
