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
    const showPlate = this._config.show_plate_in_separators === true;

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

        <div style="margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;">
            <input type="checkbox" id="vc-show-plate" ${showPlate ? 'checked' : ''}>
            <span>Afișează nr. înmatriculare în titlurile secțiunilor</span>
          </label>
          <div style="font-size:12px;color:var(--secondary-text-color);margin-top:4px;margin-left:24px;">
            Util când ascundeți secțiunea „Informații" dar vreți să vedeți plăcuța mașinii.
          </div>
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

    this.querySelector('#vc-show-plate').addEventListener('change', (e) => {
      this._config = { ...this._config, show_plate_in_separators: e.target.checked };
      this._fireChanged();
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
