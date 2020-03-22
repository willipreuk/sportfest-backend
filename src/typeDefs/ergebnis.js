import { gql } from 'apollo-server';

export default gql`
    type Ergebnis {
        id: Int!
        wert: Float
        schueler: Schueler!
        disziplin: Disziplin!
        allWerte: [Float!]
    }
    
    type DeleteErgebnisPayload {
        id: Int!
    }

    extend type Query {
        allErgebnis(idschueler: Int, iddisziplin: Int): [Ergebnis!]
        allErgebnisByKlasse(idklasse: Int!, iddisziplin: Int!): [Ergebnis!]
        ergebnis(id: Int!): Ergebnis
    }

    extend type Mutation {
        updateErgebnis(wert: Float, idschueler: Int, iddisziplin: Int, allWerte: String): Ergebnis!
        deleteErgebnis(id: Int!): DeleteErgebnisPayload!
    }
`;
