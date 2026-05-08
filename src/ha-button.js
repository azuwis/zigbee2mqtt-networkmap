import {
  css,
  html,
  LitElement
} from 'lit-element'

class HaButton extends LitElement {
  static get styles () {
    return css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        padding: 0 16px;
        border: none;
        border-radius: 4px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        font-size: 14px;
        font-family: inherit;
        text-transform: uppercase;
        cursor: pointer;
        user-select: none;
      }
      :host(:hover) {
        opacity: 0.9;
      }
    `
  }

  render () {
    return html`<slot></slot>`
  }
}

customElements.define('ha-button', HaButton)
