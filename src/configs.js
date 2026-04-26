/**
 * Generatoare de configurații — traduc 1:1 YAML-ul din LOVELACE.md
 * în obiecte JS parametrizate cu prefixul vehiculului.
 *
 * Fiecare funcție primește (prefix, hass) și returnează un config object.
 * Cardurile sunt incluse DOAR dacă entitatea corespunzătoare există în HA.
 *
 * Suport bilingv: folosește resolveEntityId() / resolveIfExists() din utils.js
 * pentru a detecta automat varianta RO sau EN a senzorilor.
 */

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

function _separator(name, plate) {
  // Dacă utilizatorul a activat `show_plate_in_separators` și avem nr. înmatriculare,
  // suffix-ul apare după titlu (util când ascunzi secțiunea „informații" și pierzi plăcuța).
  var displayName = (plate && typeof plate === 'string' && plate.trim()) ? (name + ' · ' + plate.trim()) : name;
  return {
    type: 'custom:bubble-card',
    card_type: 'separator',
    icon: '',
    name: displayName,
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
        { padding: '16px 18px 12px' }
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
        { padding: '0 18px 10px' }
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
        { padding: '14px 8px' },
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
        { padding: '14px 8px' },
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
        { padding: '14px 8px' },
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

function configInformatii(prefix, hass, plate) {
  var p = prefix;
  var eid = resolveIfExists(hass, p, 'informatii');
  if (!eid) return null;

  var kmEid = resolveEntityId(hass, p, 'kilometraj');

  return {
    type: 'vertical-stack',
    cards: [
      _separator('VEHICUL ' + p.toUpperCase(), plate),
      _stackWrapper([
        // Header
        _headerCard(eid, "[[[\n            var attr = entity.attributes || {};\n            var marca = attr['Marcă'] || attr['Make'] || '';\n            var model = attr['Model'] || '';\n            var titlu = (marca + ' ' + model).trim() || entity.state || '—';\n            var combustibil = attr['Combustibil'] || attr['Fuel type'] || '';\n            var an = attr['An fabricație'] || attr['Year of manufacture'] || '';\n            var motorizare = attr['Motorizare'] || attr['Engine type'] || '';\n            var detail = [combustibil, motorizare, an].filter(Boolean).join(' · ');\n            return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:rgba(33,150,243,0.15);display:flex;align-items:center;justify-content:center;\"><ha-icon icon=mdi:car style=\"width:28px;height:28px;color:rgb(33,150,243);\"></ha-icon></div><div style=\"text-align:right;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Vehicul</div><div style=\"font-size:22px;font-weight:700;color:rgb(33,150,243);line-height:1.2;\">' + titlu + '</div><div style=\"font-size:13px;color:var(--secondary-text-color);opacity:0.8;margin-top:2px;\">' + detail + '</div></div></div>';\n          ]]]"),
        // Grid: kilometraj, putere, cilindree
        {
          type: 'grid',
          square: false,
          columns: 3,
          cards: [
            {
              type: 'custom:button-card',
              entity: kmEid,
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
                card: [{ 'border-radius': '10px' }, { padding: '14px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
                icon: [{ width: '24px' }, { color: 'rgb(33,150,243)' }],
                name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }],
                label: [{ 'font-size': '15px' }, { 'font-weight': '600' }, { color: 'rgb(33,150,243)' }]
              }
            },
            {
              type: 'custom:button-card',
              entity: eid,
              icon: 'mdi:engine',
              name: 'Putere',
              show_state: false,
              show_name: true,
              show_label: true,
              color_type: 'card',
              color: 'rgba(255,152,0,0.15)',
              label: "[[[\n                var cp = entity.attributes['Putere (CP)'] || entity.attributes['Power (HP)'];\n                var kw = entity.attributes['Putere (kW)'] || entity.attributes['Power (kW)'];\n                if (cp) return cp + ' CP';\n                if (kw) return kw + ' kW';\n                return '—';\n              ]]]",
              tap_action: { action: 'more-info' },
              styles: {
                card: [{ 'border-radius': '10px' }, { padding: '14px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
                icon: [{ width: '24px' }, { color: 'rgb(255,152,0)' }],
                name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }],
                label: [{ 'font-size': '15px' }, { 'font-weight': '600' }, { color: 'rgb(255,152,0)' }]
              }
            },
            {
              type: 'custom:button-card',
              entity: eid,
              icon: 'mdi:piston',
              name: 'Cilindree',
              show_state: false,
              show_name: true,
              show_label: true,
              color_type: 'card',
              color: 'rgba(158,158,158,0.15)',
              label: "[[[\n                var cc = entity.attributes['Capacitate cilindrică (cm³)'] || entity.attributes['Engine displacement (cm³)'];\n                return cc ? cc + ' cm³' : '—';\n              ]]]",
              tap_action: { action: 'more-info' },
              styles: {
                card: [{ 'border-radius': '10px' }, { padding: '14px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
                icon: [{ width: '24px' }, { color: 'rgb(158,158,158)' }],
                name: [{ 'font-size': '13px' }, { color: 'var(--secondary-text-color)' }, { 'margin-top': '4px' }],
                label: [{ 'font-size': '15px' }, { 'font-weight': '600' }, { color: 'rgb(158,158,158)' }]
              }
            }
          ]
        },
        // Footer
        _footerCard(eid, "[[[\n            var attr = entity.attributes || {};\n            var vin = attr['VIN'] || '—';\n            var civ = attr['Serie CIV'] || attr['Vehicle identity card serial (CIV)'] || '—';\n            var nr = attr['Nr. înmatriculare'] || attr['License plate number'] || '—';\n            return '<div style=\"padding-top:6px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:6px;\"><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:car-info style=\"width:13px;height:13px;color:#888;\"></ha-icon>VIN: ' + vin + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:card-account-details style=\"width:13px;height:13px;color:#888;\"></ha-icon>CIV: ' + civ + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:numeric style=\"width:13px;height:13px;color:#888;\"></ha-icon>' + nr + '</span></div>';\n          ]]]")
      ])
    ]
  };
}


// ══════════════════════════════════════════
// 2. DOCUMENTE — dynamic grid (only existing entities)
// ══════════════════════════════════════════

function configDocumente(prefix, hass, plate) {
  var p = prefix;
  var rcaEid = resolveIfExists(hass, p, 'rca');
  if (!rcaEid) return null;

  // Grid dinamic — include doar entitățile care există
  var gridCards = [];
  var docEntities = [
    { tip: 'casco', icon: 'mdi:shield-plus', name: 'Casco', type: 'zile' },
    { tip: 'itp', icon: 'mdi:car-wrench', name: 'ITP', type: 'zile' },
    { tip: 'rovinieta', icon: 'mdi:road-variant', name: 'Rovinieta', type: 'zile' },
    { tip: 'impozit', icon: 'mdi:cash', name: 'Impozit', type: 'zile' },
    { tip: 'leasing', icon: 'mdi:file-document-outline', name: 'Leasing', type: 'leasing' },
  ];

  for (var i = 0; i < docEntities.length; i++) {
    var d = docEntities[i];
    var dEid = resolveIfExists(hass, p, d.tip);
    if (dEid) {
      if (d.type === 'leasing') {
        gridCards.push(_indicatorZileLeasing(dEid));
      } else {
        gridCards.push(_indicatorZile(dEid, d.icon, d.name));
      }
    }
  }

  var stackCards = [
    // Header RCA
    _headerCard(rcaEid, "[[[\n          var attr = entity.attributes || {};\n          var zile = parseInt(entity.state) || 0;\n          var companie = attr['Companie'] || attr['Insurance company'] || '';\n          var polita = attr['Număr poliță'] || attr['Policy number'] || '';\n          var valid = zile >= 0;\n          var color = valid ? (zile < 30 ? '#FF9800' : '#4CAF50') : '#EF4F1A';\n          var parts = [];\n          if (companie) parts.push(companie);\n          if (polita) parts.push('Poliță: ' + polita);\n          var detail = parts.join('<br>');\n          var bgColor = valid ? (zile < 30 ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)') : 'rgba(239,79,26,0.15)';\n          var iconName = valid ? 'mdi:shield-car' : 'mdi:shield-alert';\n          return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;\"><ha-icon icon=' + iconName + ' style=\"width:28px;height:28px;color:' + color + ';\"></ha-icon></div><div style=\"text-align:right;min-width:0;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Asigurare RCA</div><div style=\"font-size:22px;font-weight:700;color:' + color + ';line-height:1.2;\">' + (valid ? zile + ' zile rămase' : 'EXPIRAT') + '</div><div style=\"font-size:13px;color:var(--secondary-text-color);opacity:0.8;margin-top:2px;line-height:1.4;word-break:break-word;\">' + detail + '</div></div></div>';\n        ]]]")
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
    _footerCard(rcaEid, "[[[\n          var attr = entity.attributes || {};\n          var emitere = attr['Data emitere'] || attr['Issue date'] || '—';\n          var expirare = attr['Data expirare'] || attr['Expiry date'] || '—';\n          var cost = attr['Cost (RON)'];\n          var costText = cost ? cost + ' RON' : '—';\n          return '<div style=\"padding-top:6px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:6px;\"><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:calendar-arrow-right style=\"width:13px;height:13px;color:#888;\"></ha-icon>Emis: ' + emitere + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:calendar-alert style=\"width:13px;height:13px;color:#888;\"></ha-icon>Expiră: ' + expirare + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:currency-eur style=\"width:13px;height:13px;color:#888;\"></ha-icon>Cost: ' + costText + '</span></div>';\n        ]]]")
  );

  return {
    type: 'vertical-stack',
    cards: [
      _separator('DOCUMENTE', plate),
      _stackWrapper(stackCards)
    ]
  };
}


// ══════════════════════════════════════════
// 3. MENTENANȚĂ — dynamic grid
// ══════════════════════════════════════════

function configMentenanta(prefix, hass, plate) {
  var p = prefix;
  var uleiEid = resolveIfExists(hass, p, 'revizie_ulei');
  if (!uleiEid) return null;

  var stackCards = [
    // Header revizie ulei
    _headerCard(uleiEid, "[[[\n          var attr = entity.attributes || {};\n          var kmRamasi = parseInt(entity.state) || 0;\n          var dataUltima = attr['Data ultima revizie'] || attr['Last service date'] || '—';\n          var depasit = kmRamasi < 0;\n          var aproape = kmRamasi >= 0 && kmRamasi < 1000;\n          var color = depasit ? '#EF4F1A' : (aproape ? '#FF9800' : '#4CAF50');\n          var bgColor = depasit ? 'rgba(239,79,26,0.15)' : (aproape ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)');\n          var stareText = depasit ? 'DEPĂȘIT cu ' + Math.abs(kmRamasi).toLocaleString('ro-RO') + ' km' : kmRamasi.toLocaleString('ro-RO') + ' km rămași';\n          return '<div style=\"display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;\"><div style=\"width:56px;height:56px;border-radius:14px;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;\"><ha-icon icon=mdi:oil style=\"width:28px;height:28px;color:' + color + ';\"></ha-icon></div><div style=\"text-align:right;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">Revizie ulei</div><div style=\"font-size:22px;font-weight:700;color:' + color + ';line-height:1.2;\">' + stareText + '</div><div style=\"font-size:13px;color:var(--secondary-text-color);opacity:0.8;margin-top:2px;\">Ultima: ' + dataUltima + '</div></div></div>';\n        ]]]")
  ];

  // Grid rând 1: distribuție, plăcuțe, discuri (doar cele existente)
  var row1 = [];
  var distEid = resolveIfExists(hass, p, 'distributie');
  if (distEid) row1.push(_indicatorKm(distEid, 'mdi:engine', 'Distribuție', 5000, 0));
  var placuteEid = resolveIfExists(hass, p, 'placute_frana');
  if (placuteEid) row1.push(_indicatorKm(placuteEid, 'mdi:car-brake-alert', 'Plăcuțe frână', 3000, 0));
  var discuriEid = resolveIfExists(hass, p, 'discuri_frana');
  if (discuriEid) row1.push(_indicatorKm(discuriEid, 'mdi:disc', 'Discuri frână', 5000, 0));

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

  var baterieEid = resolveIfExists(hass, p, 'baterie');
  if (baterieEid) {
    row2.push({
      type: 'custom:button-card',
      entity: baterieEid,
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
        card: [{ 'border-radius': '10px' }, { padding: '14px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
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

  var anvelopeEid = resolveIfExists(hass, p, 'anvelope');
  if (anvelopeEid) {
    row2.push({
      type: 'custom:button-card',
      entity: anvelopeEid,
      icon: 'mdi:tire',
      name: 'Anvelope',
      show_state: false,
      show_name: true,
      show_label: true,
      color_type: 'card',
      color: "[[[\n            var sezon = entity.state || '';\n            var recomandat = entity.attributes['Sezon recomandat'] || entity.attributes['Recommended season'] || '';\n            var ok = sezon.toLowerCase() === recomandat.toLowerCase();\n            return ok ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)';\n          ]]]",
      label: "[[[\n            var sezon = entity.state || '—';\n            var recomandat = entity.attributes['Sezon recomandat'] || entity.attributes['Recommended season'] || '';\n            if (sezon.toLowerCase() === recomandat.toLowerCase()) return sezon + ' ✓';\n            return sezon + ' (rec: ' + recomandat + ')';\n          ]]]",
      tap_action: { action: 'more-info' },
      styles: {
        card: [{ 'border-radius': '10px' }, { padding: '14px 8px' }, { 'box-shadow': 'none' }, { border: 'none' }],
        icon: [
          { width: '34px' },
          { color: "[[[\n                var sezon = entity.state || '';\n                var recomandat = entity.attributes['Sezon recomandat'] || entity.attributes['Recommended season'] || '';\n                return sezon.toLowerCase() === recomandat.toLowerCase() ? 'rgb(76,175,80)' : 'rgb(255,152,0)';\n              ]]]" }
        ],
        label: [
          { 'font-size': '13px' },
          { 'font-weight': '600' },
          { color: "[[[\n                var sezon = entity.state || '';\n                var recomandat = entity.attributes['Sezon recomandat'] || entity.attributes['Recommended season'] || '';\n                return sezon.toLowerCase() === recomandat.toLowerCase() ? 'rgb(76,175,80)' : 'rgb(255,152,0)';\n              ]]]" }
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
    _footerCard(uleiEid, "[[[\n          var attr = entity.attributes || {};\n          var kmCurent = attr['Km curent'] || attr['Current mileage'];\n          var kmUrm = attr['Km următoarea revizie'] || attr['Km at next service'];\n          var dataUltima = attr['Data ultima revizie'] || attr['Last service date'] || '—';\n          return '<div style=\"padding-top:6px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:6px;\"><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:oil style=\"width:13px;height:13px;color:#888;\"></ha-icon>Ultima: ' + dataUltima + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:map-marker-distance style=\"width:13px;height:13px;color:#888;\"></ha-icon>Curent: ' + (kmCurent ? parseInt(kmCurent).toLocaleString('ro-RO') + ' km' : '—') + '</span><span style=\"display:flex;align-items:center;gap:4px;font-size:11px;color:var(--secondary-text-color);\"><ha-icon icon=mdi:flag-checkered style=\"width:13px;height:13px;color:#888;\"></ha-icon>Următoarea: ' + (kmUrm ? parseInt(kmUrm).toLocaleString('ro-RO') + ' km' : '—') + '</span></div>';\n        ]]]")
  );

  return {
    type: 'vertical-stack',
    cards: [
      _separator('MENTENANȚĂ', plate),
      _stackWrapper(stackCards)
    ]
  };
}


// ══════════════════════════════════════════
// 4. ECHIPAMENT OBLIGATORIU — dynamic
// ══════════════════════════════════════════

function configEchipament(prefix, hass, plate) {
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
        content: "[[[\n            var attr = entity.attributes || {};\n            var zile = parseInt(entity.state) || 0;\n            var expira = attr['Data expirare'] || attr['Expiry date'] || '—';\n            var valid = zile >= 0;\n            var color = valid ? (zile < 30 ? '#FF9800' : '#4CAF50') : '#EF4F1A';\n            var bgColor = valid ? (zile < 30 ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)') : 'rgba(239,79,26,0.15)';\n            return '<div style=\"display:flex;flex-direction:column;align-items:center;gap:8px;\"><div style=\"width:48px;height:48px;border-radius:12px;background:' + bgColor + ';display:flex;align-items:center;justify-content:center;\"><ha-icon icon=" + icon + " style=\"width:24px;height:24px;color:' + color + ';\"></ha-icon></div><div style=\"text-align:center;\"><div style=\"font-size:13px;color:var(--secondary-text-color);\">" + nume + "</div><div style=\"font-size:18px;font-weight:700;color:' + color + ';margin-top:2px;\">' + (valid ? zile + ' zile' : 'EXPIRAT') + '</div><div style=\"font-size:11px;color:var(--secondary-text-color);opacity:0.7;margin-top:2px;\">Exp: ' + expira + '</div></div></div>';\n          ]]]"
      },
      styles: {
        card: [
          { background: 'transparent' },
          { border: 'none' },
          { 'box-shadow': 'none' },
          { padding: '14px 8px' }
        ],
        grid: [
          { 'grid-template-areas': '"content"' },
          { 'grid-template-columns': '1fr' }
        ],
        custom_fields: { content: [{ width: '100%' }] }
      }
    };
  }

  var trusaEid = resolveIfExists(hass, p, 'trusa_prim_ajutor');
  var extinctorEid = resolveIfExists(hass, p, 'extinctor');

  if (trusaEid) gridCards.push(_echipCard(trusaEid, 'mdi:medical-bag', 'Trusă prim ajutor'));
  if (extinctorEid) gridCards.push(_echipCard(extinctorEid, 'mdi:fire-extinguisher', 'Extinctor'));

  // Nu afișa secțiunea dacă nu există niciun echipament
  if (gridCards.length === 0) return null;

  return {
    type: 'vertical-stack',
    cards: [
      _separator('ECHIPAMENT OBLIGATORIU', plate),
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

function configGrafic(prefix, hass, plate) {
  var p = prefix;
  var kmEid = resolveIfExists(hass, p, 'kilometraj');
  if (!kmEid) return null;

  return {
    type: 'vertical-stack',
    cards: [
      _separator('GRAFIC KILOMETRAJ', plate),
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
              { padding: '16px 18px 12px' }
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
