import { gql } from 'apollo-server';

export default gql`
    type Massstab {
        id: Int!
        diziplin: Disziplin!
        geschlecht: Geschlecht!
        punkte: Int!
        wert: Float!
        klassen_stufe: Int!
    }

    extend type Query {
        allMassstab(iddisziplin: Int, klassen_stufe: Int): [Massstab!]
        massstab(id: Int!): Massstab
    }

    extend type Mutation {
        addMassstab(iddisziplin: Int!, geschlecht: Geschlecht!, punkte: Int!, wert: Float!, klassen_stufe: Int!): Massstab!
        updateMassstab(id: Int!, iddisziplin: Int, geschlecht: Geschlecht, punkte: Int, wert: Float, klassen_stufe: Int): Massstab
        deleteMassstab(id: Int!): Massstab
    }
`;
