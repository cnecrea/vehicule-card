/**
 * Vehicule Card v0.0.0
 * https://github.com/cnecrea/vehicule-card
 * Meta-card pentru integrarea Vehicule — Home Assistant
 * Necesită: button-card, stack-in-card, bubble-card, card-mod, mini-graph-card
 */

// ── constants.js ────────────────────────────────────────────────

/**
 * Constante — versiune, secțiuni disponibile.
 */
const VEHICULE_CARD_VERSION = '0.0.0';

// Secțiunile disponibile
const SECTIUNI = ['informatii', 'documente', 'mentenanta', 'echipament', 'grafic'];


// ── utils.js ────────────────────────────────────────────────────

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


// ── configs.js ──────────────────────────────────────────────────

/**
 * Generatoare de configurații — traduc 1:1 YAML-ul din LOVELACE.md
 * în obiecte JS parametrizate cu prefixul vehiculului.
 *
 * Fiecare funcție primește (prefix, hass) și returnează un config object.
 * Cardurile sunt incluse DOAR dacă entitatea corespunzătoare există în HA.
 */

// ── Verificare existență entitate ──

function _entityExists(hass, eid) {
  const s = hass.states[eid];
  return s && s.state !== 'unavailable' && s.state !== 'unknown';
}

// ── Helpers comuni ──

function _stackWrapper(cards) {
  return {
    type: 'custom:stack-in-card',
    mode: 'vertical',
    card_mod: {
      style: 'ha-card {\n  border-radius: 10px;\n  overflow: hidden;\n  box-shadow: none;\n  border: none;\n}'
    },
    cards: cards
  };
}

function _separator(name) {
  return {
    type: 'custom:bubble-card',
    card_type: 'separator',
    icon: '',
    name: name,
    sub_button: { main: [], bottom: [] }
  };
}

function _headerCard(entity, customField) {
  return {
    type: 'custom:button-card',
    entity: entity,
    show_state: false,
    show_name: false,
    show_icon: false,
    show_label: false,
    tap_action: { action: 'more-info' },
    custom_fields: { header: customField },
    styles: {
      card: [
        { background: 'transparent' },
        { border: 'none' },
        { 'box-shadow': 'none' },
        { padding: '22px 22px 30px' }
      ],
      grid: [
        { 'grid-template-areas': '"header"' },
        { 'grid-template-columns': '1fr' }
      ],
      custom_fields: { header: [{ width: '100%' }] }
    }
  };
}

function _footerCard(entity, customField) {
  return {
    type: 'custom:button-card',
    entity: entity,
    show_state: false,
    show_name: false,
    show_icon: false,
    show_label: false,
    tap_action: { action: 'more-info' },
    custom_fields: { info: customField },
    styles: {
      card: [
        { background: 'transparent' },
        { border: 'none' },
        { 'box-shadow': 'none' },
        { padding: '0 22px 16px' }
      ],
      grid: [
        { 'grid-template-areas': '"info"' },
        { 'grid-template-columns': '1fr' }
      ],
      custom_fields: { info: [{ width: '100%' }] }
    }
  };
}

function _indicatorZile(entity, icon, name) {
  return {
    type: 'custom:button-card',
    entity: entity,
    icon: icon,
    name: name,
    show_state: false,
    show_name: true,
    show_label: true,
    color_type: 'card',
    color: "[[[\n        const z = parseInt(entity.state) || 0;\n        if (z < 0) return 'rgba(239,79,26,0.15)';\n        if (z < 30) return 'rgba(255,152,0,0.15)';\n        return 'rgba(76,175,80,0.15)';\n      ]]]",
    label: "[[[\n        const z = parseInt(entity.state);\n        if (isNaN(z)) return '—';\n        return z < 0 ? 'EXPIRAT' : z + ' zile';\n      ]]]",
    tap_action: { action: 'more-info' },
    styles: {
      card: [
        { 'border-radius': '10px' },
        { padding: '20px 8px' },
        { 'box-shadow': 'none' },
        { border: 'none' }
      ],
      icon: [
        { width: '34px' },
        { color: "[[[\n              const z = parseInt(entity.state) || 0;\n              if (z < 0) return 'rgb(239,79,26)';\n              if (z < 30) return 'rgb(255,152,0)';\n              return 'rgb(76,175,80)';\n            ]]]" }
      ],
      label: [
        { 'font-size': '13px' },
        { 'font-weight': '600' },
        { color: "[[[\n              const z = parseInt(entity.state) || 0;\n              if (z < 0) return 'rgb(239,79,26)';\n              if (z < 30) return 'rgb(255,152,0)';\n              return 'rgb(76,175,80)';\n            ]]]" }
      ],
      name: [
        { 'font-size': '13px' },
        { color: 'var(--secondary-text-color)' },
        { 'margin-top': '4px' }
      ]
    }
  };
}

