let t,e,i;function o(t,e,i,o){Object.defineProperty(t,e,{get:i,set:o,enumerable:!0,configurable:!0})}var r="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},a={},s={},n=r.parcelRequirea202;null==n&&((n=function(t){if(t in a)return a[t].exports;if(t in s){var e=s[t];delete s[t];var i={id:t,exports:{}};return a[t]=i,e.call(i.exports,i,i.exports),i.exports}var o=Error("Cannot find module '"+t+"'");throw o.code="MODULE_NOT_FOUND",o}).register=function(t,e){s[t]=e},r.parcelRequirea202=n);var l=n.register;l("1ggGL",function(t,e){o(t.exports,"getSettings",function(){return c}),o(t.exports,"setSettings",function(){return h}),o(t.exports,"getHistory",function(){return u}),o(t.exports,"setHistory",function(){return m});var i=n("iU2mB");let r="barcode-scanner/",a="settings",s="history",l=async t=>{try{return[null,await (0,i.get)(t)]}catch(t){return[t,void 0]}},d=async(t,e)=>{try{return await (0,i.set)(t,e),[null]}catch(t){return[t]}},c=async()=>l(r+a),h=async t=>d(r+a,t),u=async()=>l(r+s),m=async t=>{let e=await d(r+s,t);return(async()=>{try{if("undefined"!=typeof window&&window.location){let t=window.location.hostname,e=window.location.protocol;if("localhost"===t||"127.0.0.1"===t||"::1"===t||"file:"===e)return}let e="undefined"!=typeof window&&window.location?`${window.location.origin}/recipes/save-ingredients`:"/recipes/save-ingredients",i=(t||[]).map(t=>"string"==typeof t?t:t.value||t.title||JSON.stringify(t));fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ingredients:i})}).catch(()=>{})}catch(t){}})(),e}}),l("iU2mB",function(t,e){var i;function r(t){return new Promise(function(e,i){t.oncomplete=t.onsuccess=function(){return e(t.result)},t.onabort=t.onerror=function(){return i(t.error)}})}function a(){var t,e,o,a;return i||(t="keyval-store",e="keyval",a=function(){if(o)return o;var i=indexedDB.open(t);return i.onupgradeneeded=function(){return i.result.createObjectStore(e)},(o=r(i)).then(function(t){t.onclose=function(){return o=void 0}},function(){}),o},i=function(t,i){return a().then(function(o){return i(o.transaction(e,t).objectStore(e))})}),i}function s(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:a();return e("readonly",function(e){return r(e.get(t))})}function n(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:a();return i("readwrite",function(i){return i.put(e,t),r(i.transaction)})}o(t.exports,"get",function(){return s}),o(t.exports,"set",function(){return n})}),l("3jPiW",function(t,e){var i;t.exports=(i="6z40I",import("./"+(i=n.i?.[i]||i))).then(()=>n("aexh3"))}),Object.assign(n.i??={},{"6z40I":"es.e18d237c.js"});var d=(t="",e="")=>{let i=Math.random().toString(36).substring(2,8);return`${"string"==typeof t&&""!==t?t+"-":""}${i}${"string"==typeof e&&""!==e?"-"+e:""}`},c=(t,e)=>{if(Object.prototype.hasOwnProperty.call(e,t)){let i=e[t];delete e[t],e[t]=i}},h=0,u=`
  :host {
    box-sizing: border-box;
    display: inline-block;
    contain: content;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.375rem 0.75rem;
    white-space: nowrap;
    cursor: pointer;
  }

  :host([disabled]) .tab {
    opacity: 0.7;
    cursor: not-allowed;
  }

  :host([selected]) .tab {
    color: var(--selected-tab-color);
    background-color: var(--selected-tab-bg-color);
  }

  .tab__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    font-size: inherit;
    cursor: pointer;
  }
`,m=document.createElement("template");m.innerHTML=`
  <style>
    ${u}
  </style>

  <div part="base" class="tab">
    <slot></slot>
  </div>
`,(class t extends HTMLElement{constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(m.content.cloneNode(!0))}static get observedAttributes(){return["selected","disabled","closable"]}attributeChangedCallback(t,e,i){if("selected"===t&&e!==i&&(this.setAttribute("aria-selected",this.selected.toString()),this.setAttribute("tabindex",this.disabled||!this.selected?"-1":"0")),"disabled"===t&&e!==i&&(this.setAttribute("aria-disabled",this.disabled.toString()),this.setAttribute("tabindex",this.disabled||!this.selected?"-1":"0")),"closable"===t&&e!==i)if(this.closable){let t=document.createElement("span");t.className="tab__close",t.setAttribute("part","close-tab"),t.innerHTML='<svg part="close-tab-icon" xmlns="http://www.w3.org/2000/svg" width="0.875em" height="0.875em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>',this.shadowRoot?.querySelector(".tab")?.appendChild(t),t.addEventListener("click",this.#t)}else{let t=this.shadowRoot?.querySelector(".tab__close");t?.removeEventListener("click",this.#t),t?.remove()}}connectedCallback(){this.#e("selected"),this.#e("disabled"),this.#e("closable"),this.id||(this.id=d("tab",(++h).toString())),this.setAttribute("slot","tab"),this.setAttribute("role","tab"),this.setAttribute("aria-selected","false"),this.setAttribute("tabindex",this.disabled||!this.selected?"-1":"0")}disconnectedCallback(){this.shadowRoot?.querySelector(".tab__close")?.removeEventListener("click",this.#t)}get selected(){return this.hasAttribute("selected")}set selected(t){this.toggleAttribute("selected",!!t)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",!!t)}get closable(){return this.hasAttribute("closable")}set closable(t){this.toggleAttribute("closable",!!t)}#t=t=>{t.stopPropagation(),this.dispatchEvent(new CustomEvent("a-tab-close",{bubbles:!0,composed:!0,detail:{tabId:this.id}}))};#e(t){return c(t,this)}static defineCustomElement(e="a-tab"){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var p=0,b=`
  :host {
    box-sizing: border-box;
    display: block;
    contain: content;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }
`,g=document.createElement("template");g.innerHTML=`
  <style>
    ${b}
  </style>

  <div part="base" class="tab-panel">
    <slot></slot>
  </div>
`,(class t extends HTMLElement{constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(g.content.cloneNode(!0))}connectedCallback(){this.setAttribute("slot","panel"),this.setAttribute("role","tabpanel"),this.setAttribute("hidden",""),this.id||(this.id=d("panel",(++p).toString()))}static defineCustomElement(e="a-tab-panel"){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var f={TOP:"top",BOTTOM:"bottom",START:"start",END:"end"},v={LTR:"ltr",RTL:"rtl"},y=Object.entries(f).map(([,t])=>t),w={AUTO:"auto",MANUAL:"manual"},E={DOWN:"ArrowDown",LEFT:"ArrowLeft",RIGHT:"ArrowRight",UP:"ArrowUp",HOME:"Home",END:"End",ENTER:"Enter",SPACE:" "},A=`
  :host {
    --selected-tab-color: #005fcc;
    --selected-tab-bg-color: transparent;
    --tabs-scroll-behavior: smooth;
    --scroll-button-width: 2.125em;
    --scroll-button-height: 2.125em;
    --scroll-button-inline-offset: 0rem;

    box-sizing: border-box;
    display: block;
    contain: content;
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      --tabs-scroll-behavior: auto;
    }
  }

  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  .tab-group {
    display: flex;
    width: 100%;
  }

  .tab-group__nav {
    position: relative;
  }

  .tab-group__nav--has-scroll-controls {
    padding: 0 calc(var(--scroll-button-width) + var(--scroll-button-inline-offset));
  }

  .tab-group__scroll-button {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: var(--scroll-button-width);
    height: var(--scroll-button-height);
    padding: 0; /* Required for iOS, otherwise the svg is not visible: https://stackoverflow.com/questions/66532071/flex-svg-behaving-strange-in-ios-safari-14-0-3 */
    border: 0;
    z-index: 1;
    background-color: transparent;
    font-size: inherit;
    cursor: pointer;
    color: currentColor;
  }

  .tab-group__scroll-button--start {
    left: var(--scroll-button-inline-offset);
  }

  .tab-group__scroll-button--end {
    right: var(--scroll-button-inline-offset);
  }

  :host([dir="${v.RTL}"]) .tab-group__scroll-button--start,
  :host(:dir(${v.RTL})) .tab-group__scroll-button--start {
    right: var(--scroll-button-inline-offset);
    left: auto;
    transform: translateY(-50%) rotate(180deg);
  }

  :host([dir="${v.RTL}"]) .tab-group__scroll-button--end,
  :host(:dir(${v.RTL})) .tab-group__scroll-button--end {
    left: var(--scroll-button-inline-offset);
    right: auto;
    transform: translateY(-50%) rotate(180deg);
  }

  .tab-group__tabs {
    display: flex;
    padding: 0.25rem;
    overflow-x: auto;
    scroll-behavior: var(--tabs-scroll-behavior);
    scrollbar-width: none;
  }

  .tab-group__tabs::-webkit-scrollbar {
    display: none;
  }

  .tab-group__panels {
    padding: 1rem 0;
  }

  /* placement="top" */
  .tab-group,
  :host([placement="${f.TOP}"]) .tab-group {
    flex-direction: column;
  }

  /* placement="bottom" */
  :host([placement="${f.BOTTOM}"]) .tab-group {
    flex-direction: column;
  }

  :host([placement="${f.BOTTOM}"]) .tab-group__nav {
    order: 1;
  }

  /* placement="start" */
  :host([placement="${f.START}"]) .tab-group {
    flex-direction: row;
  }

  :host([placement="${f.START}"]) .tab-group__tabs {
    flex-direction: column;
    align-items: flex-start;
  }

  :host([placement="${f.START}"]) .tab-group__panels {
    flex: 1;
    padding: 0 1rem;
  }

  /* placement="end" */
  :host([placement="${f.END}"]) .tab-group {
    flex-direction: row;
  }

  :host([placement="${f.END}"]) .tab-group__nav {
    order: 1;
  }

  :host([placement="${f.END}"]) .tab-group__tabs {
    flex-direction: column;
    align-items: flex-start;
  }

  :host([placement="${f.END}"]) .tab-group__panels {
    flex: 1;
    padding: 0 1rem;
  }
`,x=document.createElement("template");x.innerHTML=`
  <style>${A}</style>

  <div part="base" class="tab-group">
    <div part="nav" class="tab-group__nav">
      <button type="button" part="scroll-button scroll-button--start" class="tab-group__scroll-button tab-group__scroll-button--start" aria-label="Scroll to start">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" part="scroll-button-icon">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>

      <div part="tabs" class="tab-group__tabs" role="tablist" tabindex="-1">
        <slot name="tab"></slot>
      </div>

      <button type="button" part="scroll-button scroll-button--end" class="tab-group__scroll-button tab-group__scroll-button--end" aria-label="Scroll to end">
        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1em" fill="currentColor" viewBox="0 0 16 16" part="scroll-button-icon">
          <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>

    <div part="panels" class="tab-group__panels">
      <slot name="panel"></slot>
    </div>
  </div>
`,(class t extends HTMLElement{#t=null;#e=null;#i=!1;constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(x.content.cloneNode(!0))}static get observedAttributes(){return["placement","no-scroll-controls"]}attributeChangedCallback(t,e,i){"placement"===t&&e!==i&&this.#o(),"no-scroll-controls"===t&&e!==i&&this.#o()}get placement(){return this.getAttribute("placement")||f.TOP}set placement(t){null!=t&&this.setAttribute("placement",t)}get noScrollControls(){return this.hasAttribute("no-scroll-controls")}set noScrollControls(t){this.toggleAttribute("no-scroll-controls",!!t)}get scrollDistance(){return Math.abs(Number(this.getAttribute("scroll-distance")))||200}set scrollDistance(t){this.setAttribute("scroll-distance",Math.abs(t).toString()||"200")}get activation(){return this.getAttribute("activation")||w.AUTO}set activation(t){this.setAttribute("activation",t||w.AUTO)}get noTabCycling(){return this.hasAttribute("no-tab-cycling")}set noTabCycling(t){this.toggleAttribute("no-tab-cycling",!!t)}connectedCallback(){this.#r("placement"),this.#r("noScrollControls"),this.#r("scrollDistance"),this.#r("activation"),this.#r("noTabCycling");let t=this.shadowRoot?.querySelector("slot[name=tab]"),e=this.shadowRoot?.querySelector("slot[name=panel]"),i=this.shadowRoot?.querySelector(".tab-group__tabs"),o=this.shadowRoot?.querySelector(".tab-group__nav"),r=Array.from(this.shadowRoot?.querySelectorAll(".tab-group__scroll-button")||[]);t?.addEventListener("slotchange",this.#a),e?.addEventListener("slotchange",this.#a),i?.addEventListener("click",this.#s),i?.addEventListener("keydown",this.#n),r.forEach(t=>t.addEventListener("click",this.#l)),this.addEventListener("a-tab-close",this.#d),"ResizeObserver"in window&&(this.#t=new ResizeObserver(t=>{this.#e=window.requestAnimationFrame(()=>{let e=t?.[0]?.target,i=e?.scrollWidth>e?.clientWidth;r.forEach(t=>t.toggleAttribute("hidden",!i)),o?.part.toggle("nav--has-scroll-controls",i),o?.classList.toggle("tab-group__nav--has-scroll-controls",i)})})),this.#c(),this.#o()}disconnectedCallback(){let t=this.shadowRoot?.querySelector("slot[name=tab]"),e=this.shadowRoot?.querySelector("slot[name=panel]"),i=this.shadowRoot?.querySelector(".tab-group__tabs"),o=Array.from(this.shadowRoot?.querySelectorAll(".tab-group__scroll-button")||[]);t?.removeEventListener("slotchange",this.#a),e?.removeEventListener("slotchange",this.#a),i?.removeEventListener("click",this.#s),i?.removeEventListener("keydown",this.#n),o.forEach(t=>t.removeEventListener("click",this.#l)),this.removeEventListener("a-tab-close",this.#d),this.#h()}#u(){if(!this.#t)return;let t=this.shadowRoot?.querySelector(".tab-group__tabs");t&&(this.#t.unobserve(t),this.#t.observe(t))}#h(){this.#t&&(this.#t.disconnect(),null!==this.#e&&(window.cancelAnimationFrame(this.#e),this.#e=null))}#m(){return window.CSS.supports("selector(:dir(ltr))")?this.matches(":dir(ltr)")?v.LTR:v.RTL:window.getComputedStyle(this).direction||v.LTR}#c(){this.hidden=0===this.#p().length}#b(){let t=this.#p();this.#c(),t.forEach(t=>{let e=t.nextElementSibling;if(!e||"a-tab-panel"!==e.tagName.toLowerCase())return console.error(`Tab #${t.id} is not a sibling of a <a-tab-panel>`);t.setAttribute("aria-controls",e.id),e.setAttribute("aria-labelledby",t.id)})}#g(){return Array.from(this.querySelectorAll("a-tab-panel"))}#p(){return Array.from(this.querySelectorAll("a-tab"))}#f(t){let e=t.getAttribute("aria-controls");return this.querySelector(`#${e}`)}#v(){return this.#p().find(t=>!t.disabled)||null}#y(){let t=this.#p();for(let e=t.length-1;e>=0;e--)if(!t[e].disabled)return t[e];return null}#w(){let t=this.#p(),e=this.activation===w.MANUAL?t.findIndex(t=>t.matches(":focus"))-1:t.findIndex(t=>t.selected)-1;for(;t[(e+t.length)%t.length].disabled;)e--;return this.noTabCycling&&e<0?null:t[(e+t.length)%t.length]}#E(){let t=this.#p(),e=this.activation===w.MANUAL?t.findIndex(t=>t.matches(":focus"))+1:t.findIndex(t=>t.selected)+1;for(;t[e%t.length].disabled;)e++;return this.noTabCycling&&e>=t.length?null:t[e%t.length]}#A(){let t=this.#p(),e=this.#g();t.forEach(t=>t.selected=!1),e.forEach(t=>t.hidden=!0)}#o(){let t=this.shadowRoot?.querySelector(".tab-group__nav"),e=this.shadowRoot?.querySelector(".tab-group__tabs"),i=Array.from(this.shadowRoot?.querySelectorAll(".tab-group__scroll-button")||[]);this.noScrollControls||this.placement===f.START||this.placement===f.END?(this.#h(),i.forEach(t=>t.hidden=!0),t?.part.remove("nav--has-scroll-controls"),t?.classList.remove("tab-group__nav--has-scroll-controls"),e?.setAttribute("aria-orientation","vertical")):(this.#u(),i.forEach(t=>t.hidden=!1),e?.setAttribute("aria-orientation","horizontal"))}#x(){let t=this.#p(),e=t.find(t=>t.selected&&!t.disabled)||t.find(t=>!t.disabled);e&&(this.#i&&!e.selected&&this.dispatchEvent(new CustomEvent("a-tab-show",{bubbles:!0,composed:!0,detail:{tabId:e.id}})),this.#C(e))}#C(t){this.#A(),t&&(t.selected=!0);let e=this.#f(t);e&&(e.hidden=!1)}#a=t=>{this.#b(),this.#o(),this.#x(),"tab"===t.target.name&&(this.#i=!0)};#n=t=>{if("a-tab"!==t.target.tagName.toLowerCase()||t.altKey)return;let e=y.includes(this.placement||"")?this.placement:f.TOP,i=[f.TOP,f.BOTTOM].includes(e||"")?"horizontal":"vertical",o=this.#m(),r=null;switch(t.key){case E.LEFT:"horizontal"===i&&(r=o===v.LTR?this.#w():this.#E())&&(this.activation===w.MANUAL?r.focus():this.selectTab(r));break;case E.RIGHT:"horizontal"===i&&(r=o===v.LTR?this.#E():this.#w())&&(this.activation===w.MANUAL?r.focus():this.selectTab(r));break;case E.UP:"vertical"===i&&(r=this.#w())&&(this.activation===w.MANUAL?r.focus():this.selectTab(r));break;case E.DOWN:"vertical"===i&&(r=this.#E())&&(this.activation===w.MANUAL?r.focus():this.selectTab(r));break;case E.HOME:(r=this.#v())&&(this.activation===w.MANUAL?r.focus():this.selectTab(r));break;case E.END:(r=this.#y())&&(this.activation===w.MANUAL?r.focus():this.selectTab(r));break;case E.ENTER:case E.SPACE:(r=t.target)&&this.selectTab(r);break;default:return}t.preventDefault()};#s=t=>{let e=t.target.closest("a-tab");e&&this.selectTab(e)};#l=t=>{let e=t.target.closest(".tab-group__scroll-button"),i=this.shadowRoot?.querySelector(".tab-group__tabs");if(!e||!i)return;let o=e.classList.contains("tab-group__scroll-button--start"),r=this.#m()===v.LTR,a=i.scrollLeft;i.scrollTo({left:a+(o?r?-1:1:r?1:-1)*this.scrollDistance})};#d=t=>{let e=t.target,i=this.#f(e);e&&(e.remove(),e.selected&&this.dispatchEvent(new CustomEvent("a-tab-hide",{bubbles:!0,composed:!0,detail:{tabId:e.id}}))),i&&"a-tab-panel"===i.tagName.toLowerCase()&&i.remove()};#r(t){return c(t,this)}selectTabByIndex(t){let e=this.#p()[t];e&&this.selectTab(e)}selectTabById(t){let e=this.#p().find(e=>e.id===t);e&&this.selectTab(e)}selectTab(t){let e=this.#p().find(t=>t.selected);!t||t.disabled||t.selected||"a-tab"!==t.tagName.toLowerCase()||(this.#C(t),window.requestAnimationFrame(()=>{t.scrollIntoView({inline:"nearest",block:"nearest"}),t.focus()}),e&&this.dispatchEvent(new CustomEvent("a-tab-hide",{bubbles:!0,composed:!0,detail:{tabId:e.id}})),this.dispatchEvent(new CustomEvent("a-tab-show",{bubbles:!0,composed:!0,detail:{tabId:t.id}})))}static defineCustomElement(e="a-tab-group"){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var C=`
  :host {
    display: inline-block;
  }
