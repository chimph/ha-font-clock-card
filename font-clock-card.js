import { LitElement, html, css } from 'https://unpkg.com/lit-element@^2.0.0/lit-element.js?module';

// --- Main FontClockCard Class ---
class FontClockCard extends HTMLElement {
    DEFAULT_FONT_NAME = "Roboto"; DEFAULT_FONT_WEIGHT = "400"; DEFAULT_CLOCK_FORMAT = "HH:mm"; DEFAULT_FONT_SIZE = "75px"; DEFAULT_NO_SPACE_AMPM = false;
    constructor() {
        super(); this.attachShadow({ mode: 'open' }); this._fontLoaded = false; this._animationFrameId = null; this._clockElement = null; this._hass = null;
        this._handleVisibilityChange = this._handleVisibilityChange.bind(this); this._updateClock = this._updateClock.bind(this);
    }
    setConfig(config) {
        this._config = JSON.parse(JSON.stringify(config || {}));
        this._fontName = (config && config.font_name !== undefined) ? config.font_name : this.DEFAULT_FONT_NAME;
        this._fontWeight = (config && config.font_weight !== undefined) ? config.font_weight : this.DEFAULT_FONT_WEIGHT;
        this._clockFormat = (config && config.format !== undefined) ? config.format : this.DEFAULT_CLOCK_FORMAT;
        this._fontSize = (config && config.font_size !== undefined) ? config.font_size : this.DEFAULT_FONT_SIZE;
        this._fontColor = (config && config.color !== undefined) ? config.color : 'var(--primary-text-color)';
        this._noSpaceAmPm = (config && config.no_space_ampm !== undefined) ? config.no_space_ampm : this.DEFAULT_NO_SPACE_AMPM;
        this._setupCardDOM();
        if (this._fontName && this._fontWeight) { this._loadGoogleFont(this._fontName, this._fontWeight); this._applyFontStyles(this._fontName, this._fontWeight); }
        if (this._animationFrameId !== null) this._updateClock();
    }
    _setupCardDOM() {
        const sh = this.shadowRoot; if (!sh) return; let el = sh.getElementById('clock-display');
        if (!el) {
            sh.innerHTML = `<style>:host{display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}.clock{line-height:1;font-family:var(--font-clock-family,sans-serif);font-weight:var(--font-clock-weight,normal);font-style:var(--font-clock-style,normal);font-size:${this._fontSize};color:${this._fontColor};white-space:nowrap}</style><div class=clock id=clock-display>--:--:--</div>`;
            this._clockElement = sh.getElementById('clock-display');
        } else { this._clockElement = el; if (this._clockElement) { this._clockElement.style.fontSize = this._fontSize; this._clockElement.style.color = this._fontColor; } }
    }

    _updateClock() {
        if (!this._clockElement) return;
        const now = new Date();
        let H_24 = now.getHours(); 
        let M = now.getMinutes();
        let S = now.getSeconds();
        
        let h_12 = H_24 % 12;    
        h_12 = h_12 ? h_12 : 12; 

        let ampm = "";
        const formatString = this._clockFormat;
        const usesAmPmPlaceholder = formatString.toLowerCase().includes('a');

        if (usesAmPmPlaceholder) {
            const isUpperCaseAmPm = formatString.includes('A');
            ampm = H_24 >= 12 ? (isUpperCaseAmPm ? 'PM' : 'pm') : (isUpperCaseAmPm ? 'AM' : 'am');
        }

        let result = "";
        let i = 0;
        while (i < formatString.length) {
            let token = formatString.substring(i, i + 2); 

            if (token === "HH") { 
                result += H_24.toString().padStart(2, '0');
                i += 2;
            } else if (token === "hh") { 
                result += h_12.toString(); 
                i += 2;
            } else if (token === "mm") {
                result += M.toString().padStart(2, '0');
                i += 2;
            } else if (token === "ss") {
                result += S.toString().padStart(2, '0');
                i += 2;
            } else {
                token = formatString.substring(i, i + 1);
                if (token.toLowerCase() === "h") { 
                    if (usesAmPmPlaceholder) result += h_12.toString(); 
                    else result += H_24.toString();
                    i += 1;
                } else if (token.toLowerCase() === "a") { 
                    i += 1; 
                } else {
                    result += token;
                    i += 1;
                }
            }
        }

        if (usesAmPmPlaceholder && ampm) {
            const amPmSeparator = this._noSpaceAmPm ? "" : " ";
            if (this._noSpaceAmPm && result.endsWith(" ")) {
                result = result.trimEnd(); 
            }
            result += amPmSeparator + ampm;
        }

        this._clockElement.textContent = result;

        if (this._animationFrameId !== null) {
            this._animationFrameId = requestAnimationFrame(this._updateClock);
        }
    }