function _indicatorZileLeasing(entity) {
  return {
    type: 'custom:button-card',
    entity: entity,
    icon: 'mdi:file-document-outline',
    name: 'Leasing',
    show_state: false,
    show_name: true,
    show_label: true,
    color_type: 'card',
    color: "[[[\n        const z = parseInt(entity.state) || 0;\n        if (z < 0) return 'rgba(239,79,26,0.15)';\n        if (z < 30) return 'rgba(255,152,0,0.15)';\n        return 'rgba(156,39,176,0.15)';\n      ]]]",
    label: "[[[\n        const z = parseInt(entity.state);\n        if (isNaN(z)) return '—';\n        return z < 0 ? 'EXPIRAT' : z + ' zile';\n      ]]]",
    tap_action: { action: 'more-info' },
    styles: {
      card: [
        { 'border-radius': '10px' },
        { padding: '20px 8px' },
        { 'box-shadow': 'none' },
        { border: 'none' }
      ],
      icon: [
        { width: '34px' },
        { color: "[[[\n              const z = parseInt(entity.state) || 0;\n              if (z < 0) return 'rgb(239,79,26)';\n              if (z < 30) return 'rgb(255,152,0)';\n              return 'rgb(156,39,176)';\n            ]]]" }
      ],
      label: [
        { 'font-size': '13px' },
        { 'font-weight': '600' },
        { color: "[[[\n              const z = parseInt(entity.state) || 0;\n              if (z < 0) return 'rgb(239,79,26)';\n              if (z < 30) return 'rgb(255,152,0)';\n              return 'rgb(156,39,176)';\n            ]]]" }
      ],
      name: [
        { 'font-size': '13px' },
        { color: 'var(--secondary-text-color)' },
        { 'margin-top': '4px' }
      ]
    }
  };
}

function _indicatorKm(entity, icon, name, pragAtentie, pragPericol) {
  return {
    type: 'custom:button-card',
    entity: entity,
    icon: icon,
    name: name,
    show_state: false,
    show_name: true,
    show_label: true,
    color_type: 'card',
    color: "[[[\n        const v = parseInt(entity.state) || 0;\n        if (v < " + pragPericol + ") return 'rgba(239,79,26,0.15)';\n        if (v < " + pragAtentie + ") return 'rgba(255,152,0,0.15)';\n        return 'rgba(33,150,243,0.15)';\n      ]]]",
    label: "[[[\n        const v = parseInt(entity.state);\n        if (isNaN(v)) return '—';\n        return v < 0 ? 'DEPĂȘIT' : v.toLocaleString('ro-RO') + ' km';\n      ]]]",
    tap_action: { action: 'more-info' },
    styles: {
      card: [
        { 'border-radius': '10px' },
        { padding: '20px 8px' },
        { 'box-shadow': 'none' },
        { border: 'none' }
      ],
      icon: [
        { width: '34px' },
        { color: "[[[\n              const v = parseInt(entity.state) || 0;\n              if (v < " + pragPericol + ") return 'rgb(239,79,26)';\n              if (v < " + pragAtentie + ") return 'rgb(255,152,0)';\n              return 'rgb(33,150,243)';\n            ]]]" }
      ],
      label: [
        { 'font-size': '13px' },
        { 'font-weight': '600' },
        { color: "[[[\n              const v = parseInt(entity.state) || 0;\n              if (v < " + pragPericol + ") return 'rgb(239,79,26)';\n              if (v < " + pragAtentie + ") return 'rgb(255,152,0)';\n              return 'rgb(33,150,243)';\n            ]]]" }
      ],
      name: [
        { 'font-size': '13px' },
        { color: 'var(--secondary-text-color)' },
        { 'margin-top': '4px' }
      ]
    }
  };
}


// ══════════════════════════════════════════
// 1. INFORMAȚII VEHICUL
// ══════════════════════════════════════════