`,k=document.createElement("template");k.innerHTML=`
  <style>${C}</style>
  <slot name="button"><button type="button" part="button"><slot name="button-content">Share</slot></button></slot>
`,(class t extends HTMLElement{#t;#p;#E=[];constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open",delegatesFocus:!0}).appendChild(k.content.cloneNode(!0)),this.#t=this.shadowRoot?.querySelector('slot[name="button"]')||null,this.#p=this.#c()}static get observedAttributes(){return["disabled"]}attributeChangedCallback(t,e,i){"disabled"===t&&e!==i&&this.#p&&(this.#p.toggleAttribute("disabled",this.disabled),this.#p.setAttribute("aria-disabled",this.disabled.toString()),this.#p.part&&this.#p.part.contains("button")&&this.#p.part.toggle("button--disabled",this.disabled))}connectedCallback(){this.#e("shareUrl"),this.#e("shareTitle"),this.#e("shareText"),this.#e("shareFiles"),this.#e("disabled"),this.#t?.addEventListener("slotchange",this.#w),this.#p?.addEventListener("click",this.#o)}disconnectedCallback(){this.#t?.removeEventListener("slotchange",this.#w),this.#p?.removeEventListener("click",this.#o)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",!!t)}get shareUrl(){return this.getAttribute("share-url")||""}set shareUrl(t){this.setAttribute("share-url",t)}get shareTitle(){return this.getAttribute("share-title")||""}set shareTitle(t){this.setAttribute("share-title",t)}get shareText(){return this.getAttribute("share-text")||""}set shareText(t){this.setAttribute("share-text",t)}get shareFiles(){return this.#E}set shareFiles(t){Array.isArray(t)&&t.length>0&&(this.#E=t)}async share(){if(!this.disabled)try{let t={};this.shareUrl&&(t.url=this.shareUrl),this.shareTitle&&(t.title=this.shareTitle),this.shareText&&(t.text=this.shareText),Array.isArray(this.shareFiles)&&this.shareFiles.length>0&&navigator.canShare&&navigator.canShare({files:this.shareFiles})&&(t.files=this.shareFiles),await navigator.share(t),this.dispatchEvent(new CustomEvent("web-share:success",{bubbles:!0,composed:!0,detail:{shareData:t}}))}catch(t){if(t instanceof Error&&"AbortError"===t.name)return void this.dispatchEvent(new CustomEvent("web-share:abort",{bubbles:!0,composed:!0,detail:{error:t}}));this.dispatchEvent(new CustomEvent("web-share:error",{bubbles:!0,composed:!0,detail:{error:t}}))}}#o=t=>{t.preventDefault(),this.disabled||this.share()};#w=t=>{t.target&&"button"===t.target.name&&(this.#p?.removeEventListener("click",this.#o),this.#p=this.#c(),this.#p&&(this.#p.addEventListener("click",this.#o),"BUTTON"===this.#p.nodeName||this.#p.hasAttribute("role")||this.#p.setAttribute("role","button")))};#c(){return this.#t&&this.#t.assignedElements({flatten:!0}).find(t=>"BUTTON"===t.nodeName||"button"===t.getAttribute("slot"))||null}#e(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(e="web-share"){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var L=new Map([["aac","audio/aac"],["abw","application/x-abiword"],["arc","application/x-freearc"],["avif","image/avif"],["avi","video/x-msvideo"],["azw","application/vnd.amazon.ebook"],["bin","application/octet-stream"],["bmp","image/bmp"],["bz","application/x-bzip"],["bz2","application/x-bzip2"],["cda","application/x-cdf"],["csh","application/x-csh"],["css","text/css"],["csv","text/csv"],["doc","application/msword"],["docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],["eot","application/vnd.ms-fontobject"],["epub","application/epub+zip"],["gz","application/gzip"],["gif","image/gif"],["heic","image/heic"],["heif","image/heif"],["htm","text/html"],["html","text/html"],["ico","image/vnd.microsoft.icon"],["ics","text/calendar"],["jar","application/java-archive"],["jpeg","image/jpeg"],["jpg","image/jpeg"],["jxl","image/jxl"],["js","text/javascript"],["json","application/json"],["jsonld","application/ld+json"],["markdown","text/markdown"],["md","text/markdown"],["mid","audio/midi"],["midi","audio/midi"],["mjs","text/javascript"],["mp3","audio/mpeg"],["mp4","video/mp4"],["mpeg","video/mpeg"],["mpkg","application/vnd.apple.installer+xml"],["odp","application/vnd.oasis.opendocument.presentation"],["ods","application/vnd.oasis.opendocument.spreadsheet"],["odt","application/vnd.oasis.opendocument.text"],["oga","audio/ogg"],["ogv","video/ogg"],["ogx","application/ogg"],["opus","audio/opus"],["otf","font/otf"],["png","image/png"],["pdf","application/pdf"],["php","application/x-httpd-php"],["ppt","application/vnd.ms-powerpoint"],["pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation"],["rar","application/vnd.rar"],["rtf","application/rtf"],["sh","application/x-sh"],["svg","image/svg+xml"],["swf","application/x-shockwave-flash"],["tar","application/x-tar"],["tif","image/tiff"],["tiff","image/tiff"],["ts","video/mp2t"],["ttf","font/ttf"],["txt","text/plain"],["vsd","application/vnd.visio"],["wav","audio/wav"],["weba","audio/webm"],["webm","video/webm"],["webp","image/webp"],["woff","font/woff"],["woff2","font/woff2"],["xhtml","application/xhtml+xml"],["xls","application/vnd.ms-excel"],["xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],["xml","application/xml"],["xul","application/vnd.mozilla.xul+xml"],["zip","application/zip"],["7z","application/x-7z-compressed"],["mkv","video/x-matroska"],["mov","video/quicktime"],["msg","application/vnd.ms-outlook"]]),S=[".DS_Store","Thumbs.db"],_=t=>{let{name:e}=t;if(e&&-1!==e.lastIndexOf(".")&&!t.type){let i=(e.split(".").pop()||"").toLowerCase(),o=L.get(i);o&&Object.defineProperty(t,"type",{value:o,writable:!1,configurable:!1,enumerable:!0})}return t},T=(t,e)=>{let i=_(t);if("string"!=typeof i.path){let{webkitRelativePath:o}=t;Object.defineProperty(i,"path",{value:"string"==typeof e?e:o||t.name,writable:!1,configurable:!1,enumerable:!0})}return i},z=async t=>await new Promise((e,i)=>{t.readEntries(e,i)}),I=async t=>{let e=[],i=await z(t);for(;i.length>0;)e.push(...i),i=await z(t);return e},R=t=>new Promise((e,i)=>{t.file(i=>e(T(i,t.fullPath)),i)}),N=async t=>{let e=[],i=[];for(let e of t){if("file"!==e.kind)continue;let t=e.getAsEntry?e.getAsEntry():e.webkitGetAsEntry();i.push(t)}for(;i.length>0;){let t=i.shift();if(t)if(t.isFile){let i=await R(t);-1===S.indexOf(i.name)&&e.push(i)}else t.isDirectory&&i.push(...await I(t.createReader()))}return e},D=async t=>{let e=[];for(let i of t)-1===S.indexOf(i.name)&&e.push(T(i));return e},M=async t=>t.dataTransfer?t.dataTransfer.items?await N(t.dataTransfer.items):await D(t.dataTransfer.files):await D(t.target.files),F="files-dropzone",B="TOO_MANY_FILES",q=document.createElement("template"),H=`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  :host {
    --dropzone-border-width: 2px;
    --dropzone-border-style: dashed;
    --dropzone-border-radius: 0.25rem;
    --dropzone-border-color: #6c757d;
    --dropzone-border-color-dragover: #0d6efd;
    --dropzone-border-color-hover: var(--dropzone-border-color-dragover);
    --dropzone-background-color: #ffffff;
    --dropzone-background-color-dragover: #f4f4f5;
    --dropzone-background-color-hover: var(--dropzone-background-color-dragover);
    --dropzone-body-color: #3f3f46;
    --dropzone-body-color-dragover: var(--dropzone-body-color);
    --dropzone-body-color-hover: var(--dropzone-body-color-dragover);
    --dropzone-focus-shadow-rgb: 49,132,253;
    --dropzone-focus-box-shadow: 0 0 0 0.25rem rgba(var(--dropzone-focus-shadow-rgb), 0.5);
    --transition-duration: 0.2s; /* for backwards compatibility */
    --dropzone-transition-duration: var(--transition-duration);

    display: block;
  }

  :host(:not([no-style])) .dropzone {
    border: var(--dropzone-border-width) var(--dropzone-border-style) var(--dropzone-border-color);
    border-radius: var(--dropzone-border-radius);
    padding: 3rem 1rem;
    overflow: hidden;
    background-color: var(--dropzone-background-color);
    color: var(--dropzone-body-color);
    text-align: center;
    cursor: pointer;
    transition: border var(--dropzone-transition-duration) ease-in-out, background-color var(--dropzone-transition-duration) ease-in-out, color var(--dropzone-transition-duration) ease-in-out, box-shadow var(--dropzone-transition-duration) ease-in-out;
  }

  :host(:not([no-style])[disabled]) .dropzone {
    opacity: 0.8;
    cursor: not-allowed;
    user-select: none;
  }

  :host(:not([no-style]):not([disabled])) .dropzone--dragover {
    border-color: var(--dropzone-border-color-dragover);
    background-color: var(--dropzone-background-color-dragover);
    color: var(--dropzone-body-color-dragover);
  }

  :host(:not([no-style]):not([disabled])) .dropzone:focus-visible {
    outline: none;
    box-shadow: var(--dropzone-focus-box-shadow);
  }

  @media (hover: hover) {
    :host(:not([no-style]):not([disabled])) .dropzone:not(.dropzone--dragover):hover {
      border-color: var(--dropzone-border-color-hover);
      background-color: var(--dropzone-background-color-hover);
      color: var(--dropzone-body-color-hover);
    }
  }
`;q.innerHTML=`
  <style>
    ${H}
  </style>

  <input type="file" id="file-input" hidden>

  <div part="dropzone" class="dropzone" id="dropzone" tabindex="0" role="button" aria-disabled="false">
    <slot>Drag 'n' drop files here, or click to select files</slot>
  </div>
