import { gql } from 'apollo-server';

export default gql`
    type Massstab {
        id: Int!
        disziplin: Disziplin!
        geschlecht: Geschlecht!
        punkte: Int!
        werte: Float!
        klassenStufe: Int!
    }
    
    type DeleteMassstabPayload {
        id: Int!
    }
    
    type AllMassstaebePayload {
        total: Int!
        massstaebe: [Massstab!]
    }

    extend type Query {
        allMassstaebe(iddisziplin: Int, klassenStufe: Int, offset: Int, limit: Int): AllMassstaebePayload
        massstab(geschlecht: Geschlecht!, klassenStufe: Int!, iddisziplin: Int!): [Massstab!]
    }

    extend type Mutation {
        addMassstab(iddisziplin: Int!, geschlecht: Geschlecht!, punkte: Int!, werte: Float!, klassenStufe: Int!): Massstab!
        updateMassstab(id: Int!, iddisziplin: Int, geschlecht: Geschlecht, punkte: Int, werte: Float, klassenStufe: Int): Massstab!
        deleteMassstab(id: Int!): DeleteMassstabPayload!
    }
`;