function configInformatii(prefix, hass) {
  var p = prefix;
  var eid = entityId(p, 'informatii');
  if (!_entityExists(hass, eid)) return null;

  return {
    type: 'vertical-stack',
    cards: [
      _separator('VEHICUL ' + p.toUpperCase()),
      _stackWrapper([
        // Header
        _headerCard(eid, "[[[\n            var attr = entity.attributes || {};\n            var marca = attr['Marcă'] || '';\n            var model = attr['Model'] || '';\n            var titlu = (marca + ' ' + model).trim() || entity.state || '—';\n            var combustibil = attr['Combustibil'] || '';\n            var an = attr['An fabricație'] || '';\n            var motorizare = attr['Motorizare'] || '';\n            var detail = [combustibil, motorizare, an].filter(Boolean).join(' · ');\n            return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:rgba(33,150,243,0.15);display:flex;align-items:center;justify-content:center;\"><ha-icon icon=mdi:car style=\"width:28px;height:28px;color:rgb(33,150,243);\"></ha-icon></div><div style=\"text-align:right;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Vehicul</div><div style=\"font-size:22px;font-weight:700;color:rgb(33,150,243);line-height:1.2;\">' + titlu + '</div><div style=\"font-size:13px;color:var(--secondary-text-color);opacity:0.8;margin-top:2px;\">' + detail + '</div></div></div>';\n          ]]]"),
        // Grid: kilometraj, putere, cilindree
        {
          type: 'grid',
          square: false,
          columns: 3,
          cards: [
            {
              type: 'custom:button-card',
              entity: entityId(p, 'kilometraj'),
              icon: 'mdi:speedometer',
              name: 'Kilometraj',
              show_state: false,
              show_name: true,
              show_label: true,
              color_type: 'card',
              color: 'rgba(33,150,243,0.15)',
              label: "[[[\n                var v = entity.state;\n                return v ? parseInt(v).toLocaleString('ro-RO') + ' km' : '—';\n              ]]]",
              tap_action: { action: 'more-info' },
              styles: {
                card: [{ 'border-radius': '10px' }, { padding: '20px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
                icon: [{ width: '24px' }, { color: 'rgb(33,150,243)' }],
                name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }],
                label: [{ 'font-size': '15px' }, { 'font-weight': '600' }, { color: 'rgb(33,150,243)' }]
              }
            },
            {
              type: 'custom:button-card',
              entity: entityId(p, 'informatii'),
              icon: 'mdi:engine',
              name: 'Putere',
              show_state: false,
              show_name: true,
              show_label: true,
              color_type: 'card',
              color: 'rgba(255,152,0,0.15)',
              label: "[[[\n                var cp = entity.attributes['Putere (CP)'];\n                var kw = entity.attributes['Putere (kW)'];\n                if (cp) return cp + ' CP';\n                if (kw) return kw + ' kW';\n                return '—';\n              ]]]",
              tap_action: { action: 'more-info' },
              styles: {
                card: [{ 'border-radius': '10px' }, { padding: '20px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
                icon: [{ width: '24px' }, { color: 'rgb(255,152,0)' }],
                name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }],
                label: [{ 'font-size': '15px' }, { 'font-weight': '600' }, { color: 'rgb(255,152,0)' }]
              }
            },
            {
              type: 'custom:button-card',
              entity: entityId(p, 'informatii'),
              icon: 'mdi:piston',
              name: 'Cilindree',
              show_state: false,
              show_name: true,
              show_label: true,
              color_type: 'card',
              color: 'rgba(158,158,158,0.15)',
              label: "[[[\n                var cc = entity.attributes['Capacitate cilindrică (cm³)'];\n                return cc ? cc + ' cm³' : '—';\n              ]]]",
              tap_action: { action: 'more-info' },
              styles: {
                card: [{ 'border-radius': '10px' }, { padding: '20px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
                icon: [{ width: '24px' }, { color: 'rgb(158,158,158)' }],
                name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }],
                label: [{ 'font-size': '15px' }, { 'font-weight': '600' }, { color: 'rgb(158,158,158)' }]
              }
            }
          ]
        },
        // Footer
        _footerCard(entityId(p, 'informatii'), "[[[\n            var attr = entity.attributes || {};\n            var vin = attr['VIN'] || '—';\n            var civ = attr['Serie CIV'] || '—';\n            var nr = attr['Nr. înmatriculare'] || '—';\n            return '<div style=\"padding-top:10px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:20px;\"><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:car-info style=\"width:13px;height:13px;color:#888;\"></ha-icon>VIN: ' + vin + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:card-account-details style=\"width:13px;height:13px;color:#888;\"></ha-icon>CIV: ' + civ + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:numeric style=\"width:13px;height:13px;color:#888;\"></ha-icon>' + nr + '</span></div>';\n          ]]]")
      ])
    ]
  };
}


// ══════════════════════════════════════════
// 2. DOCUMENTE — dynamic grid (only existing entities)
// ══════════════════════════════════════════

