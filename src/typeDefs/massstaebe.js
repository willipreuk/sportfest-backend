import { gql } from 'apollo-server';

export default gql`
    type Massstab {
        id: Int!
        disziplin: Disziplin!
        geschlecht: Geschlecht!
        punkte: Int!
        wert: Float!
        klassenStufe: Int!
    }
    
    type DeleteMassstabPayload {
        id: Int!
    }

    extend type Query {
        allMassstab(iddisziplinen: Int, klassenStufe: Int): [Massstab!]
        massstab(geschlecht: Geschlecht!, klassenStufe: Int!, iddisziplinen: Int!): [Massstab!]
    }

    extend type Mutation {
        addMassstab(iddisziplinen: Int!, geschlecht: Geschlecht!, punkte: Int!, werte: Float!, klassenStufe: Int!): Massstab!
        updateMassstab(id: Int!, iddisziplinen: Int, geschlecht: Geschlecht, punkte: Int, werte: Float, klassenStufe: Int): Massstab
        deleteMassstab(id: Int!): DeleteMassstabPayload
    }
`;