`,(class t extends HTMLElement{#p=null;#t=null;constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open",delegatesFocus:!0}).appendChild(q.content.cloneNode(!0)),this.shadowRoot&&(this.#p=this.shadowRoot.getElementById("file-input"),this.#t=this.shadowRoot.getElementById("dropzone"))}static get observedAttributes(){return["accept","disabled","multiple"]}attributeChangedCallback(t,e,i){"accept"===t&&e!==i&&this.#p&&(this.#p.accept=this.accept),"disabled"===t&&e!==i&&this.#p&&(this.#p.disabled=this.disabled,this.disabled?(this.#t?.removeAttribute("tabindex"),this.#t?.setAttribute("aria-disabled","true")):(this.#t?.setAttribute("tabindex","0"),this.#t?.setAttribute("aria-disabled","false"))),"multiple"===t&&e!==i&&this.#p&&(this.#p.multiple=this.multiple)}connectedCallback(){this.#r("accept"),this.#r("disabled"),this.#r("maxFiles"),this.#r("maxSize"),this.#r("minSize"),this.#r("multiple"),this.#r("autoFocus"),this.#r("noStyle"),this.#p?.addEventListener("change",this.#o),this.#t?.addEventListener("dragenter",this.#E),this.#t?.addEventListener("dragover",this.#e),this.#t?.addEventListener("dragleave",this.#a),this.#t?.addEventListener("drop",this.#w),this.#t?.addEventListener("click",this.#m),this.#t?.addEventListener("keyup",this.#i),this.autoFocus&&this.#t?.focus()}disconnectedCallback(){this.#p?.removeEventListener("change",this.#o),this.#t?.removeEventListener("dragenter",this.#E),this.#t?.removeEventListener("dragover",this.#e),this.#t?.removeEventListener("dragleave",this.#a),this.#t?.removeEventListener("drop",this.#w),this.#t?.removeEventListener("click",this.#m),this.#t?.removeEventListener("keyup",this.#i)}get accept(){return this.getAttribute("accept")||""}set accept(t){this.setAttribute("accept",null!=t?t.toString():t)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",!!t)}get maxFiles(){let t=Number(this.getAttribute("max-files"))||0;return t<=0?1/0:Math.floor(Math.abs(t))}set maxFiles(t){this.setAttribute("max-files",null!=t?t.toString():t)}get maxSize(){let t=this.getAttribute("max-size");if(null===t)return 1/0;let e=Number(t);return Number.isNaN(e)?1/0:e}set maxSize(t){this.setAttribute("max-size",null!=t?t.toString():t)}get minSize(){let t=this.getAttribute("min-size");if(null===t)return 0;let e=Number(t);return Number.isNaN(e)?0:e}set minSize(t){this.setAttribute("min-size",null!=t?t.toString():t)}get multiple(){return this.hasAttribute("multiple")}set multiple(t){this.toggleAttribute("multiple",!!t)}get autoFocus(){return this.hasAttribute("auto-focus")}set autoFocus(t){this.toggleAttribute("auto-focus",!!t)}get noStyle(){return this.hasAttribute("no-style")}set noStyle(t){this.toggleAttribute("no-style",!!t)}#o=async t=>{try{this.#h(await M(t))}catch(t){this.dispatchEvent(new CustomEvent(`${F}-error`,{bubbles:!0,composed:!0,detail:{error:t}}))}};#E=()=>{this.disabled||this.dispatchEvent(new Event(`${F}-dragenter`,{bubbles:!0,composed:!0}))};#e=t=>{if(t.preventDefault(),this.disabled){t.dataTransfer.dropEffect="none";return}t.dataTransfer.dropEffect="copy",this.#t&&(this.#t.classList.add("dropzone--dragover"),this.#t.part.add("dropzone--dragover")),this.dispatchEvent(new Event(`${F}-dragover`,{bubbles:!0,composed:!0}))};#a=()=>{this.disabled||(this.#t&&(this.#t.classList.remove("dropzone--dragover"),this.#t.part.remove("dropzone--dragover")),this.dispatchEvent(new Event(`${F}-dragleave`,{bubbles:!0,composed:!0})))};#w=async t=>{if(!this.disabled){t.preventDefault(),this.#t&&(this.#t.classList.remove("dropzone--dragover"),this.#t.part.remove("dropzone--dragover"));try{this.#h(await M(t))}catch(t){this.dispatchEvent(new CustomEvent(`${F}-error`,{bubbles:!0,composed:!0,detail:{error:t}}))}}};#m=()=>{this.disabled||this.#p?.click()};#i=t=>{this.disabled||(" "===t.key||"Enter"===t.key)&&this.#p?.click()};#h(t){if(!Array.isArray(t)||!t.length)return;let e=[],i=[],o=t.length;if(!this.multiple&&o>1)for(let e of t)i.push({file:e,errors:[{code:B,message:"Too many files selected. Only 1 file is allowed."}]});else if(this.multiple&&o>this.maxFiles)for(let e of t)i.push({file:e,errors:[{code:B,message:`Too many files selected. Only ${this.maxFiles} ${this.maxFiles>1?"files are":"file is"} allowed.`}]});else for(let o of t){let t=function(t,e=""){if(!e)return!0;let i=[...new Set(e.split(",").map(t=>t.trim()).filter(Boolean))],o=t.type,r=o.replace(/\/.*$/,"");for(let e of i)if("."===e.charAt(0)){if(-1!==t.name.toLowerCase().indexOf(e.toLowerCase(),t.name.length-e.length))return!0}else if(/\/\*$/.test(e)){if(r===e.replace(/\/.*$/,""))return!0}else if(o===e)return!0;return!1}(o,this.accept),r=o.size>this.maxSize,a=o.size<this.minSize;if(!t||r||a){let e=[];t||e.push({code:"INVALID_MIME_TYPE",message:`File type "${o.type}" is not accepted.`}),r&&e.push({code:"FILE_TOO_LARGE",message:`File size ${o.size} exceeds the maximum size of ${this.maxSize}.`}),a&&e.push({code:"FILE_TOO_SMALL",message:`File size ${o.size} is smaller than the minimum size of ${this.minSize}.`}),i.push({file:o,errors:e})}else e.push(o)}this.dispatchEvent(new CustomEvent(`${F}-drop`,{bubbles:!0,composed:!0,detail:{acceptedFiles:e,rejectedFiles:i}})),e.length>0&&this.dispatchEvent(new CustomEvent(`${F}-drop-accepted`,{bubbles:!0,composed:!0,detail:{acceptedFiles:e}})),i.length>0&&this.dispatchEvent(new CustomEvent(`${F}-drop-rejected`,{bubbles:!0,composed:!0,detail:{rejectedFiles:i}})),this.#p&&(this.#p.value=this.#p.defaultValue)}openFileDialog(){this.disabled||this.#p?.click()}#r(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(e=F){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var $=document.createElement("template");$.innerHTML=`
  <style>:host { display: contents; }</style>
  <slot></slot>
`,(class t extends HTMLElement{#t=null;#p=null;#e=[];constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild($.content.cloneNode(!0)),this.#t=this.shadowRoot?.querySelector("slot")??null}static get observedAttributes(){return["disabled"]}attributeChangedCallback(t,e,i){"disabled"===t&&e!==i&&(this.disabled?this.#r():this.#o())}connectedCallback(){this.#m("disabled"),"ResizeObserver"in window&&(this.#p=new ResizeObserver(t=>{this.dispatchEvent(new CustomEvent("resize-observer:resize",{bubbles:!0,composed:!0,detail:{entries:t}}))}),this.disabled||this.#o(),this.#t?.addEventListener("slotchange",this.#a))}disconnectedCallback(){this.#r(),this.#t?.removeEventListener("slotchange",this.#a)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",!!t)}#o(){this.#t&&this.#p&&(this.#e.forEach(t=>this.#p?.unobserve(t)),this.#e=[],this.#t.assignedElements().forEach(t=>{this.#p?.observe(t),this.#e.push(t)}))}#r(){this.#p?.disconnect()}#a=()=>{this.disabled||this.#o()};#m(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(e="resize-observer"){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var O=document.createElement("template"),P=`
  :host {
    --me-width: 32rem;
    --me-height: fit-content;
    --me-border-color: initial;
    --me-border-style: solid;
    --me-border-width: initial;
    --me-border-radius: 0;
    --me-box-shadow: none;
    --me-background-color: canvas;
    --me-color: canvastext;

    --me-header-spacing: 1rem;
    --me-footer-spacing: 1rem;
    --me-header-background-color: transparent;
    --me-header-color: initial;

    --me-body-spacing: 1rem;
    --me-body-background-color: transparent;
    --me-body-color: initial;
    --me-footer-background-color: transparent;
    --me-footer-color: initial;

    --me-close-padding: 0.4375rem;
    --me-close-border: none;
    --me-close-border-radius: 0;
    --me-close-background-color: transparent;
    --me-close-color: inherit;
    --me-close-font-size: 1rem;

    --me-backdrop-background: rgba(0, 0, 0, 0.5);
    --me-backdrop-filter: none;

    display: contents;
    box-sizing: border-box;
  }

  :host *,
  :host *:after,
  :host *:before {
    box-sizing: inherit;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  /* Dialog */
  .dialog {
    --dialog-placement-margin: calc((2em + 6px) / 2);

    width: var(--me-width);
    height: var(--me-height);
    padding: 0;
    border-color: var(--me-border-color);
    border-style: var(--me-border-style);
    border-width: var(--me-border-width);
    border-radius: var(--me-border-radius);
    box-shadow: var(--me-box-shadow);
    background-color: var(--me-background-color);
    color: var(--me-color);
  }

  .dialog[open] {
    display: flex;
  }

  :host([fullscreen]) .dialog {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
  }

  .dialog::backdrop {
    background: var(--me-backdrop-background, rgba(0, 0, 0, 0.5));
    backdrop-filter: var(--me-backdrop-filter, none);
    opacity: 0;
  }

  .dialog[open]::backdrop {
    opacity: 1;
  }

  /* Dialog placement */
  :host(:not([fullscreen])[placement="top-start"]) .dialog {
    margin-block-start: var(--dialog-placement-margin);
    margin-inline-start: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="top-center"]) .dialog {
    margin-block-start: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="top-end"]) .dialog {
    margin-block-start: var(--dialog-placement-margin);
    margin-inline-end: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="center-start"]) .dialog {
    margin-inline-start: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="center"]) .dialog {
    margin: auto;
  }

  :host(:not([fullscreen])[placement="center-end"]) .dialog {
    margin-inline-end: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="bottom-start"]) .dialog {
    margin-block-end: var(--dialog-placement-margin);
    margin-inline-start: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="bottom-center"]) .dialog {
    margin-block-end: var(--dialog-placement-margin);
  }

  :host(:not([fullscreen])[placement="bottom-end"]) .dialog {
    margin-block-end: var(--dialog-placement-margin);
    margin-inline-end: var(--dialog-placement-margin);
  }

  /* Dialog animations */
  @media (prefers-reduced-motion: no-preference) {
    .dialog:not(.dialog--no-animations),
    .dialog:not(.dialog--no-animations)::backdrop {
      transition: transform 0.3s, opacity 0.3s, display 0.3s allow-discrete, overlay 0.3s allow-discrete;
    }

    /* 1. IS-OPEN STATE */
    .dialog[open]:not(.dialog--no-animations) {
      transform: scale(1);
      opacity: 1;
    }

    /* 2. EXIT STATE */
    .dialog:not(.dialog--no-animations) {
      transform: scale(0.95);
      opacity: 0;
    }

    /* 0. BEFORE-OPEN STATE */
    @starting-style {
      .dialog[open]:not(.dialog--no-animations) {
        transform: scale(0.95);
        opacity: 0;
      }

      .dialog[open]:not(.dialog--no-animations)::backdrop {
        opacity: 0;
      }
    }

    .dialog--pulse:not(.dialog--no-animations) {
      animation-name: pulse;
      animation-duration: 300ms;
      animation-timing-function: cubic-bezier(0.2, 0, 0.38, 0.9);
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
  }

  /* Dialog panel, header, body, footer */
  .dialog__panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
  }

  .dialog__header {
    display: flex;
    align-items: center;
    padding: var(--me-header-spacing);
    column-gap: 0.5rem;
    background-color: var(--me-header-background-color);
    color: var(--me-header-color);
  }

  :host([no-close-button]) .dialog__header {
    column-gap: 0;
  }

  .dialog__title {
    display: block;
    flex: 1 1 auto;
    padding: 0;
    margin: 0;
  }

  .dialog__body {
    display: block;
    flex: 1 1 auto;
    padding: var(--me-body-spacing);
    overflow: auto;
    background-color: var(--me-body-background-color);
    color: var(--me-body-color);
    overscroll-behavior: contain;
  }

  .dialog__footer {
    flex: 0 0 auto;
    text-align: end;
    padding: var(--me-footer-spacing);
    background-color: var(--me-footer-background-color);
    color: var(--me-footer-color);
  }

  .dialog__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--me-close-padding);
    border: var(--me-close-border);
    border-radius: var(--me-close-border-radius);
    background-color: var(--me-close-background-color);
    color: var(--me-close-color);
    font-size: var(--me-close-font-size);
  }

  .dialog__close:not(:disabled) {
    cursor: pointer;
  }

  .dialog__close:disabled {
    cursor: not-allowed;
  }
`;O.innerHTML=`
  <style>${P}</style>

  <dialog part="base" class="dialog">
    <div part="panel" class="dialog__panel" aria-labelledby="title">
      <header part="header" class="dialog__header">
        <slot name="header" part="title" class="dialog__title" id="title"></slot>

        <form method="dialog">
          <button type="submit" part="close" class="dialog__close" aria-label="Close">
            <slot name="close">
              <svg part="close-icon" xmlns="http://www.w3.org/2000/svg" width="1.125em" height="1.125em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
              </svg>
            </slot>
          </button>
        </form>
      </header>

      <slot part="body" class="dialog__body"></slot>

      <footer part="footer" class="dialog__footer" hidden>
        <slot name="footer"></slot>
      </footer>
    </div>
  </dialog>
