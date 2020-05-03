import { merge } from 'lodash';

import userResolver from './user';
import klassenResolver from './klassen';
import schuelerResolver from './schueler';
import disziplinResolver from './disziplin';
import ergebnisResolver from './ergebnis';
import massstaebeResolver from './massstaebe';
import auswertung from './auswertung';
import klassenErgebnis from './klassenErgebnis';

export default merge(
  userResolver,
  klassenResolver,
  schuelerResolver,
  disziplinResolver,
  ergebnisResolver,
  massstaebeResolver,
  auswertung,
  klassenErgebnis,
);
