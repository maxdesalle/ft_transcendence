import p5Type from "p5";

export class Slider {
  text: any;
  x: any;
  y: any;
  width: any;
  height: any;
  s1: any;
  s2: any;
  s3: any;
  s4: any;
  isGlobal: any;
  p5Slider: any;
  a: any;
  private _p5: p5Type;
  // x y and width and height in pixels, s1, s2, s3, s4 are arguments passed to p5.js slider constructor
  constructor(
    p5: p5Type,
    t: any,
    x: any,
    y: any,
    w: any,
    h: any,
    s1: any,
    s2: any,
    s3: any,
    s4: any,
    isGlobal: any,
    a?: any
  ) {
    this._p5 = p5;
    this.text = t;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.s1 = s1;
    this.s2 = s2;
    this.s3 = s3;
    this.s4 = s4;
    this.isGlobal = isGlobal;
    this.a = a;
  }

  // call this function to set a p5.js slider to this slider object
  setP5Slider(p5Slider: any, widthOffset: number, heightOffset: number) {
    this.p5Slider = p5Slider;
    this.p5Slider.position(
      this.x + widthOffset + (this.width * 0.1) / 2,
      this.y + heightOffset + this.height / 2
    );
    this.p5Slider.size(this.width * 0.9, this.height / 2);
    this.p5Slider.hide();
  }

  // changes cell opacity to a (0-255)
  setOpacity(a: any) {
    this.a = a;
    if (this.p5Slider !== undefined)
      this.p5Slider.style("opacity", (a / 255).toString());
  }
  // draws surrounding cell of slider (with the text)
  drawCell(r?: any, g?: any, b?: any) {
    let p5 = this._p5;
    // === if nothing is passed
    if (r === undefined && g === undefined && b === undefined)
      r = g = b = 255;
    r = r === undefined ? 0 : r;
    g = g === undefined ? 0 : g;
    b = b === undefined ? 0 : b;
    p5.textStyle(p5.NORMAL);
    p5.noFill();
    p5.stroke(100, 100, 100);
    p5.rect(this.x, this.y, this.width, this.height);
    p5.noStroke();
    p5.textSize((this.width / this.text.length) * 1.3);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill(r, g, b);
    p5.text(this.text, this.x + this.width / 2, this.y + this.height / 8);
  }
}
