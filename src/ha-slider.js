import { css } from 'lit-element'
import { MdSlider } from '@material/web/slider/slider'

class HaSlider extends MdSlider {
  static get styles () {
    return [
      ...MdSlider.styles,
      css`
        :host {
          --md-sys-color-primary: var(--primary-color);
          --md-sys-color-outline: var(--outline-color);
          --md-slider-handle-width: 14px;
          --md-slider-handle-height: 14px;
          min-width: 100px;
          min-inline-size: 100px;
          width: 100%;
        }
      `
    ]
  }
}

window.customElements.define('ha-slider', HaSlider)
