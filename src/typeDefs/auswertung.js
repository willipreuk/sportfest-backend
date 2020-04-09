import { gql } from 'apollo-server';

export default gql`
    type Auswertung {
        disziplin: Disziplin!
        wert: Float!
        punkte: Int!
    }
    
    type AuswertungSchueler {
        schueler: Schueler!
        note: Int!
        punkte: Int!
        ergebnisse: [Auswertung!]
    }

    type AuswertungKlasse {
        schueler: [AuswertungSchueler!]
        durchschnitt: Float!
    }
    
    type AuswertungStufe {
        bestM: [AuswertungSchueler!]!
        bestW: [AuswertungSchueler!]!
    }
    
    type AuswertungStufen {
        bestM: [AuswertungSchueler!]!
        bestW: [AuswertungSchueler!]!
        besteKlassen: [AuswertungKlasse!]!
    }
  
    extend type Query {
        auswertungKlasse(id: Int!): AuswertungKlasse
        auswertungSchueler(id: Int!): AuswertungSchueler
        auswertungStufe(stufe: Int!): AuswertungStufe
        auswertungStufen(von: Int!, bis: Int!): AuswertungStufen
    }
`;
