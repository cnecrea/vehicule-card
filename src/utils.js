/**
 * Utilități — auto-descoperire entități.
 */

/**
 * Descoperă automat prefixul vehiculului din entitățile HA.
 * Caută pattern: sensor.vehicule_{prefix}_informatii
 */
function descoperiVehicule(hass) {
  const prefixe = new Set();
  const regex = /^sensor\.vehicule_(.+)_informatii$/;
  for (const eid of Object.keys(hass.states)) {
    const match = eid.match(regex);
    if (match) prefixe.add(match[1]);
  }
  return Array.from(prefixe).sort();
}

/**
 * Construiește entity_id complet din prefix și tip senzor.
 */
function entityId(prefix, tip) {
  return `sensor.vehicule_${prefix}_${tip}`;
}