    _loadGoogleFont(fN,fW){if(!fN||!fW)return;const id=`google-font-${fN.replace(/\s+/g,'-')}-${fW}`;if(document.getElementById(id))return;
    const l=document.createElement('link');l.id=id;l.rel='stylesheet';const eFN=fN.replace(/\s+/g,'+');l.href=`https://fonts.googleapis.com/css2?family=${eFN}:wght@${fW}&display=swap`;document.head.appendChild(l);this._fontLoaded=true;}
    _applyFontStyles(fN,fW){if(!this.style)return;let cFW=fW,cFS='normal';const wL=fW.toLowerCase();
    if(wL.includes('italic')){cFS='italic';cFW=wL.replace('italic','').replace('i','').trim();}else if(wL.endsWith('i')&&!isNaN(parseInt(wL.substring(0,wL.length-1)))){cFS='italic';cFW=wL.replace('i','').trim();}
    if(isNaN(parseInt(cFW))&&!["normal","bold","lighter","bolder"].includes(cFW))cFW=this.DEFAULT_FONT_WEIGHT;
    this.style.setProperty('--font-clock-family',`"${fN}",sans-serif`);this.style.setProperty('--font-clock-weight',cFW);this.style.setProperty('--font-clock-style',cFS);}
    connectedCallback(){
        if(!this._clockElement) this._setupCardDOM();
        if(this._fontName && this._fontWeight) { this._loadGoogleFont(this._fontName, this._fontWeight); this._applyFontStyles(this._fontName, this._fontWeight); }
        document.addEventListener('visibilitychange',this._handleVisibilityChange);
        if(document.visibilityState==='visible') this.startClock();
    }
    disconnectedCallback(){this.stopClock();document.removeEventListener('visibilitychange',this._handleVisibilityChange);}
    startClock(){if(this._animationFrameId===null)this._animationFrameId=requestAnimationFrame(this._updateClock);}
    stopClock(){if(this._animationFrameId!==null){cancelAnimationFrame(this._animationFrameId);this._animationFrameId=null;}}
    _handleVisibilityChange(){if(document.visibilityState==='visible')this.startClock();}
    set hass(h){this._hass=h;}
    static getStubConfig(){const proto=FontClockCard.prototype;return{font_name:proto.DEFAULT_FONT_NAME||"Roboto",font_weight:proto.DEFAULT_FONT_WEIGHT||"400",font_size:proto.DEFAULT_FONT_SIZE||"75px",format:proto.DEFAULT_CLOCK_FORMAT||"HH:mm", no_space_ampm: proto.DEFAULT_NO_SPACE_AMPM};}
    getCardSize(){const fs=parseInt(this._fontSize || this.DEFAULT_FONT_SIZE);if(fs>70)return 3;if(fs>40)return 2;return 1;}
    static getConfigElement(){return document.createElement("font-clock-card-editor");}
}
// End of FontClockCard


// --- Visual Editor Class ---
class FontClockCardEditor extends LitElement {
    static get properties() {
        return {
            hass: {},
            _config: { state: true },
        };
    }

    constructor() {
        super();
        this._config = {};
    }

    setConfig(config) {
        this._config = JSON.parse(JSON.stringify(config || {}));
    }