function configDocumente(prefix, hass) {
  var p = prefix;
  var rcaEid = entityId(p, 'rca');
  if (!_entityExists(hass, rcaEid)) return null;

  // Grid dinamic — include doar entitățile care există
  var gridCards = [];
  var docEntities = [
    { eid: entityId(p, 'casco'), icon: 'mdi:shield-plus', name: 'Casco', type: 'zile' },
    { eid: entityId(p, 'itp'), icon: 'mdi:car-wrench', name: 'ITP', type: 'zile' },
    { eid: entityId(p, 'rovinieta'), icon: 'mdi:road-variant', name: 'Rovinieta', type: 'zile' },
    { eid: entityId(p, 'impozit'), icon: 'mdi:cash', name: 'Impozit', type: 'zile' },
    { eid: entityId(p, 'leasing'), icon: 'mdi:file-document-outline', name: 'Leasing', type: 'leasing' },
  ];

  for (var i = 0; i < docEntities.length; i++) {
    var d = docEntities[i];
    if (_entityExists(hass, d.eid)) {
      if (d.type === 'leasing') {
        gridCards.push(_indicatorZileLeasing(d.eid));
      } else {
        gridCards.push(_indicatorZile(d.eid, d.icon, d.name));
      }
    }
  }

  var stackCards = [
    // Header RCA
    _headerCard(rcaEid, "[[[\n          var attr = entity.attributes || {};\n          var zile = parseInt(entity.state) || 0;\n          var companie = attr['Companie'] || '';\n          var polita = attr['Număr poliță'] || '';\n          var valid = zile >= 0;\n          var color = valid ? (zile < 30 ? '#FF9800' : '#4CAF50') : '#EF4F1A';\n          var detail = companie;\n          if (polita) detail += (detail ? ' · Poliță: ' : 'Poliță: ') + polita;\n          var bgColor = valid ? (zile < 30 ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)') : 'rgba(239,79,26,0.15)';\n          var iconName = valid ? 'mdi:shield-car' : 'mdi:shield-alert';\n          return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;\"><ha-icon icon=' + iconName + ' style=\"width:28px;height:28px;color:' + color + ';\"></ha-icon></div><div style=\"text-align:right;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Asigurare RCA</div><div style=\"font-size:22px;font-weight:700;color:' + color + ';line-height:1.2;\">' + (valid ? zile + ' zile rămase' : 'EXPIRAT') + '</div><div style=\"font-size:13px;color:var(--secondary-text-color);opacity:0.8;margin-top:2px;\">' + detail + '</div></div></div>';\n        ]]]")
  ];

  // Adaugă grid doar dacă are carduri
  if (gridCards.length > 0) {
    stackCards.push({
      type: 'grid',
      square: false,
      columns: gridCards.length,
      cards: gridCards
    });
  }

  // Footer
  stackCards.push(
    _footerCard(rcaEid, "[[[\n          var attr = entity.attributes || {};\n          var emitere = attr['Data emitere'] || '—';\n          var expirare = attr['Data expirare'] || '—';\n          var cost = attr['Cost (RON)'];\n          var costText = cost ? cost + ' RON' : '—';\n          return '<div style=\"padding-top:10px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:20px;\"><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:calendar-arrow-right style=\"width:13px;height:13px;color:#888;\"></ha-icon>Emis: ' + emitere + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:calendar-alert style=\"width:13px;height:13px;color:#888;\"></ha-icon>Expiră: ' + expirare + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:currency-eur style=\"width:13px;height:13px;color:#888;\"></ha-icon>Cost: ' + costText + '</span></div>';\n        ]]]")
  );

  return {
    type: 'vertical-stack',
    cards: [
      _separator('DOCUMENTE'),
      _stackWrapper(stackCards)
    ]
  };
}


// ══════════════════════════════════════════
// 3. MENTENANȚĂ — dynamic grid
// ══════════════════════════════════════════