`,(class t extends HTMLElement{#t=null;#w=null;#e=null;#r=void 0;constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(O.content.cloneNode(!0)),this.shadowRoot&&(this.#t=this.shadowRoot.querySelector("dialog"),this.#w=this.shadowRoot.querySelector('slot[name="footer"]'),this.#e=this.shadowRoot.querySelector('slot[name="close"]'))}static get observedAttributes(){return["open","no-header","no-animations","no-close-button","close-label"]}attributeChangedCallback(t,e,i){if(null!==this.#t){if("open"===t&&e!==i&&(this.open?(this.#t.showModal(),this.dispatchEvent(new CustomEvent("me-open",{bubbles:!0,composed:!0,detail:{element:this}})),document.body&&!this.preserveOverflow&&(document.body.style.overflow="hidden")):this.#t.close()),"no-header"===t&&e!==i){let t=this.#t.querySelector(".dialog__header");null!==t&&(t.hidden=this.noHeader)}if("no-animations"===t&&e!==i&&this.#t.classList.toggle("dialog--no-animations",this.noAnimations),"no-close-button"===t&&e!==i){let t=this.#t.querySelector(".dialog__close");null!==t&&(t.hidden=this.noCloseButton)}"close-label"===t&&e!==i&&this.#E()}}connectedCallback(){this.#p("open"),this.#p("staticBackdrop"),this.#p("noHeader"),this.#p("noAnimations"),this.#p("noCloseButton"),this.#p("fullscreen"),this.#p("preserveOverflow"),this.#p("placement"),this.#p("closeLabel"),this.#t?.addEventListener("click",this.#c),this.#t?.addEventListener("close",this.#i),this.#t?.addEventListener("cancel",this.#m),this.#t?.querySelector('form[method="dialog"]')?.addEventListener("submit",this.#h),this.#w?.addEventListener("slotchange",this.#s),this.#e?.addEventListener("slotchange",this.#C),this.addEventListener("command",this.#d)}disconnectedCallback(){this.#r&&clearTimeout(this.#r),this.#t?.addEventListener("click",this.#c),this.#t?.removeEventListener("close",this.#i),this.#t?.removeEventListener("cancel",this.#m),this.#t?.querySelector('form[method="dialog"]')?.removeEventListener("submit",this.#h),this.#w?.removeEventListener("slotchange",this.#s),this.#e?.removeEventListener("slotchange",this.#C),this.removeEventListener("command",this.#d)}get open(){return this.hasAttribute("open")}set open(t){this.toggleAttribute("open",!!t)}get staticBackdrop(){return this.hasAttribute("static-backdrop")}set staticBackdrop(t){this.toggleAttribute("static-backdrop",!!t)}get noHeader(){return this.hasAttribute("no-header")}set noHeader(t){this.toggleAttribute("no-header",!!t)}get noAnimations(){return this.hasAttribute("no-animations")}set noAnimations(t){this.toggleAttribute("no-animations",!!t)}get noCloseButton(){return this.hasAttribute("no-close-button")}set noCloseButton(t){this.toggleAttribute("no-close-button",!!t)}get fullscreen(){return this.hasAttribute("fullscreen")}set fullscreen(t){this.toggleAttribute("fullscreen",!!t)}get preserveOverflow(){return this.hasAttribute("preserve-overflow")}set preserveOverflow(t){this.toggleAttribute("preserve-overflow",!!t)}get placement(){return this.getAttribute("placement")||"center"}set placement(t){this.setAttribute("placement",null!=t?t.toString():t)}get closeLabel(){return this.getAttribute("close-label")||"Close"}set closeLabel(t){this.setAttribute("close-label",null!=t?t.toString():t)}#E(){if(null===this.#t)return;let t=this.#t.querySelector(".dialog__close");null!==t&&((this.#e?.assignedElements()||[])?.some(t=>t.textContent?.replace(/\s/g,"")!=="")?t.removeAttribute("aria-label"):t.setAttribute("aria-label",this.closeLabel))}#o(){this.#r||(this.#t?.classList.add("dialog--pulse"),this.#r=setTimeout(()=>{this.#t?.classList.remove("dialog--pulse"),clearTimeout(this.#r),this.#r=void 0},300))}#i=()=>{this.open=!1,this.dispatchEvent(new CustomEvent("me-close",{bubbles:!0,composed:!0,detail:{element:this}})),document.body&&!this.preserveOverflow&&(document.body.style.overflow="")};#m=t=>{let e=this.#a("escape-key");this.dispatchEvent(e),e.defaultPrevented&&(t.preventDefault(),this.noAnimations||this.#o())};#h=t=>{let e=this.#a("close-button");this.dispatchEvent(e),e.defaultPrevented&&(t.preventDefault(),this.noAnimations||this.#o())};#c=t=>{let e=t.target;if(e===t.currentTarget){let t=this.#a("backdrop-click");this.dispatchEvent(t),t.defaultPrevented||this.staticBackdrop?this.noAnimations||this.#o():this.hide()}if(e instanceof HTMLElement&&null!==e.closest("[data-me-close]")){let t=this.#a("external-invoker");this.dispatchEvent(t),t.defaultPrevented?this.noAnimations||this.#o():this.hide()}};#d=t=>{if("--me-open"!==t.command||this.open||this.show(),"--me-close"===t.command&&this.open){let t=this.#a("external-invoker");this.dispatchEvent(t),t.defaultPrevented?this.noAnimations||this.#o():this.hide()}};#s=()=>{if(null===this.#t)return;let t=this.#t.querySelector(".dialog__footer");if(null===t)return;let e=this.#w?.assignedNodes();t.hidden=!(e&&e.length>0)};#C=()=>{this.#E()};#a(t){return new CustomEvent("me-request-close",{bubbles:!0,composed:!0,cancelable:!0,detail:{reason:t,element:this}})}#p(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}show(){this.open||(this.open=!0)}hide(){this.open&&(this.open=!1)}static defineCustomElement(e="modal-element"){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();var j="alert-element",V="alert-after-show",U="alert-after-hide",W=(e=(t=Object.assign(document.createElement("div"),{className:"alert-toast-stack"})).attachShadow({mode:"open"}),i=`
    :host {
      display: contents;
      box-sizing: border-box;
    }

    :host *,
    :host *::before,
    :host *::after {
      box-sizing: inherit;
    }

    .stack {
      position: fixed;
      top: 0;
      right: 0;
      z-index: 1000;
      width: 30rem;
      max-width: 100%;
      max-height: 100%;
      overflow: auto;
      scrollbar-width: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      .stack {
        scroll-behavior: smooth;
      }
    }

    .stack > ::slotted(*) {
      margin: 1rem;
    }
  `,e.innerHTML=`
    <style>${i}</style>
    <div class="stack" part="base"><slot></slot></div>
  `,t),G=`
  :host {
    display: contents;
    box-sizing: border-box;

    --alert-border-radius: 0.25rem;
    --alert-fg-color: #3f3f46;
    --alert-bg-color: #ffffff;
    --alert-border-color: #e4e4e7;
    --alert-info-variant-color: #0584c7;
    --alert-success-variant-color: #16a34a;
    --alert-neutral-variant-color: #52525b;
    --alert-warning-variant-color: #d87708;
    --alert-danger-variant-color: #dc2626;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --alert-fg-color: #b6b6be;
      --alert-bg-color: #252528;
      --alert-border-color: #36363a;
      --alert-info-variant-color: #27bbfc;
      --alert-success-variant-color: #3ae075;
      --alert-neutral-variant-color: #8e8e9a;
      --alert-warning-variant-color: #ffbd11;
      --alert-danger-variant-color: #fe5c5c;
    }
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }

  .alert {
    display: flex;
    align-items: center;
    margin: inherit;
    border: 1px solid var(--alert-border-color);
    border-top-width: 3px;
    border-radius: var(--alert-border-radius);
    background-color: var(--alert-bg-color);
  }

  :host([variant='info']) .alert {
    border-top-color: var(--alert-info-variant-color);
  }

  :host([variant='success']) .alert {
    border-top-color: var(--alert-success-variant-color);
  }

  :host([variant='neutral']) .alert {
    border-top-color: var(--alert-neutral-variant-color);
  }

  :host([variant='warning']) .alert {
    border-top-color: var(--alert-warning-variant-color);
  }

  :host([variant='danger']) .alert {
    border-top-color: var(--alert-danger-variant-color);
  }

  .alert__icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: var(--alert-fg-color);
    font-size: inherit;
    line-height: 0;
  }

  .alert__icon ::slotted(*) {
    margin-inline-start: 1rem;
  }

  :host([variant='info']) .alert__icon {
    color: var(--alert-info-variant-color);
  }

  :host([variant='success']) .alert__icon {
    color: var(--alert-success-variant-color);
  }

  :host([variant='neutral']) .alert__icon {
    color: var(--alert-neutral-variant-color);
  }

  :host([variant='warning']) .alert__icon {
    color: var(--alert-warning-variant-color);
  }

  :host([variant='danger']) .alert__icon {
    color: var(--alert-danger-variant-color);
  }

  .alert__message {
    flex: 1 1 auto;
    padding: 1.25rem;
    overflow: hidden;
    color: var(--alert-fg-color);
    line-height: 1.5;
  }

  .alert__close {
    display: flex;
    align-items: center;
    margin-inline-end:  1rem;
    padding: 0.5rem;
    border: none;
    line-height: 0;
    background: transparent;
    color: var(--alert-fg-color);
    font-size: inherit;
    cursor: pointer;
  }

  :host(:not([closable])) .alert__close {
    display: none !important;
  }
`,Y=document.createElement("template");Y.innerHTML=`
  <style>${G}</style>
  <div class="alert" part="base" role="alert" hidden>
    <div class="alert__icon" part="icon">
      <slot name="icon"></slot>
    </div>
    <div class="alert__message" part="message" aria-live="polite">
      <slot></slot>
    </div>
    <button type="button" class="alert__close" part="close" aria-label="Close">
      <slot name="close">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>
      </slot>
    </button>
  </div>
`,(class t extends HTMLElement{#p=null;#r=null;#w=null;#a=void 0;#t=null;#C;static customAnimations;#e="api";constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(Y.content.cloneNode(!0))}static get observedAttributes(){return["open","duration","close-label"]}attributeChangedCallback(t,e,i){if(!(!this.isConnected||e===i))switch(t){case"open":this.#A();break;case"duration":this.#o(),this.#h()&&this.#i();break;case"close-label":this.#m()}}get closable(){return this.hasAttribute("closable")}set closable(t){this.toggleAttribute("closable",!!t)}get open(){return this.hasAttribute("open")}set open(t){this.toggleAttribute("open",!!t)}get duration(){let t=this.getAttribute("duration");if(null===t)return 1/0;let e=Number(t);return Number.isNaN(e)?1/0:e}set duration(t){this.setAttribute("duration",null!=t?t.toString():t)}get variant(){return this.getAttribute("variant")||""}set variant(t){this.setAttribute("variant",t)}get closeLabel(){return this.getAttribute("close-label")||"Close"}set closeLabel(t){this.setAttribute("close-label",null!=t?t.toString():t)}get customAnimations(){return this.#C}set customAnimations(t){this.#C=t}connectedCallback(){this.#E("closable"),this.#E("open"),this.#E("duration"),this.#E("variant"),this.#E("closeLabel"),this.#E("customAnimations"),this.#p=this.shadowRoot?.querySelector(".alert")??null,this.#r=this.shadowRoot?.querySelector(".alert__close")??null,this.#w=this.shadowRoot?.querySelector('slot[name="close"]')??null,this.#r?.addEventListener("click",this.#d),this.#w?.addEventListener("slotchange",this.#u),this.addEventListener("mouseenter",this.#l),this.addEventListener("mouseleave",this.#n),this.addEventListener("command",this.#f),this.open?(this.#p?.removeAttribute("hidden"),this.#h()&&this.#i()):this.#p?.setAttribute("hidden",""),this.closeLabel&&this.#m()}disconnectedCallback(){this.#o(),this.#r?.removeEventListener("click",this.#d),this.#w?.removeEventListener("slotchange",this.#u),this.removeEventListener("mouseenter",this.#l),this.removeEventListener("mouseleave",this.#n),this.removeEventListener("command",this.#f)}#A(){this.#o(),this.open?(this.#h()&&this.#i(),this.#p?.removeAttribute("hidden"),this.#c("alert-show"),this.#y(this.#p)?.finished.finally(()=>{this.#c(V)})):(this.#c("alert-hide",{reason:this.#e}),this.#b(this.#p)?.finished.finally(()=>{this.#p?.setAttribute("hidden",""),this.#c(U,{reason:this.#e}),this.#e="api"}))}#o(){void 0!==this.#a&&(clearTimeout(this.#a),this.#a=void 0)}#i(){this.#a=window.setTimeout(()=>{this.#e="timeout",this.open=!1},this.duration)}#h(){return this.open&&this.duration!==1/0}#d=()=>{this.closable&&(this.#e="user",this.open=!1)};#l=()=>{this.#o()};#n=()=>{this.#o(),this.#h()&&this.#i()};#u=()=>{this.#m()};#f=t=>{switch(t.command){case"--alert-show":this.open=!0;break;case"--alert-hide":this.#e="api",this.open=!1}};#m(){this.#r&&((this.#w?.assignedElements()||[])?.some(t=>t.textContent?.replace(/\s/g,"")!=="")?this.#r.removeAttribute("aria-label"):this.#r.setAttribute("aria-label",this.closeLabel))}#x(){let e=window.matchMedia("(prefers-reduced-motion: reduce)").matches,i={show:{keyframes:[{opacity:0,transform:"scale(0.9)"},{opacity:1,transform:"scale(1)"}],options:{duration:250,easing:"ease"}},hide:{keyframes:[{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.9)"}],options:{duration:250,easing:"ease"}}},o=this.customAnimations||t.customAnimations||{},r=r=>{let a=o[r]?.options??{},s=i[r].options;return{...s,...a,duration:e||null===this.customAnimations||null===t.customAnimations?0:a.duration??s.duration}};return{show:{keyframes:o.show?.keyframes??i.show.keyframes,options:r("show")},hide:{keyframes:o.hide?.keyframes??i.hide.keyframes,options:r("hide")}}}#y(t){let{keyframes:e,options:i}=this.#x().show;return t?.animate(e,i)}#b(t){let{keyframes:e,options:i}=this.#x().hide;return t?.animate(e,i)}#c(t,e=null){let i=new CustomEvent(t,{bubbles:!0,composed:!0,detail:e});this.dispatchEvent(i)}#s(t,e){return new Promise(i=>{t.addEventListener(e,e=>{e.target===t&&i()},{once:!0})})}show(){return this.open?Promise.resolve():(this.open=!0,this.#s(this,V))}hide(){return this.open?(this.open=!1,this.#s(this,U)):Promise.resolve()}toast(t={}){if(t={forceRestart:!1,...t},this.#t){if(!t.forceRestart)return this.#t.promise;this.#t.resolve(),this.#t.cleanup()}let e=()=>{},i=new Promise(t=>e=t),o=()=>{this.#t?.resolve(),this.#t?.cleanup()};this.#t={promise:i,resolve:e,cleanup:()=>{this.removeEventListener(U,o),this.parentNode===W&&W.removeChild(this),W.querySelector(j)||W.remove(),this.open=!1,this.#t=null}},W.parentElement||document.body.append(W),W.appendChild(this),this.#p?.setAttribute("data-toast",""),this.open=!0;let r=W.shadowRoot?.querySelector(".stack");return r?.scrollTo({top:r.scrollHeight}),this.addEventListener(U,o,{once:!0}),i}#E(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(e=j){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}}).defineCustomElement();const K=["image/jpg","image/jpeg","image/png","image/apng","image/gif","image/webp","image/avif"],J="https://api.upcdatabase.org";let Z="";if("undefined"!=typeof window){let t=window.location.hostname;("localhost"===t||"127.0.0.1"===t)&&(Z="http://localhost:8787")}const X=Z;var Q=n("1ggGL");function tt(t,e=0,i=!1){let o=null;if("function"!=typeof t)throw TypeError("Expected a function for first argument");return(...r)=>{clearTimeout(o),i&&!o&&t(...r),o=setTimeout(()=>{o=null,i||t(...r)},e)}}var te=n("9qKt3");async function ti(t,e){if(!t||!e)return;let i=t.querySelector(`bs-result[value="${e}"]`);i&&i.remove();let o=document.createElement("bs-result");o.setAttribute("value",e),o.setAttribute("role","alert"),o.setAttribute("aria-live","assertive"),o.setAttribute("aria-atomic","true"),t.insertBefore(o,t.firstElementChild),t.scrollTop=0}var Q=n("1ggGL");const to=(()=>{let t=new(window.AudioContext||window.webkitAudioContext||window.audioContext);if(t)return e=>{let{duration:i,frequency:o,volume:r,type:a,onEnded:s}=e,n=t.createOscillator(),l=t.createGain();n.connect(l),l.connect(t.destination),r&&(l.gain.value=r),o&&(n.frequency.value=o),a&&(n.type=a),"function"==typeof s&&(n.onended=s),n.start(t.currentTime),n.stop(t.currentTime+(i||500)/1e3)}})();async function tr(t=0){if("function"==typeof window.navigator.vibrate)try{window.navigator.vibrate(t)}catch{}}let ta=0;async function ts(t={}){let{success:e=!0}=t,[,i]=await (0,Q.getSettings)();if(!i)return;let o=Date.now();o-ta<1e3||(i.beep&&to(e?{duration:200,frequency:860,volume:.03,type:"square"}:{duration:300,frequency:200,volume:.05,type:"sawtooth"}),i.vibrate&&tr(e?100:200),ta=o)}function tn(t,e){if(!t||!e)return;let i=t.getBoundingClientRect();e.style.cssText=`width: ${i.width}px; height: ${i.height}px`}var te=n("9qKt3");const tl=["aztec","code_128","code_39","code_93","codabar","data_matrix","ean_13","ean_8","itf","pdf417","qr_code","upc_a","upc_e"];class td{static async polyfill(){if("BarcodeDetector"in window)te.log.info("Using the native BarcodeDetector API.");else try{await n("3jPiW"),te.log.info("Using BarcodeDetector polyfill.")}catch(t){throw Error("BarcodeDetector API is not supported by your browser.",{cause:t})}}static async getSupportedFormats(){let t=await window.BarcodeDetector.getSupportedFormats()||[];return tl.filter(e=>t.includes(e))}static async create(t){let e=Array.isArray(t)&&t.length>0?t:await td.getSupportedFormats();return new td(e)}static async setup(){try{return await td.polyfill(),{barcodeReaderError:null}}catch(t){return{barcodeReaderError:t}}}constructor(t){this.barcodeReader=new window.BarcodeDetector({formats:t})}async detect(t){if(!this.barcodeReader)throw Error("BarcodeReader is not initialized.");let e=await this.barcodeReader.detect(t);if(Array.isArray(e)&&e.length>0){let t=e[0];return te.log.info({rawValue:t.rawValue,format:t.format}),t}throw Error("Could not detect barcode from provided source.")}}var te=n("9qKt3");const tc=t=>t.replace(/\/+$/,"");async function th(t){if(!t||!/^[0-9]{12,14}$/.test(t))return null;if(!J)return te.log.info("Item info API URL not configured; skipping lookup."),null;let e="undefined"!=typeof window&&window?.location,i=X||"";if(!i&&e){let t=window.location.hostname;("localhost"===t||"127.0.0.1"===t)&&(i="http://localhost:8787")}let o=tc(i&&i.length>0?i:J),r={};async function a(t,e={}){try{let i=await fetch(t,{headers:r,...e});if(!i.ok)return{status:i.status,json:null};try{let t=await i.json();return{status:i.status,json:t}}catch(t){return te.log.warn("Non-JSON response from item API",t),{status:i.status,json:null}}}catch(t){return te.log.warn("Request failed",t),{status:0,json:null}}}let s=`${o}/product/${encodeURIComponent(t)}`,n=await a(s,{method:"GET"});if(n.json)return n.json;let l=`${o}/products/${encodeURIComponent(t)}`,d=await a(l,{method:"GET"});if(d.json)return d.json;let c=await a(l,{method:"POST"});return c.json?c.json:null}function tu(t={}){let{el:e,isTorchOn:i}={...{el:document.getElementById("torchButton"),isTorchOn:!1},...t},o=e.querySelectorAll("svg path");2===o.length&&(o[0].style.display=i?"none":"block",o[1].style.display=i?"block":"none",e.setAttribute("aria-label",`Turn ${i?"off":"on"} flash`))}function tm(t,e={}){e={duration:5e3,variant:"neutral",icon:"",...e};let i={info:`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
      </svg>
    `,success:`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
      </svg>
    `,warning:`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
      </svg>
    `,danger:`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z"/>
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
      </svg>
    `}[e.icon||e.variant]||"";return Object.assign(document.createElement("alert-element"),{closable:!0,duration:e.duration,variant:e.variant,innerHTML:`${i?`<span slot="icon">${i}</span>`:""}${e.trustDangerousInnerHTML?t:function(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}(t)}`}).toast()}const tp="video-capture",tb=`
  :host { display: block; box-sizing: border-box; }
  :host *, :host *::before, :host *::after { box-sizing: inherit;}
  :host([hidden]), [hidden], ::slotted([hidden]) { display: none; }
  video { display: block; }
  #output:empty { display: none; }
