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