function configMentenanta(prefix, hass) {
  var p = prefix;
  var uleiEid = entityId(p, 'revizie_ulei');
  if (!_entityExists(hass, uleiEid)) return null;

  var stackCards = [
    // Header revizie ulei
    _headerCard(uleiEid, "[[[\n          var attr = entity.attributes || {};\n          var kmRamasi = parseInt(entity.state) || 0;\n          var dataUltima = attr['Data ultima revizie'] || '—';\n          var depasit = kmRamasi < 0;\n          var aproape = kmRamasi >= 0 && kmRamasi < 1000;\n          var color = depasit ? '#EF4F1A' : (aproape ? '#FF9800' : '#4CAF50');\n          var bgColor = depasit ? 'rgba(239,79,26,0.15)' : (aproape ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)');\n          var stareText = depasit ? 'DEPĂȘIT cu ' + Math.abs(kmRamasi).toLocaleString('ro-RO') + ' km' : kmRamasi.toLocaleString('ro-RO') + ' km rămași';\n          return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;\"><ha-icon icon=mdi:oil style=\"width:28px;height:28px;color:' + color + ';\"></ha-icon></div><div style=\"text-align:right;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Revizie ulei</div><div style=\"font-size:22px;font-weight:700;color:' + color + ';line-height:1.2;\">' + stareText + '</div><div style=\"font-size:13px;color:var(--secondary-text-color);opacity:0.8;margin-top:2px;\">Ultima: ' + dataUltima + '</div></div></div>';\n        ]]]")
  ];

  // Grid rând 1: distribuție, plăcuțe, discuri (doar cele existente)
  var row1 = [];
  if (_entityExists(hass, entityId(p, 'distributie'))) row1.push(_indicatorKm(entityId(p, 'distributie'), 'mdi:engine', 'Distribuție', 5000, 0));
  if (_entityExists(hass, entityId(p, 'placute_frana'))) row1.push(_indicatorKm(entityId(p, 'placute_frana'), 'mdi:car-brake-alert', 'Plăcuțe frână', 3000, 0));
  if (_entityExists(hass, entityId(p, 'discuri_frana'))) row1.push(_indicatorKm(entityId(p, 'discuri_frana'), 'mdi:disc', 'Discuri frână', 5000, 0));

  if (row1.length > 0) {
    stackCards.push({
      type: 'grid',
      square: false,
      columns: row1.length,
      cards: row1
    });
  }

  // Grid rând 2: baterie, anvelope (doar cele existente)
  var row2 = [];

  if (_entityExists(hass, entityId(p, 'baterie'))) {
    row2.push({
      type: 'custom:button-card',
      entity: entityId(p, 'baterie'),
      icon: 'mdi:car-battery',
      name: 'Baterie',
      show_state: false,
      show_name: true,
      show_label: true,
      color_type: 'card',
      color: "[[[\n            var v = parseInt(entity.state) || 0;\n            if (v > 48) return 'rgba(239,79,26,0.15)';\n            if (v > 36) return 'rgba(255,152,0,0.15)';\n            return 'rgba(76,175,80,0.15)';\n          ]]]",
      label: "[[[\n            var v = parseInt(entity.state);\n            if (isNaN(v)) return '—';\n            return v + ' luni';\n          ]]]",
      tap_action: { action: 'more-info' },
      styles: {
        card: [{ 'border-radius': '10px' }, { padding: '20px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
        icon: [
          { width: '34px' },
          { color: "[[[\n                var v = parseInt(entity.state) || 0;\n                if (v > 48) return 'rgb(239,79,26)';\n                if (v > 36) return 'rgb(255,152,0)';\n                return 'rgb(76,175,80)';\n              ]]]" }
        ],
        label: [
          { 'font-size': '13px' },
          { 'font-weight': '600' },
          { color: "[[[\n                var v = parseInt(entity.state) || 0;\n                if (v > 48) return 'rgb(239,79,26)';\n                if (v > 36) return 'rgb(255,152,0)';\n                return 'rgb(76,175,80)';\n              ]]]" }
        ],
        name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }]
      }
    });
  }

  if (_entityExists(hass, entityId(p, 'anvelope'))) {
    row2.push({
      type: 'custom:button-card',
      entity: entityId(p, 'anvelope'),
      icon: 'mdi:tire',
      name: 'Anvelope',
      show_state: false,
      show_name: true,
      show_label: true,
      color_type: 'card',
      color: "[[[\n            var sezon = entity.state || '';\n            var recomandat = entity.attributes['Sezon recomandat'] || '';\n            var ok = sezon.toLowerCase() === recomandat.toLowerCase();\n            return ok ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)';\n          ]]]",
      label: "[[[\n            var sezon = entity.state || '—';\n            var recomandat = entity.attributes['Sezon recomandat'] || '';\n            if (sezon.toLowerCase() === recomandat.toLowerCase()) return sezon + ' ✓';\n            return sezon + ' (rec: ' + recomandat + ')';\n          ]]]",
      tap_action: { action: 'more-info' },
      styles: {
        card: [{ 'border-radius': '10px' }, { padding: '20px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
        icon: [
          { width: '34px' },
          { color: "[[[\n                var sezon = entity.state || '';\n                var recomandat = entity.attributes['Sezon recomandat'] || '';\n                return sezon.toLowerCase() === recomandat.toLowerCase() ? 'rgb(76,175,80)' : 'rgb(255,152,0)';\n              ]]]" }
        ],
        label: [
          { 'font-size': '13px' },
          { 'font-weight': '600' },
          { color: "[[[\n                var sezon = entity.state || '';\n                var recomandat = entity.attributes['Sezon recomandat'] || '';\n                return sezon.toLowerCase() === recomandat.toLowerCase() ? 'rgb(76,175,80)' : 'rgb(255,152,0)';\n              ]]]" }
        ],
        name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }]
      }
    });
  }

  if (row2.length > 0) {
    stackCards.push({
      type: 'grid',
      square: false,
      columns: row2.length,
      cards: row2
    });
  }

  // Footer
  stackCards.push(
    _footerCard(uleiEid, "[[[\n          var attr = entity.attributes || {};\n          var kmCurent = attr['Km curent'];\n          var kmUrm = attr['Km următoarea revizie'];\n          var dataUltima = attr['Data ultima revizie'] || '—';\n          return '<div style=\"padding-top:10px;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-top:20px;\"><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:oil style=\"width:13px;height:13px;color:#888;\"></ha-icon>Ultima: ' + dataUltima + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:map-marker-distance style=\"width:13px;height:13px;color:#888;\"></ha-icon>Curent: ' + (kmCurent ? parseInt(kmCurent).toLocaleString('ro-RO') + ' km' : '—') + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:flag-checkered style=\"width:13px;height:13px;color:#888;\"></ha-icon>Următoarea: ' + (kmUrm ? parseInt(kmUrm).toLocaleString('ro-RO') + ' km' : '—') + '</span></div>';\n        ]]]")
  );

  return {
    type: 'vertical-stack',
    cards: [
      _separator('MENTENANȚĂ'),
      _stackWrapper(stackCards)
    ]
  };
}


