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
    }
    
    type DeletSchuelerPayload {
        id: Int!
    }
    
    type UploadSchuelerPayload {
        schuelerCount: Int!
    }

    extend type Query {
        allSchueler(idklasse: Int): [Schueler!]
        schueler(id: Int!): Schueler
    }
    
    extend type Mutation {
        addSchueler(vorname: String!, nachname: String!, geschlecht: Geschlecht, idklasse: Int!): Schueler!
        deleteSchueler(id: Int!): DeletSchuelerPayload!
        updateSchueler(id: Int!, vorname: String, nachname: String, geschlecht: Geschlecht, idklasse: Int): Schueler!
        uploadSchueler(file: Upload!): UploadSchuelerPayload!
    }
`;
