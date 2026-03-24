/**
 * Utilități — auto-descoperire entități + suport bilingv (RO / EN).
 */

/**
 * Mapare senzor RO → EN.
 * Cheile sunt numele românești (cele folosite intern de card),
 * valorile sunt echivalentul englez generat de HA când limba e EN.
 */
var SENSOR_MAP_RO_EN = {
  informatii:        'information',
  kilometraj:        'mileage',
  rca:               'rca',
  casco:             'casco',
  itp:               'itp',
  rovinieta:         'vignette',
  impozit:           'tax',
  leasing:           'leasing',
  revizie_ulei:      'oil_service',
  distributie:       'timing_belt',
  anvelope:          'tires',
  baterie:           'battery',
  placute_frana:     'brake_pads',
  discuri_frana:     'brake_discs',
  trusa_prim_ajutor: 'first_aid_kit',
  extinctor:         'fire_extinguisher',
  cost_total:        'total_cost'
};

/**
 * Mapare inversă EN → RO (construită automat).
 */
var SENSOR_MAP_EN_RO = {};
(function() {
  for (var ro in SENSOR_MAP_RO_EN) {
    if (SENSOR_MAP_RO_EN.hasOwnProperty(ro)) {
      SENSOR_MAP_EN_RO[SENSOR_MAP_RO_EN[ro]] = ro;
    }
  }
})();

/**
 * Descoperă automat prefixele vehiculelor din entitățile HA.
 * Caută ambele pattern-uri: _informatii (RO) și _information (EN).
 */
function descoperiVehicule(hass) {
  const prefixe = new Set();
  const regexRO = /^sensor\.vehicule_(.+)_informatii$/;
  const regexEN = /^sensor\.vehicule_(.+)_information$/;
  for (const eid of Object.keys(hass.states)) {
    const match = eid.match(regexRO) || eid.match(regexEN);
    if (match) prefixe.add(match[1]);
  }
  return Array.from(prefixe).sort();
}

/**
 * Construiește entity_id complet din prefix și tip senzor.
 */
function entityId(prefix, tip) {
  return 'sensor.vehicule_' + prefix + '_' + tip;
}

/**
 * Rezolvă entity_id-ul real existent în HA.
 * Încearcă mai întâi varianta RO, apoi EN.
 * Returnează entity_id-ul care există, sau varianta RO ca fallback.
 */
function resolveEntityId(hass, prefix, tipRO) {
  var eidRO = entityId(prefix, tipRO);
  var s = hass.states[eidRO];
  if (s && s.state !== 'unavailable' && s.state !== 'unknown') {
    return eidRO;
  }
  var tipEN = SENSOR_MAP_RO_EN[tipRO];
  if (tipEN) {
    var eidEN = entityId(prefix, tipEN);
    var sEN = hass.states[eidEN];
    if (sEN && sEN.state !== 'unavailable' && sEN.state !== 'unknown') {
      return eidEN;
    }
  }
  return eidRO;
}

/**
 * Verifică dacă o entitate există (RO sau EN) și returnează entity_id-ul valid.
 * Returnează null dacă nu există în nicio variantă.
 */
function resolveIfExists(hass, prefix, tipRO) {
  var eidRO = entityId(prefix, tipRO);
  var s = hass.states[eidRO];
  if (s && s.state !== 'unavailable' && s.state !== 'unknown') {
    return eidRO;
  }
  var tipEN = SENSOR_MAP_RO_EN[tipRO];
  if (tipEN) {
    var eidEN = entityId(prefix, tipEN);
    var sEN = hass.states[eidEN];
    if (sEN && sEN.state !== 'unavailable' && sEN.state !== 'unknown') {
      return eidEN;
    }
  }
  return null;
}