// ══════════════════════════════════════════
// 4. ECHIPAMENT OBLIGATORIU — dynamic
// ══════════════════════════════════════════

function configEchipament(prefix, hass) {
  var p = prefix;
  var gridCards = [];

  function _echipCard(eid, icon, nume) {
    return {
      type: 'custom:button-card',
      entity: eid,
      show_state: false,
      show_name: false,
      show_icon: false,
      show_label: false,
      tap_action: { action: 'more-info' },
      custom_fields: {
        content: "[[[\n            var attr = entity.attributes || {};\n            var zile = parseInt(entity.state) || 0;\n            var expira = attr['Data expirare'] || '—';\n            var valid = zile >= 0;\n            var color = valid ? (zile < 30 ? '#FF9800' : '#4CAF50') : '#EF4F1A';\n            var bgColor = valid ? (zile < 30 ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)') : 'rgba(239,79,26,0.15)';\n            return '<div style=\"display:flex;flex-direction:column;align-items:center;gap:8px;\"><div style=\"width:48px;height:48px;border-radius:12px;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;\"><ha-icon icon=" + icon + " style=\"width:24px;height:24px;color:' + color + ';\"></ha-icon></div><div style=\"text-align:center;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">" + nume + "</div><div style=\"font-size:18px;font-weight:700;color:' + color + ';margin-top:2px;\">' + (valid ? zile + ' zile' : 'EXPIRAT') + '</div><div style=\"font-size:11px;color:var(--secondary-text-color);opacity:0.7;margin-top:2px;\">Exp: ' + expira + '</div></div></div>';\n          ]]]"
      },
      styles: {
        card: [
          { background: 'transparent' },
          { border: 'none' },
          { 'box-shadow': 'none' },
          { padding: '20px 8px' }
        ],
        grid: [
          { 'grid-template-areas': '"content"' },
          { 'grid-template-columns': '1fr' }
        ],
        custom_fields: { content: [{ width: '100%' }] }
      }
    };
  }

  var trusaEid = entityId(p, 'trusa_prim_ajutor');
  var extinctorEid = entityId(p, 'extinctor');

  if (_entityExists(hass, trusaEid)) gridCards.push(_echipCard(trusaEid, 'mdi:medical-bag', 'Trusă prim ajutor'));
  if (_entityExists(hass, extinctorEid)) gridCards.push(_echipCard(extinctorEid, 'mdi:fire-extinguisher', 'Extinctor'));

  // Nu afișa secțiunea dacă nu există niciun echipament
  if (gridCards.length === 0) return null;

  return {
    type: 'vertical-stack',
    cards: [
      _separator('ECHIPAMENT OBLIGATORIU'),
      _stackWrapper([
        {
          type: 'grid',
          square: false,
          columns: gridCards.length,
          cards: gridCards
        }
      ])
    ]
  };
}