`,tg=document.createElement("template");tg.innerHTML=`
  <style>${tb}</style>
  <video part="video" playsinline></video>
  <div part="actions-container"><slot name="actions"></slot></div>
  <slot></slot>
`;class tf extends HTMLElement{#k={};#L=null;#S=null;constructor(){super(),this.#k=this.getSupportedConstraints(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(tg.content.cloneNode(!0))}static get observedAttributes(){return["no-image","pan","tilt","zoom","torch"]}attributeChangedCallback(t,e,i){if(!this.isConnected)return;let o=this.getTrackCapabilities();if("zoom"===t&&e!==i&&"zoom"in this.#k){let t=!!("zoom"in o&&o.zoom?.min&&o.zoom?.max)&&this.zoom>=o.zoom.min&&this.zoom<=o.zoom.max;"number"==typeof this.zoom&&t&&this.#_("zoom",this.zoom)}"torch"===t&&e!==i&&"torch"in this.#k&&this.#_("torch",this.torch)}async connectedCallback(){if(this.#T("autoPlay"),this.#T("facingMode"),this.#T("zoom"),this.#T("torch"),this.#S=this.shadowRoot?.querySelector("video")||null,this.#S?.addEventListener("loadedmetadata",this.#z),!tf.isSupported())return this.dispatchEvent(new CustomEvent(`${tp}:error`,{bubbles:!0,composed:!0,detail:{error:{name:"NotSupportedError",message:"Not supported"}}}));this.autoPlay&&this.startVideoStream()}disconnectedCallback(){this.stopVideoStream(),this.#S?.removeEventListener("loadedmetadata",this.#z)}get autoPlay(){return this.hasAttribute("auto-play")}set autoPlay(t){this.toggleAttribute("auto-play",!!t)}get facingMode(){let t=this.getAttribute("facing-mode");return"user"!==t?"environment":t}set facingMode(t){this.setAttribute("facing-mode",t)}get zoom(){return Number(this.getAttribute("zoom"))||1}set zoom(t){this.setAttribute("zoom",null!=t?t.toString():t)}get torch(){return this.hasAttribute("torch")}set torch(t){this.toggleAttribute("torch",!!t)}get loading(){return this.hasAttribute("loading")}#z=t=>{let e=t.target;e.play().then(()=>{this.dispatchEvent(new CustomEvent(`${tp}:video-play`,{bubbles:!0,composed:!0,detail:{video:e}}))}).catch(t=>{this.dispatchEvent(new CustomEvent(`${tp}:error`,{bubbles:!0,composed:!0,detail:{error:t}}))}).finally(()=>{this.removeAttribute("loading")})};#_(t,e){var i,o,r;if(!this.#L)return;let[a]=this.#L.getVideoTracks(),s=this.getTrackCapabilities(),n=this.getTrackSettings(),l="pan"===t||"tilt"===t||"zoom"===t?(i=Number(e),o=s[t]?.min||1,r=s[t]?.max||1,Number.isNaN(o)&&(o=0),Number.isNaN(r)&&(r=0),Math.min(Math.max(i,Math.min(o,r)),Math.max(o,r))):e;t in n&&a.applyConstraints({advanced:[{[t]:l}]}).catch(()=>{})}#T(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}async startVideoStream(t){if(!tf.isSupported()||this.#L)return;this.setAttribute("loading","");let e={video:{facingMode:{ideal:this.facingMode},pan:!0,tilt:!0,zoom:!0,torch:this.torch},audio:!1};if("string"==typeof t&&t.trim().length>0&&(e.video.deviceId={exact:t}),"string"==typeof this.cameraResolution&&this.cameraResolution.trim().length>0){let[t=0,i=0]=this.cameraResolution.split("x").map(t=>Number(t));t>0&&i>0&&(e.video.width=t,e.video.height=i)}try{this.#L=await navigator.mediaDevices.getUserMedia(e),this.#S&&(this.#S.srcObject=this.#L),this.#_("pan",this.pan),this.#_("tilt",this.tilt),this.#_("zoom",this.zoom)}catch(t){this.dispatchEvent(new CustomEvent(`${tp}:error`,{bubbles:!0,composed:!0,detail:{error:t}}))}finally{this.removeAttribute("loading")}}restartVideoStream(t){this.#L&&this.#S&&this.stopVideoStream(),this.startVideoStream(t)}stopVideoStream(){if(!this.#S||!this.#L)return;let[t]=this.#L.getVideoTracks();t?.stop(),this.#S.srcObject=null,this.#L=null}getSupportedConstraints(){return tf.isSupported()&&navigator.mediaDevices.getSupportedConstraints()||{}}getTrackCapabilities(){if(!this.#L)return{};let[t]=this.#L.getVideoTracks();return t&&"function"==typeof t.getCapabilities&&t.getCapabilities()||{}}getTrackSettings(){if(!this.#L)return{};let[t]=this.#L.getVideoTracks();return t&&"function"==typeof t.getSettings&&t.getSettings()||{}}static async getVideoInputDevices(){return navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices?(await navigator.mediaDevices.enumerateDevices()||[]).filter(t=>"videoinput"===t.kind&&!!t.deviceId):[]}static isSupported(){return!!navigator.mediaDevices?.getUserMedia}static defineCustomElement(t=tp){"undefined"==typeof window||window.customElements.get(t)||window.customElements.define(t,tf)}}var tv="clipboard-copy",ty="success",tw="error",tE=document.createElement("template"),tA=`
  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }
`;tE.innerHTML=`
  <style>${tA}</style>
  <button type="button" part="button">
    <slot name="copy">Copy</slot>
    <slot name="success" hidden>Copied!</slot>
    <slot name="error" hidden>Error</slot>
  </button>
