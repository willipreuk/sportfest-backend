import { gql } from 'apollo-server';

export default gql`
    type Ergebnis {
        id: Int!
        wert: Float
        schueler: Schueler!
        disziplin: Disziplin!
    }
    
    type DeleteErgebnisPayload {
        id: Int!
    }

    extend type Query {
        allErgebnis(idschueler: Int, iddisziplinen: Int): [Ergebnis!]
        ergebnis(id: Int!): Ergebnis
    }

    extend type Mutation {
        updateErgebnis(wert: Float, idschueler: Int, iddisziplinen: Int): Ergebnis!
        deleteErgebnis(id: Int!): DeleteErgebnisPayload!
    }
`;
