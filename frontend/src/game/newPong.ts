// if id of canvas changes, change it here
let canvasElement: any;
//used to draw stuff in canvas
let ctx: any;
// attributes used when drawing text
const textAttributes = {
  style: 'normal',
  size: 30,
  xAlign: 'left',
  yAlign: 'top',
};
// index -> keycode of held key, value -> true; if empty -> no key held
const heldKeys: boolean[] = [];

//used for the deleteAll function
let elementList: any[] = [];

class buttonClass {
  private readonly buttonElement: HTMLButtonElement;
  private x: number = 0;
  private y: number = 0;
  private w: number = 100;
  private h: number = 100;
  private color: string = 'black';
  private opacity: number = 1;
  private backgroundColor: string = '#ffffff';
  private eventHandler: () => void = () => {};
  private display: string = 'block';

  // to call each time one of the used-in-style values are changed
  private update(): void {
    this.buttonElement.addEventListener('click', this.eventHandler);
    this.buttonElement.setAttribute(
      'style',
      `color: ${this.color};\
background-color: ${this.backgroundColor};\
width: ${this.w}px; height ${this.h}px;\
position: absolute;\
left: ${this.x}px; top: ${this.y}px;
display: ${this.display};
opacity: ${this.opacity};`,
    );
  }
  constructor(buttonElement: HTMLButtonElement) {
    this.buttonElement = buttonElement;
    this.update();
  }
  position(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.update();
  }
  size(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.update();
  }
  mousePressed(func: () => void) {
    this.eventHandler = func;
    this.update();
  }
  style(key: string, value: string) {
    switch (key) {
      case 'color':
        this.color = value;
        break;
      case 'background-color':
        this.backgroundColor = value;
        break;
      case 'opacity':
        this.opacity = Number(value);
        break;
      default:
        console.error(`${key} is invalid for buttonClass.style()`);
    }
    this.update();
  }
  hide() {
    this.display = 'none';
    this.update();
  }
  show() {
    this.display = 'block';
    this.update();
  }
}

class sliderClass {
  public sliderElement: HTMLInputElement;
  private x: number = 0;
  private y: number = 0;
  private w: number = 100;
  private h: number = 100;
  private opacity: number = 1;
  private display: string = 'block';

  constructor(sliderElement: HTMLInputElement) {
    this.sliderElement = sliderElement;
    this.update();
  }
  //to call each time one of the used-in-style values are changed
  private update(): void {
    this.sliderElement.setAttribute(
      'style',
      `opacity: ${this.opacity};\
width: ${this.w}px; height ${this.h}px;\
position: absolute;\
left: ${this.x}px; top: ${this.y}px;`,
    );
  }
  value(): number {
    return Number(this.sliderElement.value);
  }
  position(x: number, y: number) {
    this.x = x;
    // making same offset as p5.js
    this.y = y + this.h / 2;
    this.update();
  }
  size(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.update();
  }
  hide() {
    this.display = 'none';
    this.update();
  }
  show() {
    this.display = 'block';
    this.update();
  }
  style(key: string, value: string) {
    switch (key) {
      case 'opacity':
        this.opacity = Number(value);
        break;
      default:
        console.error(`${key} is invalid for buttonClass.style()`);
    }
    this.update();
  }
  remove(): void {
    elementList = elementList.filter((item) => !(item === this.sliderElement));
    this.sliderElement.parentNode?.removeChild(this.sliderElement);
  }
}

class inputClass {
  private readonly inputElement: HTMLInputElement;
  x: number = 0;
  y: number = 0;
  width: number = 100;
  height: number = 100;
  private opacity: number = 1;
  private display: string = 'block';

  constructor(inputElement: HTMLInputElement) {
    this.inputElement = inputElement;
    this.update();
  }
  //to call each time one of the used-in-style values are changed
  private update(): void {
    this.inputElement.setAttribute(
      'style',
      `opacity: ${this.opacity};\
width: ${this.width}px; height ${this.height}px;\
position: absolute;\
left: ${this.x}px; top: ${this.y}px;`,
    );
  }
  value(): number {
    return Number(this.inputElement.value);
  }
  position(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.update();
  }
  size(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.update();
  }
  hide() {
    this.display = 'none';
    this.update();
  }
  show() {
    this.display = 'block';
    this.update();
  }
  style(key: string, value: string) {
    switch (key) {
      case 'opacity':
        this.opacity = Number(value);
        break;
      default:
        console.error(`${key} is invalid for buttonClass.style()`);
    }
    this.update();
  }
  remove(): void {
    elementList = elementList.filter((item) => !(item === this.inputElement));
    this.inputElement.parentNode?.removeChild(this.inputElement);
  }
  id(s: string): void {
    this.inputElement.setAttribute('id', s);
  }
}
/* === */

//watching keyboard events
window.addEventListener('keydown', (e: any) => {
  heldKeys[e.keyCode] = true;
  p5.keyIsPressed = true;
});
window.addEventListener('keyup', (e: any) => {
  heldKeys.splice(e.keyCode, 1);
  p5.keyIsPressed = heldKeys.length !== 0;
});

