import { gql } from 'apollo-server';

export default gql`
    type Ergebnis {
        id: Int!
        wert: Float
        schueler: Schueler!
        disziplin: Disziplin!
    }

    extend type Query {
        allErgebnis(idschueler: Int, iddisziplinen: Int): [Ergebnis!]
        ergebnis(id: Int!): Ergebnis
    }

    extend type Mutation {
        addErgebnis(wert: Float, idschueler: Int!, iddisziplin: Int!): Ergebnis!
        updateErgebnis(id: Int!, wert: Float, idschueler: Int, iddiziplin: Int): Ergebnis
        deleteErgebnis(id: Int!): Ergebnis
    }
`;
