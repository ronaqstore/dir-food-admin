
import { AppError } from '@/lib/errors';
import {
  addQrErrorCorrection,
  ECC_CODEWORDS_PER_BLOCK,
  NUM_ERROR_CORRECTION_BLOCKS
} from './reed-solomon';

export const QrEcc = {
  LOW: { ordinal: 0, formatBits: 1 },
  MEDIUM: { ordinal: 1, formatBits: 0 },
  QUARTILE: { ordinal: 2, formatBits: 3 },
  HIGH: { ordinal: 3, formatBits: 2 }
} as const;

export type QrEcc = (typeof QrEcc)[keyof typeof QrEcc];

export class QrCodeEncoder {
  static readonly MIN_VERSION: number = 1;
  static readonly MAX_VERSION: number = 40;

  private static readonly PENALTY_N1: number = 3;
  private static readonly PENALTY_N2: number = 3;
  private static readonly PENALTY_N3: number = 40;
  private static readonly PENALTY_N4: number = 10;

  readonly size: number;
  readonly version: number;
  readonly mask: number;
  readonly errorCorrectionLevel: QrEcc;
  private readonly modules: boolean[][];
  private isFunction: boolean[][];

  constructor(
    version: number,
    errorCorrectionLevel: QrEcc,
    dataCodewords: Uint8Array,
    mask: number = -1
  ) {
    if (version < QrCodeEncoder.MIN_VERSION || version > QrCodeEncoder.MAX_VERSION) {
      throw new RangeError('Version out of range');
    }
    this.version = version;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false)
    );
    this.isFunction = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false)
    );

    this.drawFunctionPatterns();
    const rawCodewords = Math.floor(QrCodeEncoder.getNumRawDataModules(this.version) / 8);
    const allCodewords = addQrErrorCorrection(
      dataCodewords,
      this.version,
      this.errorCorrectionLevel.ordinal,
      rawCodewords
    );
    this.drawCodewords(allCodewords);

    if (mask === -1) {
      let minPenalty = 1e9;
      let bestMask = 0;
      for (let m = 0; m < 8; m++) {
        this.applyMask(m);
        this.drawFormatBits(m);
        const penalty = this.getPenaltyScore();
        if (penalty < minPenalty) {
          minPenalty = penalty;
          bestMask = m;
        }
        this.applyMask(m);
      }
      mask = bestMask;
    }
    this.mask = mask;
    this.applyMask(mask);
    this.drawFormatBits(mask);
    this.isFunction = [];
  }

  getModule(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x];
  }

  toSvgPath(border: number = 0): string {
    const parts: string[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x]) {
          parts.push(`M${x + border},${y + border}h1v1h-1z`);
        }
      }
    }
    return parts.join('');
  }

  static encodeText(text: string, ecl: QrEcc = QrEcc.MEDIUM): QrCodeEncoder {
    const bytes = new TextEncoder().encode(text);
    const bb: number[] = [];
    function appendBits(val: number, len: number) {
      for (let i = len - 1; i >= 0; i--) {
        bb.push((val >>> i) & 1);
      }
    }

    appendBits(0b0100, 4);
    let version = 1;
    let capacity = 0;
    for (; version <= QrCodeEncoder.MAX_VERSION; version++) {
      const dataCap = QrCodeEncoder.getNumDataCodewords(version, ecl);
      const countBits = version < 10 ? 8 : 16;
      const totalBits = 4 + countBits + bytes.length * 8;
      if (totalBits <= dataCap * 8) {
        capacity = dataCap;
        break;
      }
    }
    if (version > QrCodeEncoder.MAX_VERSION) throw new AppError('Data too long for QR codes');

    appendBits(bytes.length, version < 10 ? 8 : 16);
    for (const b of bytes) appendBits(b, 8);

    const capBits = capacity * 8;
    appendBits(0, Math.min(4, capBits - bb.length));
    while (bb.length % 8 !== 0) bb.push(0);

    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bb.length < capBits) {
      appendBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    const dataCodewords = new Uint8Array(capacity);
    for (let i = 0; i < bb.length; i++) {
      dataCodewords[i >>> 3] |= bb[i] << (7 - (i & 7));
    }

    return new QrCodeEncoder(version, ecl, dataCodewords);
  }

  private static getNumDataCodewords(ver: number, ecl: QrEcc): number {
    return (
      Math.floor(QrCodeEncoder.getNumRawDataModules(ver) / 8) -
      ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] *
        NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver]
    );
  }

  private static getNumRawDataModules(ver: number): number {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  private drawFunctionPatterns(): void {
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }

    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(this.size - 4, 3);
    this.drawFinderPattern(3, this.size - 4);

    const alignPatPos = this.getAlignmentPatternPositions();
    const numAlign = alignPatPos.length;
    for (let i = 0; i < numAlign; i++) {
      for (let j = 0; j < numAlign; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === numAlign - 1) ||
          (i === numAlign - 1 && j === 0)
        ) {
          continue;
        }
        this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
      }
    }

    this.drawFormatBits(0);
    this.drawVersion();
  }

  private drawFormatBits(mask: number): void {
    const data = (this.errorCorrectionLevel.formatBits << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, ((bits >>> i) & 1) !== 0);
    this.setFunctionModule(8, 7, ((bits >>> 6) & 1) !== 0);
    this.setFunctionModule(8, 8, ((bits >>> 7) & 1) !== 0);
    this.setFunctionModule(7, 8, ((bits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, ((bits >>> i) & 1) !== 0);

    for (let i = 0; i < 8; i++) {
      this.setFunctionModule(this.size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
    }
    for (let i = 8; i < 15; i++) {
      this.setFunctionModule(8, this.size - 15 + i, ((bits >>> i) & 1) !== 0);
    }
    this.setFunctionModule(8, this.size - 8, true);
  }

  private drawVersion(): void {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, bit);
      this.setFunctionModule(b, a, bit);
    }
  }

  private drawFinderPattern(x: number, y: number): void {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
          this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  private drawAlignmentPattern(x: number, y: number): void {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  private setFunctionModule(x: number, y: number, isDark: boolean): void {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  private drawCodewords(data: Uint8Array): void {
    let bitIdx = 0;
    let right = this.size - 1;
    let upward = true;

    while (right > 0) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++) {
        const y = upward ? this.size - 1 - vert : vert;
        for (let i = 0; i < 2; i++) {
          const x = right - i;
          if (!this.isFunction[y][x]) {
            let dark = false;
            if (bitIdx < data.length * 8) {
              dark = ((data[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) !== 0;
              bitIdx++;
            }
            this.modules[y][x] = dark;
          }
        }
      }
      upward = !upward;
      right -= 2;
    }
  }

  private applyMask(mask: number): void {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let invert = false;
        switch (mask) {
          case 0:  invert = (x + y) % 2 === 0;                    break;
          case 1:  invert = y % 2 === 0;                          break;
          case 2:  invert = x % 3 === 0;                          break;
          case 3:  invert = (x + y) % 3 === 0;                    break;
          case 4:  invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5:  invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6:  invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          case 7:  invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (!this.isFunction[y][x] && invert) {
          this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
  }

  private getPenaltyScore(): number {
    let result = 0;

    for (let y = 0; y < this.size; y++) {
      let runColor = false;
      let runX = 0;
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x] === runColor) {
          runX++;
          if (runX === 5) result += QrCodeEncoder.PENALTY_N1;
          else if (runX > 5) result++;
        } else {
          runColor = this.modules[y][x];
          runX = 1;
        }
      }
    }

    for (let x = 0; x < this.size; x++) {
      let runColor = false;
      let runY = 0;
      for (let y = 0; y < this.size; y++) {
        if (this.modules[y][x] === runColor) {
          runY++;
          if (runY === 5) result += QrCodeEncoder.PENALTY_N1;
          else if (runY > 5) result++;
        } else {
          runColor = this.modules[y][x];
          runY = 1;
        }
      }
    }

    for (let y = 0; y < this.size - 1; y++) {
      for (let x = 0; x < this.size - 1; x++) {
        const color = this.modules[y][x];
        if (
          color === this.modules[y][x + 1] &&
          color === this.modules[y + 1][x] &&
          color === this.modules[y + 1][x + 1]
        ) {
          result += QrCodeEncoder.PENALTY_N2;
        }
      }
    }

    let dark = 0;
    for (const row of this.modules) {
      dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
    }
    const total = this.size * this.size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    if (k > 0) result += k * QrCodeEncoder.PENALTY_N4;

    return result;
  }

  private getAlignmentPatternPositions(): number[] {
    if (this.version === 1) return [];
    const numAlign = Math.floor(this.version / 7) + 2;
    const step =
      this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

}