// ══════════════════════════════════════════
// 5. GRAFIC KILOMETRAJ
// ══════════════════════════════════════════

function configGrafic(prefix, hass) {
  var p = prefix;
  var kmEid = entityId(p, 'kilometraj');
  if (!_entityExists(hass, kmEid)) return null;

  return {
    type: 'vertical-stack',
    cards: [
      _separator('GRAFIC KILOMETRAJ'),
      _stackWrapper([
        // Header km curent
        {
          type: 'custom:button-card',
          entity: kmEid,
          show_state: false,
          show_name: false,
          show_icon: false,
          show_label: false,
          tap_action: { action: 'more-info' },
          custom_fields: {
            header: "[[[\n              var v = entity.state || '—';\n              var km = parseInt(v);\n              var formatted = isNaN(km) ? '—' : km.toLocaleString('ro-RO') + ' km';\n              return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:rgba(33,150,243,0.15);display:flex;align-items:center;justify-content:center;\"><ha-icon icon=mdi:speedometer style=\"width:28px;height:28px;color:rgb(33,150,243);\"></ha-icon></div><div style=\"text-align:right;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Kilometraj curent</div><div style=\"font-size:28px;font-weight:700;color:rgb(33,150,243);line-height:1.2;\">' + formatted + '</div></div></div>';\n            ]]]"
          },
          styles: {
            card: [
              { background: 'transparent' },
              { border: 'none' },
              { 'box-shadow': 'none' },
              { padding: '22px 22px 34px' }
            ],
            grid: [
              { 'grid-template-areas': '"header"' },
              { 'grid-template-columns': '1fr' }
            ],
            custom_fields: { header: [{ width: '100%' }] }
          }
        },
        // mini-graph-card
        {
          type: 'custom:mini-graph-card',
          entities: [
            { entity: kmEid, color: 'rgba(33,150,243,0.8)' }
          ],
          hour24: true,
          hours_to_show: 720,
          points_per_hour: 0.04,
          line_width: 3,
          animate: true,
          show: {
            icon: false,
            name: false,
            state: false,
            graph: 'line',
            fill: false,
            labels: false,
            points: false
          },
          card_mod: {
            style: 'ha-card {\n  background: transparent;\n  box-shadow: none;\n  border: none;\n}'
          }
        }
      ])
    ]
  };
}


// ── editor.js ───────────────────────────────────────────────────

/**
 * Editor vizual pentru configurarea cardului în UI.
 * Permite selectarea vehiculului și secțiunilor vizibile.
 */
class VehiculeCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;

    const vehicule = descoperiVehicule(this._hass);
    const current = this._config.vehicul || '';
    const sectiuni = this._config.sectiuni || SECTIUNI;

    this.innerHTML = `
      <div style="padding:16px;">
        <div style="margin-bottom:16px;">
          <label style="display:block;font-weight:500;margin-bottom:8px;">Vehicul</label>
          <select id="vc-vehicul" style="width:100%;padding:8px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color);">
            <option value="">— Auto-detectare —</option>
            ${vehicule.map(v => `<option value="${v}" ${v === current ? 'selected' : ''}>${v.toUpperCase()}</option>`).join('')}
          </select>
          <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;">
            ${vehicule.length} vehicul(e) detectate. Lăsați gol pentru auto-detectare.
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block;font-weight:500;margin-bottom:8px;">Secțiuni vizibile</label>
          ${SECTIUNI.map(s => `
            <label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;">
              <input type="checkbox" class="vc-sectiune" value="${s}" ${sectiuni.includes(s) ? 'checked' : ''}>
              <span>${s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    this.querySelector('#vc-vehicul').addEventListener('change', (e) => {
      this._config = { ...this._config, vehicul: e.target.value };
      this._fireChanged();
    });

    this.querySelectorAll('.vc-sectiune').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(this.querySelectorAll('.vc-sectiune:checked')).map(c => c.value);
        this._config = { ...this._config, sectiuni: checked };
        this._fireChanged();
      });
    });
  }

  _fireChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('vehicule-card-editor', VehiculeCardEditor);


// ── card.js ─────────────────────────────────────────────────────

/**
 * Vehicule Card v2 — Meta-card
 *
 * Folosește cardurile existente (button-card, stack-in-card, bubble-card,
 * card-mod, mini-graph-card) ca motoare de randare prin createCardElement().
 *
 * Configurare YAML:
 *   type: custom:vehicule-card
 *   vehicul: b123abc       # opțional — auto-detectare dacă lipsește
 *   sectiuni:               # opțional — toate dacă lipsesc
 *     - informatii
 *     - documente
 *     - mentenanta
 *     - echipament
 *     - grafic
 */