//watching mouse events
window.addEventListener(
  'mousemove',
  (evt) => {
    if (canvasElement === undefined) return;
    const rect = canvasElement.getBoundingClientRect();
    p5.mouseX = evt.clientX - rect.left;
    p5.mouseY = evt.clientY - rect.top;
  },
  false,
);

export const p5: {
  keyIsPressed: boolean;
  UP_ARROW: number;
  DOWN_ARROW: number;
  ENTER: number;
  mouseX: number;
  mouseY: number;
  createSlider: (
    min: number,
    mac: number,
    value: number,
    step: number,
  ) => sliderClass;
  createInput: () => inputClass;
  noStroke: () => void;
  stroke: (r: number, g: number, b: number, a: number) => void;
  createButton: (s: string) => buttonClass;
  keyIsDown: (keyCode: number) => boolean;
  textStyle: (style: string) => void;
  textSize: (size: number) => void;
  textAlign: (xAlign: string, yAlign: string) => void;
  text: (s: string, x: number, y: number) => void;
  noFill: () => void;
  fill: (r: number, g: number, b: number, a: number) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  createCanvas: (width: number, height: number) => void;
  resizeCanvas: (width: number, height: number) => void;
  background: (b: number) => void;
  // functions that need to be defined by user
  setup: (ref: HTMLButtonElement) => void;
  draw: () => void;
  deleteAll: () => void;
  setRef: (ref: any) => void;
  ref: null | any;
  sessionId?: number;
} = {
  keyIsPressed: false,
  ref: null,

  setRef(ref) {
    canvasElement = ref;
    ctx = canvasElement.getContext('2d');
  },

  // event keycodes of arrow keys
  UP_ARROW: 38,
  DOWN_ARROW: 40,
  ENTER: 13,
  // mouse vars
  mouseX: 0,
  mouseY: 0,

  createSlider(min: number, max: number, value: number, step: number) {
    const slider = document.createElement('input');
    elementList.push(slider);
    //specifying slider category
    slider.type = 'range';
    slider.classList.add('range');
    slider.classList.add('range-primary');
    slider.classList.add('slider');
    // slider.setAttribute('id', `slide`);

    slider.min = String(min);
    slider.max = String(max);
    slider.value = String(value);
    slider.step = String(step);
    document.body.appendChild(slider);
    return new sliderClass(slider);
  },
  createInput() {
    const input = document.createElement('input');
    elementList.push(input);
    input.classList.add('input');
    input.classList.add('input-sm');
    input.classList.add('input-bordered');
    //specifying slider category
    input.type = 'text';

    document.body.appendChild(input);
    return new inputClass(input);
  },

  noStroke() {
    ctx.strokeStyle = `rgb(${0},${0},${0},${0})`;
  },

  stroke(r: number, g: number, b: number, a: number = 255) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgb(${r},${g},${b},${a / 255})`;
  },

  createButton(s: string): buttonClass {
    const button = document.createElement('button');
    elementList.push(button);
    button.innerText = s;
    button.classList.add('btn-primary');
    button.classList.add('btn');
    button.classList.add('btn-sm');
    document.body.appendChild(button);
    return new buttonClass(button);
  },

  keyIsDown(keyCode: number): boolean {
    return Boolean(heldKeys[keyCode]);
  },

  textStyle(style: string) {
    textAttributes.style = style.toLowerCase();
  },
  textSize(size: number) {
    textAttributes.size = size;
  },
  textAlign(xAlign: string, yAlign: string) {
    textAttributes.xAlign = xAlign.toLowerCase();
    textAttributes.yAlign = yAlign.toLowerCase();
  },

  text(s: string, x: number, y: number) {
    ctx.font = `${textAttributes.style} ${textAttributes.size}px Courier`;
    //xAlign works out of the box
    ctx.textAlign = textAttributes.xAlign;
    //manually doing yAlign
    switch (textAttributes.yAlign) {
      case 'center':
        y = y + textAttributes.size / 2;
        break;
      case 'top':
        y = y + textAttributes.size;
        break;
    }
    ctx.fillText(s, x, y);
  },

  noFill() {
    ctx.fillStyle = `rgb(${0},${0},${0},${0})`;
  },

  fill(r: number, g: number, b: number, a: number = 255) {
    ctx.fillStyle = `rgb(${r},${g},${b},${a / 255.0})`;
  },

  rect(x: number, y: number, w: number, h: number) {
    // to not apply stroke and fill on everything
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    // enabling stroke and fill
    ctx.stroke();
    ctx.fill();
  },

  createCanvas(width: number, height: number) {
    this.resizeCanvas(width, height);
    this.background(0);
  },

  resizeCanvas(width: number, height: number) {
    canvasElement.width = width;
    canvasElement.height = height;
  },

  background(b: number) {
    // to preserve fill color after calling backgroiund()
    const oldFill = ctx.fillStyle;
    this.fill(b, b, b, 255);
    this.rect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = oldFill;
  },
  // functions that need to be defined by user
  setup() {},
  draw() {},
  //for my love, david banziziki <3
  deleteAll() {
    elementList.forEach((e) => e.parentNode?.removeChild(e));
    elementList = [];
    canvasElement.parentNode.removeChild(canvasElement);
    canvasElement = undefined;
    ctx = undefined;
  },
};