`;var tx=class t extends HTMLElement{#t=void 0;#p=null;#e=null;#o=null;#r=null;constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(tE.content.cloneNode(!0)),this.shadowRoot&&(this.#p=this.shadowRoot.querySelector("button"),this.#e=this.shadowRoot.querySelector('slot[name="copy"]'),this.#o=this.shadowRoot.querySelector('slot[name="success"]'),this.#r=this.shadowRoot.querySelector('slot[name="error"]'))}static get observedAttributes(){return["disabled"]}attributeChangedCallback(t,e,i){"disabled"===t&&e!==i&&this.#p&&(this.#p.disabled=this.disabled,this.#p.setAttribute("aria-disabled",this.disabled.toString()),this.#p.part.contains("button")&&this.#p.part.toggle("button--disabled",this.disabled))}connectedCallback(){this.#a("value"),this.#a("from"),this.#a("disabled"),this.#a("feedbackDuration"),this.#p?.addEventListener("click",this.#E)}disconnectedCallback(){this.#p?.removeEventListener("click",this.#E),this.#w()}get value(){return this.getAttribute("value")||""}set value(t){this.setAttribute("value",null!=t?t.toString():t)}get from(){return this.getAttribute("from")||""}set from(t){this.setAttribute("from",null!=t?t.toString():t)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",!!t)}get feedbackDuration(){return Number(this.getAttribute("feedback-duration"))||1e3}set feedbackDuration(t){this.setAttribute("feedback-duration",null!=t?t.toString():t)}async #m(){if(!(!this.value&&!this.from))try{let t="";if(this.value)t=this.value;else if(this.from){let e="getRootNode"in Element.prototype?this.#p?.getRootNode({composed:!0}):this.#p?.ownerDocument;if(!e||!(e instanceof Document||e instanceof ShadowRoot))return;let i=e.querySelector(this.from);if(!i)return;t=i instanceof HTMLInputElement||i instanceof HTMLTextAreaElement?i.value:i instanceof HTMLAnchorElement&&i.hasAttribute("href")?i.href:i.textContent||""}await navigator.clipboard.writeText(t),this.#c(ty),this.dispatchEvent(new CustomEvent(`${tv}-success`,{bubbles:!0,composed:!0,detail:{value:t}}))}catch(t){this.#c(tw),this.dispatchEvent(new CustomEvent(`${tv}-error`,{bubbles:!0,composed:!0,detail:{error:t}}))}}#E=t=>{t.preventDefault(),this.disabled||this.#t||this.#m()};#c(t){this.#e&&(this.#e.hidden=!0),this.#o&&(this.#o.hidden=t!==ty),this.#r&&(this.#r.hidden=t!==tw),this.#p?.part.remove("button--success"),this.#p?.part.remove("button--error"),this.#p?.part.add(`button--${t}`),this.#t&&clearTimeout(this.#t),this.#t=setTimeout(()=>{this.#e&&(this.#e.hidden=!1),this.#o&&(this.#o.hidden=!0),this.#r&&(this.#r.hidden=!0),this.#p?.part.remove(`button--${t}`),this.#t=void 0},this.feedbackDuration)}#w(){this.#t&&clearTimeout(this.#t),this.#t=void 0,this.#e&&(this.#e.hidden=!1),this.#o&&(this.#o.hidden=!0),this.#r&&(this.#r.hidden=!0),this.#p?.part.remove("button--success"),this.#p?.part.remove("button--error")}#a(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(e=tv){"u">typeof window&&!window.customElements.get(e)&&window.customElements.define(e,t)}};class tC extends tx{constructor(){super();let t=this.shadowRoot.querySelector('slot[name="copy"]'),e=this.shadowRoot.querySelector('slot[name="success"]'),i=this.shadowRoot.querySelector('slot[name="error"]');t.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.125em" height="1.125em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
      </svg>
      <span class="text">Copy</span>
    `,e.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.125em" height="1.125em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
      </svg>
      <span class="text">Copied!</span>
    `,i.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.125em" height="1.125em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path fill-rule="evenodd" d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708"/>
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
      </svg>
      <span class="text">Error</span>
    `}static get observedAttributes(){return[...super.observedAttributes,"only-icon"]}attributeChangedCallback(t,e,i){if(super.attributeChangedCallback(t,e,i),"only-icon"===t&&e!==i){let t=this.shadowRoot.querySelector('slot[name="copy"]'),e=this.shadowRoot.querySelector('slot[name="success"]'),i=this.shadowRoot.querySelector('slot[name="error"]'),o=t.querySelector(".text"),r=e.querySelector(".text"),a=i.querySelector(".text");o?.toggleAttribute("hidden",this.onlyIcon),r?.toggleAttribute("hidden",this.onlyIcon),a?.toggleAttribute("hidden",this.onlyIcon)}}get onlyIcon(){return this.hasAttribute("only-icon")}set onlyIcon(t){t?this.setAttribute("only-icon",""):this.removeAttribute("only-icon")}connectedCallback(){super.connectedCallback(),this.#T("onlyIcon"),this.hasAttribute("feedback-duration")||this.setAttribute("feedback-duration","1500")}disconnectedCallback(){super.disconnectedCallback()}#T(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(t="custom-clipboard-copy"){"undefined"==typeof window||window.customElements.get(t)||window.customElements.define(t,tC)}}function tk(t){return null!==t&&"object"==typeof t?"share"in navigator&&"canShare"in navigator&&navigator.canShare(t):"share"in navigator}tC.defineCustomElement();var Q=n("1ggGL");const tL=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0}),tS=`
  :host {
    --color-flash: #ffff99;

    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }

  .result {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    position: relative;
    width: 100%;
    padding: 0.5rem;
  }

  .result__item {
    word-wrap: break-word;
    word-break: break-word;
  }

  a.result__item {
    color: var(--links);
  }

  .result__datetime {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-block-start: 0.25rem;
  }

  .result__datetime:empty {
    display: none !important;
  }

  .result__actions {
    display: flex;
    align-items: center;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .result web-share button,
  .result custom-clipboard-copy::part(button) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem;
    background-color: transparent;
    border: 0;
    border-radius: var(--border-radius);
    color: inherit;
    line-height: 1;
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .result custom-clipboard-copy::part(button--success) {
    color: var(--success-color);
  }

  .result custom-clipboard-copy::part(button--error) {
    color: var(--danger-color);
  }

  .flash {
    animation: flash 0.4s ease-out;
  }

  @keyframes flash {
    0% {
      background-color: #ffff99;
    }
    100% {
      background-color: transparent;
    }
  }
`,t_=document.createElement("template");t_.innerHTML=`
  <style>${tS}</style>

  <div class="result" part="result">
    <div class="result__content">
      <div class="result__meta"></div>
      <div class="result__datetime"></div>
    </div>

    <div class="result__actions">
      <custom-clipboard-copy only-icon></custom-clipboard-copy>

      <web-share>
        <button slot="button" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
        </button>
      </web-share>
    </div>
  </div>
`;class tT extends HTMLElement{constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(t_.content.cloneNode(!0))}get value(){return this.getAttribute("value")}set value(t){this.setAttribute("value",t)}static get observedAttributes(){return["value"]}attributeChangedCallback(t,e,i){"value"===t&&e!==i&&this.#I(this.value)}connectedCallback(){if(this.#T("value"),window.matchMedia("(prefers-reduced-motion: no-preference)").matches){let t=this.shadowRoot.querySelector(".result");t?.animate([{backgroundColor:"var(--color-flash)"},{backgroundColor:"transparent"}],{duration:400,easing:"ease-out"})}if(!tk()){let t=this.shadowRoot.querySelector("web-share");t&&(t.hidden=!0)}}async #I(t){let e,i=this.shadowRoot.querySelector(".result"),o=i?.querySelector(".result__content"),r=i?.querySelector(".result__datetime"),a=i?.querySelector(".result__item");a&&a?.remove();try{let[,i]=await (0,Q.getSettings)();new URL(t),(e=document.createElement("a")).href=t,i?.openWebPageSameTab||(e.setAttribute("target","_blank"),e.setAttribute("rel","noreferrer noopener")),i?.openWebPage?e.click():window.requestAnimationFrame(()=>e.focus())}catch{e=document.createElement("span")}e.className="result__item",e.part="result__item",e.textContent=t;let s=i.querySelector(".result__meta");if(s){s.textContent="";let t=this.getAttribute("data-title")||"",e=this.getAttribute("data-brand")||"",i=this.getAttribute("data-description")||"";if(t){let e=document.createElement("div");e.className="result__meta-title",e.textContent=t,s.appendChild(e)}if(e){let t=document.createElement("div");t.className="result__meta-brand",t.textContent=`Brand: ${e}`,s.appendChild(t)}if(i){let t=document.createElement("div");t.className="result__meta-description",t.textContent=i,s.appendChild(t)}}r.textContent=tL.format(new Date),o?.insertBefore(e,r);let n=i?.querySelector("custom-clipboard-copy"),l=i?.querySelector("web-share");if(n){let e=n.shadowRoot?.querySelector("button");n.setAttribute("value",t),e?.setAttribute("aria-label",`Copy to clipboard ${t}`),n.hidden=!1}if(l&&tk()){let e=l.querySelector("button");l.setAttribute("share-text",t),l.hidden=!1,e?.setAttribute("aria-label",`Share ${t}`)}}#T(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(t="bs-result"){"undefined"==typeof window||window.customElements.get(t)||window.customElements.define(t,tT)}}tT.defineCustomElement();var Q=n("1ggGL");class tz extends HTMLElement{#R=null;#N=null;#D=[];#M;constructor(){super()}get supportedFormats(){return this.#D}set supportedFormats(t){this.#D=t,this.#F()}async connectedCallback(){this.#T("supportedFormats"),this.#R=this.querySelector("#formatsList"),this.#N=this.querySelector("form");let[,t]=await (0,Q.getSettings)();this.#M=t??{},this.#N?.querySelectorAll('[name="general-settings"]').forEach(t=>{t.checked=this.#M[t.value]})}#F(){if(!this.#R)return;let t=this.#M?.formats;this.#R.replaceChildren(),this.supportedFormats.forEach(e=>{let i=document.createElement("li"),o=document.createElement("label"),r=document.createElement("input");r.type="checkbox",r.name="formats-settings",r.value=e,r.checked=null==t||t.includes(e),o.appendChild(r),o.appendChild(document.createTextNode(e)),i.appendChild(o),this.#R.appendChild(i)})}#T(t){if(Object.prototype.hasOwnProperty.call(this,t)){let e=this[t];delete this[t],this[t]=e}}static defineCustomElement(t="bs-settings"){"undefined"==typeof window||window.customElements.get(t)||window.customElements.define(t,tz)}}tz.defineCustomElement();var Q=n("1ggGL"),tI=n("ftYLF"),tR=n("ccbGL"),tN=n("iW3id"),te=n("9qKt3"),Q=n("1ggGL");const tD="scans";async function tM(){if(!(0,tR.isFirebaseConfigured)()||!tR.db)return te.log.warn("Firestore not configured. Running in local-only mode."),{error:null};try{return await (0,tI.enableIndexedDbPersistence)(tR.db),te.log.info("Firestore offline persistence enabled"),{error:null}}catch(t){return"failed-precondition"===t.code?te.log.warn("Firestore persistence failed: Multiple tabs open"):"unimplemented"===t.code?te.log.warn("Firestore persistence not supported in this browser"):te.log.error("Error enabling Firestore persistence:",t),{error:t}}}async function tF(t){let e=(0,tN.getUserId)();if(!(0,tR.isFirebaseConfigured)()||!tR.db||!e){te.log.info("Saving scan locally (Firebase not available or user not authenticated)");try{let[,e=[]]=await (0,Q.getHistory)(),i={value:t.value,addedAt:Date.now(),expiresAt:Date.now()+6048e5,notified:!1,preNotified:!1,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",metadata:t.metadata||{}};return await (0,Q.setHistory)([...e,i]),{error:null,scanId:null}}catch(t){return te.log.error("Error saving scan locally:",t),{error:t,scanId:null}}}try{let i={userId:e,value:t.value,format:t.format||"",title:t.title||"",brand:t.brand||"",description:t.description||"",metadata:t.metadata||{},scannedAt:tI.Timestamp.now(),createdAt:tI.Timestamp.now(),updatedAt:tI.Timestamp.now()},o=await (0,tI.addDoc)((0,tI.collection)(tR.db,tD),i);te.log.info("Scan saved to Firestore:",o.id);try{let[,e=[]]=await (0,Q.getHistory)(),i={value:t.value,addedAt:Date.now(),expiresAt:Date.now()+6048e5,notified:!1,preNotified:!1,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:o.id};await (0,Q.setHistory)([...e,i])}catch(t){te.log.warn("Error saving to local storage:",t)}return{error:null,scanId:o.id}}catch(e){te.log.error("Error saving scan to Firestore:",e);try{let[,e=[]]=await (0,Q.getHistory)(),i={value:t.value,addedAt:Date.now(),expiresAt:Date.now()+6048e5,notified:!1,preNotified:!1,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",pendingSync:!0};await (0,Q.setHistory)([...e,i]),te.log.info("Scan saved locally, will sync when online")}catch(t){te.log.error("Error saving to local storage:",t)}return{error:e,scanId:null}}}async function tB(t=100){let e=(0,tN.getUserId)();if(!(0,tR.isFirebaseConfigured)()||!tR.db||!e){te.log.info("Getting scans from local storage (Firebase not available or user not authenticated)");try{let[t,e=[]]=await (0,Q.getHistory)();if(t)return{error:t,scans:[]};let i=e.map(t=>({id:t.firestoreId||null,value:"string"==typeof t?t:t.value,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",scannedAt:t.addedAt?new Date(t.addedAt):new Date,metadata:t.metadata||{}}));return{error:null,scans:i}}catch(t){return te.log.error("Error getting scans from local storage:",t),{error:t,scans:[]}}}try{let i=(0,tI.query)((0,tI.collection)(tR.db,tD),(0,tI.where)("userId","==",e),(0,tI.orderBy)("scannedAt","desc"),(0,tI.limit)(t)),o=await (0,tI.getDocs)(i),r=[];return o.forEach(t=>{r.push({id:t.id,...t.data(),scannedAt:t.data().scannedAt?.toDate()||new Date})}),te.log.info(`Retrieved ${r.length} scans from Firestore`),{error:null,scans:r}}catch(t){te.log.error("Error getting scans from Firestore:",t);try{let[t,e=[]]=await (0,Q.getHistory)();if(!t){let t=e.map(t=>({id:t.firestoreId||null,value:"string"==typeof t?t:t.value,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",scannedAt:t.addedAt?new Date(t.addedAt):new Date,metadata:t.metadata||{}}));return te.log.info("Returning scans from local storage (Firestore unavailable)"),{error:null,scans:t}}}catch(t){te.log.error("Error getting scans from local storage:",t)}return{error:t,scans:[]}}}async function tq(t){let e=(0,tN.getUserId)();if(!(0,tR.isFirebaseConfigured)()||!tR.db||!e||!t)return te.log.info("Deleting scan from local storage only"),{error:null};try{return await (0,tI.deleteDoc)((0,tI.doc)(tR.db,tD,t)),te.log.info("Scan deleted from Firestore:",t),{error:null}}catch(t){return te.log.error("Error deleting scan from Firestore:",t),{error:t}}}async function tH(){let t=(0,tN.getUserId)();if(!(0,tR.isFirebaseConfigured)()||!tR.db||!t){te.log.info("Deleting all scans from local storage only");try{return await (0,Q.setHistory)([]),{error:null,deletedCount:0}}catch(t){return{error:t,deletedCount:0}}}try{let e=(0,tI.query)((0,tI.collection)(tR.db,tD),(0,tI.where)("userId","==",t)),i=await (0,tI.getDocs)(e),o=(0,tI.writeBatch)(tR.db),r=0;i.forEach(t=>{o.delete(t.ref),r++}),await o.commit(),te.log.info(`Deleted ${r} scans from Firestore`);try{await (0,Q.setHistory)([])}catch(t){te.log.warn("Error clearing local storage:",t)}return{error:null,deletedCount:r}}catch(t){return te.log.error("Error deleting all scans from Firestore:",t),{error:t,deletedCount:0}}}async function t$(){let t=(0,tN.getUserId)();if(!(0,tR.isFirebaseConfigured)()||!tR.db||!t)return{error:Error("Firebase not configured or user not authenticated"),syncedCount:0};try{let[t,e=[]]=await (0,Q.getHistory)();if(t)return{error:t,syncedCount:0};let i=e.filter(t=>!0===t.pendingSync);if(0===i.length)return{error:null,syncedCount:0};let o=0,r=[...e];for(let t of i)try{let e=await tF({value:t.value,title:t.title,brand:t.brand,description:t.description,format:t.format,metadata:t.metadata});if(!e.error&&e.scanId){let i=r.findIndex(e=>e===t);-1!==i&&(r[i]={...r[i],firestoreId:e.scanId,pendingSync:!1}),o++}}catch(t){te.log.error("Error syncing individual scan:",t)}return await (0,Q.setHistory)(r),te.log.info(`Synced ${o} pending scans to Firestore`),{error:null,syncedCount:o}}catch(t){return te.log.error("Error syncing pending scans:",t),{error:t,syncedCount:0}}}var tR=n("ccbGL"),tN=n("iW3id"),te=n("9qKt3");const tO=`
  :host {
    --empty-history-button-color: #ffffff;

    display: block;
    box-sizing: border-box;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --empty-history-button-color: #000000;
    }
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }

  ul {
    max-width: 36.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ul li {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--border);
    color: var(--text-main);
  }

  ul li:last-of-type {
    border-bottom: none;
  }

  ul li a {
    color: var(--links);
  }

  ul li a,
  ul li span {
    word-break: break-all;
  }

  @supports (-webkit-line-clamp: 1) and (display: -webkit-box) and (-webkit-box-orient: vertical) {
    ul li a,
    ul li span {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    }
  }

  .actions {
    display: flex;
    gap: 0.25rem;
  }

  .actions button,
  .actions custom-clipboard-copy::part(button) {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    margin: 0;
    border: 0;
    border-radius: var(--border-radius);
    background-color: transparent !important;
    line-height: 1;
    font-size: 1rem;
    color: var(--text-main);
    cursor: pointer;
  }

  .actions custom-clipboard-copy::part(button--success) {
    color: var(--success-color);
  }

  .actions custom-clipboard-copy::part(button--error) {
    color: var(--danger-color);
  }

  .actions .details-action {
    color: var(--info-color);
  }

  .actions .delete-action {
    color: var(--danger-color);
    margin-right: -0.5rem;
  }

  footer {
    position: sticky;
    bottom: 0;
    padding: 0.75rem;
    background-color: var(--dialog-background);
  }

  footer > button {
    width: 100%;
    padding: 0.625rem;
    border: 0;
    border-radius: var(--border-radius);
    background-color: var(--danger-color);
    color: var(--empty-history-button-color);
    font-size: 1rem;
    cursor: pointer;
  }

  ul:empty + footer > button {
    display: none;
  }

  ul:not(:empty) + footer > div {
    display: none;
  }

  /* Product info styles */
  ul li strong {
    font-weight: 600;
    color: var(--text-main);
  }

  ul li small {
    font-size: 0.85em;
    opacity: 0.7;
  }

  .history-item-clickable {
    cursor: pointer;
  }

  .history-item-clickable:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .history-item-clickable strong {
    color: var(--links);
  }
`,tP=document.createElement("template");tP.innerHTML=`
  <style>${tO}</style>
  <ul id="historyList"></ul>
  <footer>
    <div>There are no saved items in history.</div>
    <div style="display:flex;gap:0.5rem;">
      <button type="button" id="emptyHistoryBtn">Empty history</button>
    </div>
  </footer>
`;class tj extends HTMLElement{#B=null;#q=null;#H=864e5;static #$=6048e5;static #O(){try{let t=new URLSearchParams(window.location.search),e=t.get("testExpireSeconds"),i=e?Number(e):NaN;if(!Number.isNaN(i)&&i>0)return 1e3*i;let o=t.get("testMode");if("1"===o||"true"===String(o).toLowerCase())return 1e4}catch(t){}return tj.#$}constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(tP.content.cloneNode(!0))}async connectedCallback(){this.#B=this.shadowRoot?.getElementById("historyList"),this.#q=this.shadowRoot?.getElementById("emptyHistoryBtn");let[,t=[]]=await (0,Q.getHistory)(),e=[],i=!1;try{if("function"==typeof tR.isFirebaseConfigured&&"function"==typeof tN.isAuthenticated&&(0,tR.isFirebaseConfigured)()&&(0,tN.isAuthenticated)()){i=!0;let{error:o,scans:r}=await tB();if(!o&&r){let i=r.map(t=>({value:t.value||"",addedAt:t.scannedAt?t.scannedAt.getTime():Date.now(),expiresAt:t.scannedAt?t.scannedAt.getTime()+tj.#O():Date.now()+tj.#O(),notified:!1,preNotified:!1,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:t.id||null}));te.log.info(`Loaded ${i.length} scans from Firestore`);let o=(t||[]).map(t=>{if(!t)return null;if("string"==typeof t){let e=Date.now();return{value:t,addedAt:e,expiresAt:e+tj.#O(),notified:!1,preNotified:!1}}return{value:t.value??t?.barcode??"",addedAt:t.addedAt??Date.now(),expiresAt:t.expiresAt??(t.addedAt?t.addedAt+tj.#O():Date.now()+tj.#O()),notified:!!t.notified,preNotified:!!t.preNotified,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:t.firestoreId||null}}).filter(Boolean),a=new Map;i.forEach(t=>{a.set(t.value,t)}),o.forEach(t=>{a.has(t.value)||a.set(t.value,t)}),e=Array.from(a.values())}}}catch(t){te.log.error("Firebase not available or error loading from Firestore:",t),i=!1}if(!i||0===e.length){let i=(t||[]).map(t=>{if(!t)return null;if("string"==typeof t){let e=Date.now();return{value:t,addedAt:e,expiresAt:e+tj.#O(),notified:!1,preNotified:!1}}return{value:t.value??t?.barcode??"",addedAt:t.addedAt??Date.now(),expiresAt:t.expiresAt??(t.addedAt?t.addedAt+tj.#O():Date.now()+tj.#O()),notified:!!t.notified,preNotified:!!t.preNotified,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:t.firestoreId||null}}).filter(Boolean);e=i,await (0,Q.setHistory)(i)}this.#P(e||[]);try{let t=new URLSearchParams(window.location.search),e=t.get("testExpireSeconds"),i=t.get("testMode");if(e||i){let t=e?String(Number(e)):"10";try{tm(`Test expiry active: items expire in ${t} second${"1"===t?"":"s"}`,{variant:"warning"})}catch(t){}}}catch(t){}this.#B?.addEventListener("click",this.#j),this.#q?.addEventListener("click",this.#V),this.#U()}disconnectedCallback(){this.#B?.removeEventListener("click",this.#j),this.#q?.removeEventListener("click",this.#V),this.#W()}async add(t){if(!t)return;let e={type:"add",message:"Error adding barcode to history"},[i,o=[]]=await (0,Q.getHistory)();if(i||!Array.isArray(o))return this.#G("bs-history-error",e),i;let r=(o||[]).map(t=>"string"==typeof t?{value:t,addedAt:Date.now(),expiresAt:Date.now()+tj.#O(),notified:!1,preNotified:!1}:{value:t.value??t.barcode??"",addedAt:t.addedAt??Date.now(),expiresAt:t.expiresAt??(t.addedAt?t.addedAt+tj.#O():Date.now()+tj.#O()),notified:!!t.notified,preNotified:!!t.preNotified}),a="string"==typeof t?t:t.value,s=r.find(t=>t.value===a);if(s){try{let t=tj.#O();if(t<tj.#$){s.expiresAt=Date.now()+t,s.notified=!1,s.preNotified=!1;let[e]=await (0,Q.setHistory)(r);if(!e){let t=this.#B?.querySelector(`li[data-value="${a}"]`);if(t){let e=t.querySelector(".history-countdown");e&&(e.dataset.expiresAt=String(s.expiresAt),e.textContent=this.#Y(s.expiresAt-Date.now()))}this.#G("bs-history-success",{type:"add",message:"Barcode expiry refreshed for testing"}),this.#K()}return null}}catch(t){}return}let n=Date.now(),l={value:a,addedAt:n,expiresAt:n+tj.#O(),notified:!1,preNotified:!1},d=[...r,l],[c]=await (0,Q.setHistory)(d);if(c)return te.log.error("Error setting history",c),this.#G("bs-history-error",e),c;this.#B?.insertBefore(this.#J(l),this.#B.firstElementChild);try{let t=new Date(l.expiresAt),e=Math.round((l.expiresAt-Date.now())/864e5);tm(`Expires on ${t.toLocaleString()} (~${e} day${1===e?"":"s"})`,{variant:"info"})}catch(t){}return this.#G("bs-history-success",{type:"add",message:"Barcode added to history"}),this.#K(),null}async remove(t){if(!t)return;let e={type:"remove",message:"Error removing barcode from history"};try{if("function"==typeof tR.isFirebaseConfigured&&"function"==typeof tN.isAuthenticated&&(0,tR.isFirebaseConfigured)()&&(0,tN.isAuthenticated)()){let e=this.#B?.querySelector(`li[data-value="${t}"]`),i=e?.dataset.firestoreId;if(i&&1){let{error:t}=await tq(i);t&&te.log.error("Error deleting scan from Firestore:",t)}}}catch(t){te.log.error("Firebase not available:",t)}let[i,o=[]]=await (0,Q.getHistory)();if(i||!Array.isArray(o))return this.#G("bs-history-error",e),i;let r=(o||[]).filter(e=>"string"==typeof e?e!==t:e.value!==t),[a]=await (0,Q.setHistory)(r);if(a)return te.log.error("Error setting history",a),this.#G("bs-history-error",e),a;let s=this.#B?.querySelector(`li[data-value="${t}"]`);return s?.remove(),this.#G("bs-history-success",{type:"remove",message:"Barcode removed from history"}),this.#K(),null}async empty(){try{if("function"==typeof tR.isFirebaseConfigured&&"function"==typeof tN.isAuthenticated&&(0,tR.isFirebaseConfigured)()&&(0,tN.isAuthenticated)()&&1){let{error:t,deletedCount:e}=await tH();t?te.log.error("Error deleting all scans from Firestore:",t):te.log.info(`Deleted ${e} scans from Firestore`)}}catch(t){te.log.error("Firebase not available:",t)}let[t]=await (0,Q.setHistory)([]);return t?(te.log.error("Error setting history",t),this.#G("bs-history-error",{type:"empty",message:"Error emptying history"}),t):(this.#B?.replaceChildren(),this.#G("bs-history-success",{type:"empty",message:"History emptied successfully"}),this.#K(),null)}async loadHistory(){let[,t=[]]=await (0,Q.getHistory)(),e=[],i=!1;try{if("function"==typeof tR.isFirebaseConfigured&&"function"==typeof tN.isAuthenticated&&(0,tR.isFirebaseConfigured)()&&(0,tN.isAuthenticated)()){i=!0;let{error:o,scans:r}=await tB();if(!o&&r){let i=r.map(t=>({value:t.value||"",addedAt:t.scannedAt?t.scannedAt.getTime():Date.now(),expiresAt:t.scannedAt?t.scannedAt.getTime()+tj.#O():Date.now()+tj.#O(),notified:!1,preNotified:!1,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:t.id||null})),o=(t||[]).map(t=>{if(!t)return null;if("string"==typeof t){let e=Date.now();return{value:t,addedAt:e,expiresAt:e+tj.#O(),notified:!1,preNotified:!1}}return{value:t.value??t?.barcode??"",addedAt:t.addedAt??Date.now(),expiresAt:t.expiresAt??(t.addedAt?t.addedAt+tj.#O():Date.now()+tj.#O()),notified:!!t.notified,preNotified:!!t.preNotified,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:t.firestoreId||null}}).filter(Boolean),a=new Map;i.forEach(t=>{a.set(t.value,t)}),o.forEach(t=>{a.has(t.value)||a.set(t.value,t)}),e=Array.from(a.values())}}}catch(t){te.log.error("Firebase not available or error loading:",t),i=!1}if(!i||0===e.length){let i=(t||[]).map(t=>{if(!t)return null;if("string"==typeof t){let e=Date.now();return{value:t,addedAt:e,expiresAt:e+tj.#O(),notified:!1,preNotified:!1}}return{value:t.value??t?.barcode??"",addedAt:t.addedAt??Date.now(),expiresAt:t.expiresAt??(t.addedAt?t.addedAt+tj.#O():Date.now()+tj.#O()),notified:!!t.notified,preNotified:!!t.preNotified,title:t.title||"",brand:t.brand||"",description:t.description||"",format:t.format||"",firestoreId:t.firestoreId||null}}).filter(Boolean);e=i,await (0,Q.setHistory)(i)}this.#P(e||[])}#P(t){if(!this.#B)return;this.#B.replaceChildren();let e=document.createDocumentFragment();[...t].reverse().forEach(t=>e.appendChild(this.#J(t))),this.#B.appendChild(e)}#J(t){let e,i=document.createElement("li"),o="string"==typeof t?t:t.value||"",r=t?.expiresAt||Date.now()+tj.#O(),a=t?.firestoreId||null,s=t?.title||"",n=t?.brand||"",l=t?.description||"";i.setAttribute("data-value",o),a&&i.setAttribute("data-firestore-id",a),s&&i.setAttribute("data-title",s),n&&i.setAttribute("data-brand",n),l&&i.setAttribute("data-description",l);try{new URL(o),(e=document.createElement("a")).href=o,e.setAttribute("target","_blank"),e.setAttribute("rel","noreferrer noopener")}catch{(e=document.createElement("span")).className="history-item-clickable",e.setAttribute("data-action","view-details")}s?e.innerHTML=`<strong>${s}</strong><br><small>${o}</small>`:e.textContent=o;let d=document.createElement("span");d.className="history-countdown",d.setAttribute("aria-live","polite"),d.dataset.expiresAt=String(r),d.textContent=this.#Y(r-Date.now()),i.appendChild(e),i.appendChild(d);let c=document.createElement("div");c.className="actions";let h=document.createElement("custom-clipboard-copy"),u=h.shadowRoot?.querySelector("button");h.setAttribute("only-icon",""),h.setAttribute("value",o),u?.setAttribute("aria-label",`Copy to clipboard ${o}`),c.appendChild(h);let m=document.createElement("button");return m.type="button",m.className="delete-action",m.setAttribute("data-action","delete"),m.setAttribute("aria-label",`Remove from history ${o}`),m.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" width="1.125em" height="1.125em" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
      </svg>
    `,c.appendChild(m),i.appendChild(c),i}#j=async t=>{let e=t.target;if(e.closest('[data-action="delete"]')){let t=e.closest("li").dataset.value;window.confirm(`Delete history item ${t}?`)&&this.remove(t);return}if(e.closest('[data-action="view-details"]')){let t=e.closest("li"),i=t.dataset.value,o=t.dataset.title||"",r=t.dataset.brand||"",a=t.dataset.description||"",s=[];o&&s.push(`\u{1F4E6} Product: ${o}`),r&&s.push(`\u{1F3F7}\u{FE0F} Brand: ${r}`),a&&s.push(`\u{1F4DD} Description: ${a}`),s.push(`\u{1F522} Barcode: ${i}`),o||r||a?alert(s.join("\n\n")):alert(`Barcode: ${i}