// Map secțiune → funcție generator config
var CONFIG_GENERATORS = {
  informatii: configInformatii,
  documente: configDocumente,
  mentenanta: configMentenanta,
  echipament: configEchipament,
  grafic: configGrafic,
};

class VehiculeCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('vehicule-card-editor');
  }

  static getStubConfig() {
    return {
      vehicul: '',
      sectiuni: ['informatii'],
    };
  }

  constructor() {
    super();
    this._helpers = null;
    this._cards = [];
    this._rendered = false;
    this._lastPrefix = '';
    this._lastSectiuni = '';
  }

  setConfig(config) {
    this._config = {
      vehicul: config.vehicul || '',
      sectiuni: config.sectiuni || [...SECTIUNI],
    };
    this._rendered = false;
    if (this._hass) this._buildCards();
  }

  set hass(hass) {
    this._hass = hass;

    // Propagă hass către toate sub-cardurile existente
    for (var i = 0; i < this._cards.length; i++) {
      if (this._cards[i]) this._cards[i].hass = hass;
    }

    // Construiește cardurile la prima randare sau la schimbarea config-ului
    if (!this._rendered) {
      this._buildCards();
    }
  }

  async _getHelpers() {
    if (this._helpers) return this._helpers;
    this._helpers = await window.loadCardHelpers();
    return this._helpers;
  }

  async _buildCards() {
    if (!this._hass || !this._config) return;

    var helpers = await this._getHelpers();

    // Auto-descoperire vehicul dacă nu e configurat
    var prefix = this._config.vehicul;
    if (!prefix) {
      var vehicule = descoperiVehicule(this._hass);
      if (vehicule.length === 0) {
        this.innerHTML = '<ha-card><div style="padding:32px;text-align:center;color:var(--secondary-text-color);"><ha-icon icon="mdi:car-off" style="--mdc-icon-size:48px;opacity:0.5;"></ha-icon><div style="margin-top:12px;font-size:14px;">Niciun vehicul detectat</div><div style="margin-top:4px;font-size:12px;">Adăugați integrarea Vehicule din HACS.</div></div></ha-card>';
        this._rendered = true;
        return;
      }
      prefix = vehicule[0];
    }

    // Generează configurațiile pentru fiecare secțiune activă
    var configs = [];
    var sectiuni = this._config.sectiuni;
    for (var i = 0; i < sectiuni.length; i++) {
      var generator = CONFIG_GENERATORS[sectiuni[i]];
      if (generator) {
        var cfg = generator(prefix, this._hass);
        if (cfg) configs.push(cfg);
      }
    }

    if (configs.length === 0) {
      this.innerHTML = '<ha-card><div style="padding:24px;text-align:center;color:var(--secondary-text-color);font-size:13px;">Nicio secțiune cu date disponibile.</div></ha-card>';
      this._rendered = true;
      return;
    }

    // Creează elementele de card prin helpers
    this._cards = [];
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:0px;';

    for (var j = 0; j < configs.length; j++) {
      try {
        var cardEl = helpers.createCardElement(configs[j]);
        cardEl.hass = this._hass;
        this._cards.push(cardEl);
        wrapper.appendChild(cardEl);
      } catch (e) {
        var errDiv = document.createElement('div');
        errDiv.style.cssText = 'padding:16px;color:#EF4F1A;font-size:12px;';
        errDiv.textContent = 'Eroare: ' + e.message + '. Verificați că aveți instalate: button-card, stack-in-card, bubble-card, card-mod, mini-graph-card.';
        wrapper.appendChild(errDiv);
      }
    }

    // Înlocuiește conținutul
    this.innerHTML = '';
    this.appendChild(wrapper);
    this._rendered = true;
  }

  getCardSize() {
    return this._config && this._config.sectiuni ? this._config.sectiuni.length * 3 : 12;
  }
}

// ── Înregistrare card ──
customElements.define('vehicule-card', VehiculeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'vehicule-card',
  name: 'Vehicule Card',
  description: 'Card complet pentru integrarea Vehicule — afișează informații, documente, mentenanță și echipament.',
  preview: true,
  documentationURL: 'https://github.com/cnecrea/vehicule-card',
});

console.info(
  '%c VEHICULE-CARD %c v' + VEHICULE_CARD_VERSION + ' %c meta-card ',
  'color:white;background:#2196F3;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px;',
  'color:#2196F3;background:#E3F2FD;font-weight:bold;padding:2px 6px;',
  'color:white;background:#4CAF50;font-weight:bold;padding:2px 6px;border-radius:0 4px 4px 0;'
);