    render() {
        if (!this.hass) {
            return html``;
        }
        const cardDefaults = FontClockCard.prototype;

        return html`
            <div class="card-config-editor">
                <ha-textfield
                    label="Font Name"
                    .value="${this._config.font_name || ''}"
                    placeholder="${cardDefaults.DEFAULT_FONT_NAME}"
                    .configValue="${'font_name'}"
                    @input="${this._valueChanged}"
                    helper="e.g., Orbitron, Lato. Default: ${cardDefaults.DEFAULT_FONT_NAME || 'Roboto'}"
                    helper-persistent
                ></ha-textfield>

                <ha-textfield
                    label="Font Weight"
                    .value="${this._config.font_weight || ''}"
                    placeholder="${cardDefaults.DEFAULT_FONT_WEIGHT}"
                    .configValue="${'font_weight'}"
                    @input="${this._valueChanged}"
                    helper="e.g., 300, 700, 400italic. Default: ${cardDefaults.DEFAULT_FONT_WEIGHT || '400'}"
                    helper-persistent
                ></ha-textfield>

                <ha-textfield
                    label="Font Size"
                    .value="${this._config.font_size || ''}"
                    placeholder="${cardDefaults.DEFAULT_FONT_SIZE}"
                    .configValue="${'font_size'}"
                    @input="${this._valueChanged}"
                    helper="e.g., 60px, 4em, 12vh. Default: ${cardDefaults.DEFAULT_FONT_SIZE || '75px'}"
                    helper-persistent
                ></ha-textfield>

                <ha-textfield
                    label="Text Color"
                    .value="${this._config.color || ''}"
                    placeholder="Theme default"
                    .configValue="${'color'}"
                    @input="${this._valueChanged}"
                    helper="Leave empty for theme default"
                    helper-persistent
                ></ha-textfield>

                <ha-select
                    label="Time Format"
                    .value="${this._config.format || cardDefaults.DEFAULT_CLOCK_FORMAT}"
                    .configValue="${'format'}"
                    @selected="${this._valueChanged}"
                    @closed="${(ev) => ev.stopPropagation()}"
                    fixedMenuPosition naturalMenuWidth
                    icon
                >
                    <mwc-list-item value="HH:mm:ss">24h with seconds (00:00:00)</mwc-list-item>
                    <mwc-list-item value="HH:mm">24h no seconds (00:00)</mwc-list-item>
                    <mwc-list-item value="hh:mm:ss A">12h with seconds (1:00:00 AM/PM)</mwc-list-item>
                    <mwc-list-item value="hh:mm A">12h no seconds (1:00 AM/PM)</mwc-list-item>
                    <mwc-list-item value="hh:mm a">12h lowercase am/pm (1:00 am/pm)</mwc-list-item>
                </ha-select>

                <div class="switch-option">
                    <ha-switch
                        .checked="${this._config.no_space_ampm === true}"
                        .configValue="${'no_space_ampm'}"
                        @change="${this._valueChanged}"
                    ></ha-switch>
                    <div class="label">Remove space before am/pm</div>
                </div>
            </div>
        `;
    }

    _valueChanged(ev) {
        if (!this._config) return;
        const target = ev.target;
        const configKey = target.configValue;
        let value;

        if (configKey === undefined) return;

        if (target.tagName === 'HA-SWITCH') {
            value = target.checked;
        } else {
            value = target.value;
        }

        const newConfig = { ...this._config };

        if (value === "" && configKey !== 'color' && target.tagName !== 'HA-SWITCH') {
            delete newConfig[configKey];
        } else if (target.tagName === 'HA-SWITCH' && value === FontClockCard.prototype.DEFAULT_NO_SPACE_AMPM) {
            delete newConfig[configKey];
        }
        else {
            newConfig[configKey] = value;
        }
        
        if (JSON.stringify(newConfig) === JSON.stringify(this._config)) {
            return;
        }

        this._config = newConfig;

        const event = new CustomEvent('config-changed', {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    static get styles() {
        return css`
            .card-config-editor {
                padding: 16px; 
                display: flex;
                flex-direction: column;
                gap: 16px; 
            }
            ha-textfield, ha-select {
                display: block; 
                width: 100%;
            }
            .switch-option {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .switch-option .label {
                flex-grow: 1;
            }
        `;
    }
}


// Define the custom elements
customElements.define('font-clock-card', FontClockCard);
customElements.define('font-clock-card-editor', FontClockCardEditor);

// Register for Lovelace card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: "font-clock-card",
    name: "Font Clock Card",
    description: "A clock card that uses a Google Font specified in its configuration.",
    preview: true,
});

