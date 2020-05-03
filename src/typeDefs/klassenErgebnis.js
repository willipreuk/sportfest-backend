import { gql } from 'apollo-server';

export default gql`
    type KlassenErgebnis {
        id: Int!
        klasse: Klasse!
        disziplin: Disziplin!
        wert: Float
    }
    
    type DeleteKlassenErgebnisPayload {
        id: Int!
    }
  
    extend type Query {
        allKlassenErgebnis: [KlassenErgebnis!]
        klassenErgebnis(id: Int!): KlassenErgebnis
    }
  
    extend type Mutation {
        updateKlassenErgebnis(idklasse: Int, iddisziplin: Int, wert: Float): KlassenErgebnis
        deleteKlassenErgebnis(id: Int!): DeleteKlassenErgebnisPayload
    }
`;