(No product information available)`);return}};#Z=null;#U(){this.#Z||(this.#Z=setInterval(()=>this.#K(),1e3),this.#K())}#W(){this.#Z&&(clearInterval(this.#Z),this.#Z=null)}async #K(){try{let[,t=[]]=await (0,Q.getHistory)(),e=(t||[]).map(t=>"string"==typeof t?{value:t,addedAt:Date.now(),expiresAt:Date.now()+tj.#O(),notified:!1,preNotified:!1}:{value:t.value??t.barcode??"",addedAt:t.addedAt??Date.now(),expiresAt:t.expiresAt??(t.addedAt?t.addedAt+tj.#O():Date.now()+tj.#O()),notified:!!t.notified,preNotified:!!t.preNotified}),i=Date.now(),o=tj.#O(),r=this.#H;try{o<this.#H&&(r=Math.max(1e3,Math.floor(.2*o)))}catch(t){r=this.#H}(this.shadowRoot?.querySelectorAll(".history-countdown")||[]).forEach(t=>{let e=Number(t.dataset.expiresAt)||i;t.textContent=this.#Y(e-i)});let a=!1,s=e.filter(t=>t&&(t.expiresAt||0)-i>0&&(t.expiresAt||0)-i<=r&&!t.preNotified).length;for(let t of e){if(!t)continue;let e=(t.expiresAt||0)-i;e>0&&e<=r&&!t.preNotified&&(this.#X(t,e,s),t.preNotified=!0,a=!0),e<=0&&!t.notified&&(this.#Q(t),t.notified=!0,a=!0)}a&&await (0,Q.setHistory)(e)}catch(t){}}async #X(t,e,i=1){try{let o=`${t.value} will expire in ${this.#Y(e)}.`;Number.isFinite(i)&&i>0&&(1===i?o+=" You have one more item that will expire soon; the next notification will be when it expires.":i>1&&(o+=` You have ${i} items that will expire soon.`));try{tm(o,{variant:"warning"})}catch(t){}"Notification"in window&&("default"===Notification.permission&&await Notification.requestPermission(),"granted"===Notification.permission&&new Notification("Item will expire soon",{body:o}))}catch(t){}}#Y(t){if(t<=0)return"Expired";let e=Math.floor(t/1e3),i=Math.floor(e/86400),o=Math.floor(e%86400/3600),r=Math.floor(e%3600/60),a=e%60;return i>0?`${i}d ${o}h ${r}m left`:o>0?`${o}h ${r}m ${a}s left`:r>0?`${r}m ${a}s left`:`${a}s left`}async #Q(t){try{let e=`${t.value} has expired.`;try{tm(e,{variant:"danger"})}catch(t){}"Notification"in window&&("default"===Notification.permission&&await Notification.requestPermission(),"granted"===Notification.permission&&new Notification("Item expired",{body:e}))}catch(t){}}#V=async()=>{window.confirm("Empty history? This action cannot be undone.")&&this.empty()};#G(t,e=null){let i=new CustomEvent(t,{bubbles:!0,composed:!0,detail:e});this.dispatchEvent(i)}static defineCustomElement(t="bs-history"){"undefined"==typeof window||window.customElements.get(t)||window.customElements.define(t,tj)}}tj.defineCustomElement();var tR=n("ccbGL"),tN=n("iW3id"),te=n("9qKt3");const tV=`
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }

  .auth-container {
    padding: 1rem;
  }

  .auth-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--background-secondary, #f5f5f5);
    border-radius: var(--border-radius, 0.25rem);
    margin-bottom: 1rem;
  }

  .auth-status__icon {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: var(--primary-color, #0066cc);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .auth-status__info {
    flex: 1;
  }

  .auth-status__email {
    font-weight: 600;
    color: var(--text-main);
  }

  .auth-status__type {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .auth-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .auth-tab {
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .auth-tab.active {
    color: var(--text-main);
    border-bottom-color: var(--primary-color);
  }

  .auth-form {
    display: none;
  }

  .auth-form.active {
    display: block;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-main);
  }

  .form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-family: inherit;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .btn {
    width: 100%;
    padding: 0.625rem;
    border: 0;
    border-radius: var(--border-radius);
    background-color: var(--primary-color, #0066cc);
    color: white;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: var(--secondary-color, #6c757d);
  }

  .btn-danger {
    background-color: var(--danger-color, #dc3545);
  }

  .error-message {
    padding: 0.5rem;
    margin-bottom: 1rem;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: var(--border-radius);
    color: #c00;
    font-size: 0.875rem;
  }

  .info-message {
    padding: 0.75rem;
    margin-bottom: 1rem;
    background-color: #e7f3ff;
    border: 1px solid #b3d9ff;
    border-radius: var(--border-radius);
    color: #004085;
    font-size: 0.875rem;
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 1rem 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border);
  }

  .divider::before {
    margin-right: 0.5rem;
  }

  .divider::after {
    margin-left: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .auth-status {
      background-color: #2a2a2a;
    }

    .error-message {
      background-color: #3d1a1a;
      border-color: #5a2626;
      color: #ff8080;
    }

    .info-message {
      background-color: #1a2d3d;
      border-color: #264d73;
      color: #80c4ff;
    }
  }
`,tU=document.createElement("template");tU.innerHTML=`
  <style>${tV}</style>
  <div class="auth-container">
    <div id="authStatus" hidden>
      <div class="auth-status">
        <div class="auth-status__icon" id="userIcon"></div>
        <div class="auth-status__info">
          <div class="auth-status__email" id="userEmail"></div>
          <div class="auth-status__type" id="userType"></div>
        </div>
      </div>
      <button type="button" class="btn btn-danger" id="signOutBtn">Sign Out</button>
    </div>

    <div id="authForms" hidden>
      <div class="info-message" id="firebaseNotConfigured" hidden>
        <strong>Firebase Not Configured</strong><br>
        Your scans are being saved locally. To sync across devices, configure Firebase in your project.
        <div style="margin-top:0.5rem;">
          <small>Paste your Firebase web app config (JSON) below and click Configure to enable auth & syncing.</small>
          <textarea id="firebaseConfigInput" style="width:100%;height:6rem;margin-top:0.5rem;font-family:monospace;" placeholder='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'></textarea>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;"><button type="button" class="btn" id="firebaseConfigureBtn">Configure Firebase</button><button type="button" class="btn btn-secondary" id="firebaseClearBtn">Clear</button></div>
        </div>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="anonymous">Quick Start</button>
        <button class="auth-tab" data-tab="signin">Sign In</button>
        <button class="auth-tab" data-tab="signup">Sign Up</button>
      </div>

      <div class="auth-form active" id="anonymousForm">
        <div class="info-message">
          Start scanning immediately without creating an account. Your scans will be saved to your device and synced to the cloud.
        </div>
        <button type="button" class="btn" id="anonymousBtn">Continue Without Account</button>
      </div>

      <div class="auth-form" id="signinForm">
        <form>
          <div class="form-group">
            <label for="signinEmail">Email</label>
            <input type="email" id="signinEmail" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="signinPassword">Password</label>
            <input type="password" id="signinPassword" required autocomplete="current-password">
          </div>
          <div id="signinError" class="error-message" hidden></div>
          <button type="submit" class="btn" id="signinBtn">Sign In</button>
        </form>
        <div class="divider">or</div>
        <button type="button" class="btn btn-secondary" id="signinAnonymousBtn">Continue Without Account</button>
      </div>

      <div class="auth-form" id="signupForm">
        <form>
          <div class="form-group">
            <label for="signupEmail">Email</label>
            <input type="email" id="signupEmail" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="signupPassword">Password</label>
            <input type="password" id="signupPassword" required autocomplete="new-password" minlength="6">
          </div>
          <div class="form-group">
            <label for="signupDisplayName">Display Name (optional)</label>
            <input type="text" id="signupDisplayName" autocomplete="name">
          </div>
          <div id="signupError" class="error-message" hidden></div>
          <button type="submit" class="btn" id="signupBtn">Create Account</button>
        </form>
        <div class="divider">or</div>
        <button type="button" class="btn btn-secondary" id="signupAnonymousBtn">Continue Without Account</button>
      </div>
    </div>
  </div>
`;class tW extends HTMLElement{#tt=null;#te=null;#ti=null;constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(tU.content.cloneNode(!0))}connectedCallback(){this.#tt=this.shadowRoot.getElementById("authStatus"),this.#te=this.shadowRoot.getElementById("authForms"),this.#to();let t=this.shadowRoot.getElementById("firebaseConfigureBtn"),e=this.shadowRoot.getElementById("firebaseClearBtn");t&&t.addEventListener("click",()=>this.#tr()),e&&e.addEventListener("click",()=>this.#ta()),this.#ti=(0,tN.onAuthStateChange)(t=>{this.#ts(t)});let i=(0,tN.getCurrentUser)();this.#ts(i)}disconnectedCallback(){this.#ti&&this.#ti()}#to(){this.shadowRoot.querySelectorAll(".auth-tab").forEach(t=>{t.addEventListener("click",()=>this.#tn(t.dataset.tab))}),this.shadowRoot.getElementById("anonymousBtn")?.addEventListener("click",()=>this.#tl()),this.shadowRoot.getElementById("signinAnonymousBtn")?.addEventListener("click",()=>this.#tl()),this.shadowRoot.getElementById("signupAnonymousBtn")?.addEventListener("click",()=>this.#tl()),this.shadowRoot.getElementById("signinForm")?.addEventListener("submit",t=>this.#td(t)),this.shadowRoot.getElementById("signupForm")?.addEventListener("submit",t=>this.#tc(t)),this.shadowRoot.getElementById("signOutBtn")?.addEventListener("click",()=>this.#th())}#tn(t){let e=this.shadowRoot.querySelectorAll(".auth-tab"),i=this.shadowRoot.querySelectorAll(".auth-form");e.forEach(e=>{e.dataset.tab===t?e.classList.add("active"):e.classList.remove("active")}),i.forEach(e=>{e.id===`${t}Form`?e.classList.add("active"):e.classList.remove("active")})}async #tl(){let t=this.shadowRoot.getElementById("anonymousBtn");t&&(t.disabled=!0);let{error:e,user:i}=await (0,tN.signInAnonymous)();e?(te.log.error("Error signing in anonymously:",e),tm("Error signing in. Please try again.",{variant:"danger"}),t&&(t.disabled=!1)):tm("Signed in successfully!",{variant:"success"})}async #td(t){t.preventDefault();let e=this.shadowRoot.getElementById("signinEmail"),i=this.shadowRoot.getElementById("signinPassword"),o=this.shadowRoot.getElementById("signinError"),r=this.shadowRoot.getElementById("signinBtn");r&&(r.disabled=!0),o&&(o.hidden=!0);let{error:a,user:s}=await (0,tN.signInWithEmail)(e.value,i.value);a?(te.log.error("Error signing in:",a),o&&(o.textContent=this.#tu(a),o.hidden=!1),r&&(r.disabled=!1)):(tm("Signed in successfully!",{variant:"success"}),i.value="")}async #tc(t){t.preventDefault();let e=this.shadowRoot.getElementById("signupEmail"),i=this.shadowRoot.getElementById("signupPassword"),o=this.shadowRoot.getElementById("signupDisplayName"),r=this.shadowRoot.getElementById("signupError"),a=this.shadowRoot.getElementById("signupBtn");a&&(a.disabled=!0),r&&(r.hidden=!0);let{error:s,user:n}=await (0,tN.createAccount)(e.value,i.value,o.value);s?(te.log.error("Error creating account:",s),r&&(r.textContent=this.#tu(s),r.hidden=!1),a&&(a.disabled=!1)):(tm("Account created successfully!",{variant:"success"}),i.value="")}async #th(){let t=this.shadowRoot.getElementById("signOutBtn");t&&(t.disabled=!0);let{error:e}=await (0,tN.signOut)();e?(te.log.error("Error signing out:",e),tm("Error signing out. Please try again.",{variant:"danger"}),t&&(t.disabled=!1)):tm("Signed out successfully",{variant:"success"})}async #tr(){let t=this.shadowRoot.getElementById("firebaseConfigInput");if(!t)return;let e=t.value.trim();if(!e)return void tm("Please paste your Firebase config JSON first",{variant:"warning"});let i=null;try{i=JSON.parse(e)}catch(t){tm("Invalid JSON. Please check and try again.",{variant:"danger"});return}let{error:o}=(0,tR.initFirebaseRuntime)(i);if(o){te.log.error("Error initializing Firebase with provided config:",o),tm("Failed to initialize Firebase. Check console for details.",{variant:"danger"});return}try{await tM()}catch(t){}try{await (0,tN.initAuth)()||await (0,tN.signInAnonymous)()}catch(t){}try{this.#ti&&this.#ti(),this.#ti=(0,tN.onAuthStateChange)(t=>this.#ts(t))}catch(t){}this.shadowRoot.getElementById("firebaseNotConfigured")?.setAttribute("hidden",""),tm("Firebase configured successfully",{variant:"success"});let r=this.shadowRoot.getElementById("signinBtn"),a=this.shadowRoot.getElementById("signupBtn");r&&(r.disabled=!1),a&&(a.disabled=!1)}#ta(){let t=this.shadowRoot.getElementById("firebaseConfigInput");t&&(t.value="")}#ts(t){if(t){this.#tt?.removeAttribute("hidden"),this.#te?.setAttribute("hidden","");let e=this.shadowRoot.getElementById("userIcon"),i=this.shadowRoot.getElementById("userEmail"),o=this.shadowRoot.getElementById("userType");e&&(e.textContent=t.email?t.email[0].toUpperCase():"?"),i&&(i.textContent=t.email||"Anonymous User"),o&&(o.textContent=t.isAnonymous?"Anonymous Account":"Email Account"),this.dispatchEvent(new CustomEvent("auth-state-changed",{bubbles:!0,composed:!0,detail:{user:t}}))}else this.#tt?.setAttribute("hidden",""),this.#te?.removeAttribute("hidden"),this.dispatchEvent(new CustomEvent("auth-state-changed",{bubbles:!0,composed:!0,detail:{user:null}}))}#tu(t){switch(t.code){case"auth/email-already-in-use":return"This email is already in use. Please sign in or use a different email.";case"auth/invalid-email":return"Invalid email address.";case"auth/weak-password":return"Password should be at least 6 characters.";case"auth/user-not-found":return"No account found with this email.";case"auth/wrong-password":return"Incorrect password.";case"auth/too-many-requests":return"Too many failed attempts. Please try again later.";case"auth/network-request-failed":return"Network error. Please check your connection.";default:return t.message||"An error occurred. Please try again."}}static defineCustomElement(t="bs-auth"){"undefined"==typeof window||window.customElements.get(t)||window.customElements.define(t,tW)}}tW.defineCustomElement();var tN=n("iW3id"),tR=n("ccbGL");!async function(){try{try{(0,tR.initFirebaseRuntime)()}catch(t){}if((0,tR.isFirebaseConfigured)()){te.log.info("Initializing Firebase..."),await tM(),await (0,tN.initAuth)()||(te.log.info("No user signed in, signing in anonymously..."),await (0,tN.signInAnonymous)());let{syncedCount:t}=await t$();t>0&&tm(`Synced ${t} scans from offline mode`,{variant:"success"}),window.addEventListener("online",async()=>{te.log.info("Back online, syncing pending scans...");let{syncedCount:t}=await t$();t>0&&tm(`Synced ${t} scans`,{variant:"success"})}),window.addEventListener("offline",()=>{te.log.info("Offline mode - scans will be saved locally"),tm("Offline mode - scans will sync when online",{variant:"warning"})})}else te.log.info("Firebase not configured - using local storage only")}catch(t){te.log.error("Error initializing Firebase:",t),tm("Running in offline mode",{variant:"warning"})}let t=document.querySelector("a-tab-group"),e=document.querySelector("video-capture"),i=document.querySelector("bs-settings"),o=document.querySelector("bs-history"),r=document.getElementById("cameraPanel"),a=r.querySelector(".results"),s=document.getElementById("filePanel"),n=s.querySelector(".results"),l=document.getElementById("scanInstructions"),d=document.getElementById("scanBtn"),c=document.getElementById("dropzone"),h=document.querySelector("resize-observer"),u=document.getElementById("scanFrame"),m=document.getElementById("torchButton"),p=document.getElementById("globalActions"),b=document.getElementById("authBtn"),g=document.getElementById("authDialog"),f=document.getElementById("historyBtn"),v=document.getElementById("historyDialog"),y=document.getElementById("settingsBtn"),w=document.getElementById("settingsDialog"),E=document.getElementById("settingsForm"),A=document.getElementById("cameraSelect"),x=null,C=!0;"function"==typeof HTMLDialogElement&&(p?.removeAttribute("hidden"),g?.removeAttribute("hidden"),v?.removeAttribute("hidden"),w?.removeAttribute("hidden"));let{barcodeReaderError:k}=await td.setup();if(k){let e=document.getElementById("barcodeReaderError");C=!1,p?.setAttribute("hidden",""),t?.setAttribute("hidden",""),e?.setAttribute("open","");return}let L=await td.getSupportedFormats(),[,S]=await (0,Q.getSettings)(),_=S?.formats||L,T=await td.create(_);async function z(t,e,i=""){try{let o=await th(t);if(o){let r=o.title||o.name||o.alias||"",a=o.description||o.brand||"",s=`${r||t}${a?` \u{2014} ${a}`:""}`;tm(s,{variant:"success"}),function(t,e){if(!t||!e)return;let i=t.querySelector("#itemInfo");if(!i){(i=document.createElement("div")).id="itemInfo",i.className="item-info";let e=t.querySelector(".results");e&&e.parentNode?e.parentNode.insertBefore(i,e.nextSibling):t.appendChild(i)}i.textContent="";let o=document.createElement("h3");o.className="item-info__title",o.textContent=e.title||e.name||e.alias||"";let r=document.createElement("p");r.className="item-info__description",r.textContent=e.description||"";let a=document.createElement("p");a.className="item-info__brand",a.textContent=e.brand?`Brand: ${e.brand}`:"",i.appendChild(o),r.textContent&&i.appendChild(r),a.textContent&&i.appendChild(a)}(e,o);try{let i=e?.querySelector(".results");if(i){let e=i.querySelector(`bs-result[value="${t}"]`);e&&(o.title&&e.setAttribute("data-title",o.title),o.brand&&e.setAttribute("data-brand",o.brand),o.description&&e.setAttribute("data-description",o.description))}}catch(t){}try{await tF({value:t,format:i,title:o.title||o.name||o.alias||"",brand:o.brand||"",description:o.description||"",metadata:{source:"camera",hasProductInfo:!0}})}catch(t){te.log.warn("Error saving scan to Firestore:",t)}return o}try{await tF({value:t,format:i,metadata:{source:"camera",hasProductInfo:!1}})}catch(t){te.log.warn("Error saving scan to Firestore:",t)}}catch(e){try{await tF({value:t,format:i,metadata:{source:"camera",hasProductInfo:!1,lookupFailed:!0}})}catch(t){te.log.warn("Error saving scan to Firestore:",t)}}}e.addEventListener("video-capture:video-play",F,{once:!0}),e.addEventListener("video-capture:error",function(t){let e=t.detail.error;if("NotFoundError"===e.name)return;let i="NotAllowedError"===e.name?"<strong>Error accessing camera</strong><br>Permission to use webcam was denied or video Autoplay is disabled. Reload the page to give appropriate permissions to webcam.":e.message;r.innerHTML=`
      <alert-element variant="danger" open>
        <span slot="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </span>
        ${i}
      </alert-element>
    `},{once:!0}),tf.defineCustomElement();let I=e?.shadowRoot,R=I?.querySelector("video"),N=I?.querySelector('[part="actions-container"]');async function D(){if(C){te.log.info("Scanning..."),l?.removeAttribute("hidden");try{let[,t]=await (0,Q.getSettings)(),e=await T.detect(R),i=e?.rawValue??"",s=e?.format??"";if(!i)throw Error("No barcode detected");if(ti(a,i),z(i,r,s),t?.addToHistory)try{await o?.add(i),v&&(v.open=!0,setTimeout(()=>{try{let t=o?.shadowRoot?.querySelector(`li[data-value="${i}"]`);t?.scrollIntoView({behavior:"smooth",block:"center"}),t?.classList?.add("highlight"),setTimeout(()=>t?.classList?.remove("highlight"),2e3)}catch(t){}},50))}catch(t){}if(ts(),!t?.continueScanning){x&&(clearTimeout(x),x=null),d?.removeAttribute("hidden"),u?.setAttribute("hidden",""),N?.setAttribute("hidden","");return}}catch{}C&&(x=setTimeout(()=>D(),1e3))}}async function M(t){if(!t)return;let[,e]=await (0,Q.getSettings)(),i=new Image,r=new FileReader;r.onload=r=>{let a=r.target.result;i.onload=async()=>{try{let t=await T.detect(i),r=t?.rawValue??"",a=t?.format??"";if(!r)throw Error("No barcode detected");if(ti(n,r),z(r,s,a),e?.addToHistory)try{await o?.add(r),v&&(v.open=!0,setTimeout(()=>{try{let t=o?.shadowRoot?.querySelector(`li[data-value="${r}"]`);t?.scrollIntoView({behavior:"smooth",block:"center"}),t?.classList?.add("highlight"),setTimeout(()=>t?.classList?.remove("highlight"),2e3)}catch(t){}},50))}catch(t){}ts()}catch(t){te.log.error(t),tm("<strong>No barcode detected</strong><br><small>Please try again with a different image.</small>",{variant:"danger",trustDangerousInnerHTML:!0}),ts({success:!1})}},i.src=a,i.alt="Image preview",c.replaceChildren();let l=document.createElement("div");l.className="dropzone-preview";let d=document.createElement("div");d.className="dropzone-preview__image-wrapper";let h=document.createElement("div");h.className="dropzone-preview__file-name",h.textContent=t.name,d.appendChild(i),l.appendChild(d),l.appendChild(h),c.prepend(l)},r.readAsDataURL(t)}async function F(t){u?.removeAttribute("hidden"),tn(t.detail.video,u),D();let i=t.target.getTrackSettings(),o=t.target.getTrackCapabilities(),r=document.getElementById("zoomLevel");if(o?.torch&&(m?.addEventListener("click",q),m?.removeAttribute("hidden"),e.hasAttribute("torch")&&tu({el:m,isTorchOn:!0})),i?.zoom&&o?.zoom){let t=document.getElementById("zoomControls"),a=o?.zoom?.min||0,s=o?.zoom?.max||10,n=i?.zoom||1;t?.addEventListener("click",t=>{let i=t.target.closest('[data-action="zoom-in"]'),o=t.target.closest('[data-action="zoom-out"]');i&&n<s&&(n+=.5),o&&n>a&&(n-=.5),r.textContent=n.toFixed(1),e.zoom=n}),t?.removeAttribute("hidden"),r.textContent=n.toFixed(1)}let a=await tf.getVideoInputDevices();a.forEach((t,e)=>{let i=document.createElement("option");i.value=t.deviceId,i.textContent=t.label||`Camera ${e+1}`,A.appendChild(i)}),a.length>1&&(A?.addEventListener("change",H),A?.removeAttribute("hidden"))}async function B(t){t.preventDefault();let e={},i=new FormData(E),o=i.getAll("general-settings"),r=i.getAll("formats-settings");o.forEach(t=>e[t]=!0),e.formats=r,(0,Q.setSettings)(e),"formats-settings"===t.target.name&&(T=await td.create(r))}function q(t){e.torch=!e.torch,tu({el:t.currentTarget,isTorchOn:e.hasAttribute("torch")})}function H(t){if("function"!=typeof e.restartVideoStream)return;let i=t.target.value||void 0;e.restartVideoStream(i)}c.accept=K.join(","),i.supportedFormats=L,d.addEventListener("click",function(){d?.setAttribute("hidden",""),u?.removeAttribute("hidden"),N?.removeAttribute("hidden"),D()}),t.addEventListener("a-tab-show",tt(function(t){let e=t.detail.tabId,i=document.querySelector("video-capture");if("cameraTab"===e){if(C=!0,!i)return;if(!i.loading&&d.hasAttribute("hidden")&&(u?.removeAttribute("hidden"),N?.removeAttribute("hidden"),D()),"function"==typeof i.startVideoStream){let t=A?.value||void 0;i.startVideoStream(t)}}else"fileTab"===e&&(C=!1,null!=i&&"function"==typeof i.stopVideoStream&&i.stopVideoStream(),u?.setAttribute("hidden",""),N?.setAttribute("hidden",""))},250)),c.addEventListener("files-dropzone-drop",function(t){M(t.detail.acceptedFiles[0])}),h.addEventListener("resize-observer:resize",function(){tn(e.shadowRoot.querySelector("video"),u)}),b.addEventListener("click",function(){g.open=!0}),y.addEventListener("click",function(){w.open=!0}),E.addEventListener("change",tt(B,500)),f.addEventListener("click",function(){v.open=!0}),document.addEventListener("visibilitychange",function(){if("cameraTab"===t.querySelector("[selected]").getAttribute("id"))if("hidden"===document.visibilityState)C=!1,null!=e&&"function"==typeof e.stopVideoStream&&e.stopVideoStream();else{C=!0;let t=document.querySelector("video-capture");if(!t)return;if(!t.loading&&d.hasAttribute("hidden")&&D(),"function"==typeof t.startVideoStream){let e=A?.value||void 0;t.startVideoStream(e)}}}),document.addEventListener("keydown",function(e){"Escape"===e.key&&function(){let e=t.querySelector("#cameraTab").hasAttribute("selected"),i=!d.hidden,o=w.hasAttribute("open"),r=v.hasAttribute("open");i&&e&&!(o||r)&&d.click()}()}),document.addEventListener("bs-history-success",function(t){let{type:e,message:i}=t.detail;"add"===e&&tm(i,{variant:"success"})}),document.addEventListener("bs-history-error",function(t){let{type:e,message:i}=t.detail;("remove"===e||"empty"===e)&&v?.hide(),tm(i,{variant:"danger"})})}();
//# sourceMappingURL=barcode-scanner-CS465.cd13b290.js.map
