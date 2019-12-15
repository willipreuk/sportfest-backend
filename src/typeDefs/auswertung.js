import { gql } from 'apollo-server';

export default gql`
    type AuswertungSchueler {
        schueler: Schueler!
        note: Int!
        punkte: Int!
        ergebnisse: [Ergebnis!]
    }
    
    type AuswertungStufe {
        stufe: Int!
        bestM: [AuswertungSchueler!]!
        bestW: [AuswertungSchueler!]!
    }
    
    type AuswertungStufen {
        von: Int!
        bis: Int!
        bestM: [AuswertungSchueler!]!
        bestW: [AuswertungSchueler!]!
    }
  
    extend type Query {
        auswertungKlasse(id: Int!): [AuswertungSchueler!]
        auswertungSchueler(id: Int!): AuswertungSchueler
        auswertungStufe(stufe: Int!): AuswertungStufe
        auswertungStufen(von: Int!, bis: Int!): AuswertungStufen
    }
`;
