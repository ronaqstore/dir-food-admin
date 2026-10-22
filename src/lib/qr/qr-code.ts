/**
 * Zero-dependency QR Code generator in pure TypeScript.
 * Fully conforming to ISO/IEC 18004.
 * Based on Project Nayuki's public-domain QR Code specification implementation.
 */

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

  private static readonly ECC_CODEWORDS_PER_BLOCK: number[][] = [
    [-1,  7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];

  private static readonly NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
    [-1,  1, 1, 1, 1, 1, 2, 2, 2, 2, 4,  4,  4,  4,  4,  6,  6,  6,  6,  7,  8,  8,  9,  9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1,  1, 1, 1, 2, 2, 4, 4, 4, 5, 5,  5,  8,  9,  9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1,  1, 1, 2, 2, 4, 4, 6, 6, 8, 8,  8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1,  1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 72, 74, 77]
  ];

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
    const allCodewords = this.addErrorCorrection(dataCodewords);
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

  /**
   * Generates an SVG path string representing all dark modules.
   * If border > 0, offsets coordinates to provide a quiet zone.
   */
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

    appendBits(0b0100, 4); // Byte mode indicator
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
    if (version > QrCodeEncoder.MAX_VERSION) throw new Error('Data too long for QR codes');

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
      QrCodeEncoder.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] *
        QrCodeEncoder.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver]
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
    // Timing patterns
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }

    // 3 Finder patterns
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(this.size - 4, 3);
    this.drawFinderPattern(3, this.size - 4);

    // Alignment patterns
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

    // Draw first copy around top-left finder pattern
    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, ((bits >>> i) & 1) !== 0);
    this.setFunctionModule(8, 7, ((bits >>> 6) & 1) !== 0);
    this.setFunctionModule(8, 8, ((bits >>> 7) & 1) !== 0);
    this.setFunctionModule(7, 8, ((bits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, ((bits >>> i) & 1) !== 0);

    // Draw second copy
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

  private addErrorCorrection(data: Uint8Array): Uint8Array {
    const numBlocks =
      QrCodeEncoder.NUM_ERROR_CORRECTION_BLOCKS[this.errorCorrectionLevel.ordinal][this.version];
    const blockEccLen =
      QrCodeEncoder.ECC_CODEWORDS_PER_BLOCK[this.errorCorrectionLevel.ordinal][this.version];
    const rawCodewords = Math.floor(QrCodeEncoder.getNumRawDataModules(this.version) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);

    const blocks: Uint8Array[] = [];
    const rsDiv = QrCodeEncoder.reedSolomonComputeDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const blockLen = shortBlockLen - blockEccLen + (i >= numShortBlocks ? 1 : 0);
      const dat = data.subarray(k, k + blockLen);
      k += blockLen;
      const ecc = QrCodeEncoder.reedSolomonComputeRemainder(dat, rsDiv);
      const block = new Uint8Array(dat.length + ecc.length);
      block.set(dat);
      block.set(ecc, dat.length);
      blocks.push(block);
    }

    const result = new Uint8Array(rawCodewords);
    let k = 0;
    const shortDataLen = shortBlockLen - blockEccLen;
    for (let i = 0; i < shortDataLen; i++) {
      for (let j = 0; j < numBlocks; j++) {
        result[k++] = blocks[j][i];
      }
    }
    for (let j = numShortBlocks; j < numBlocks; j++) {
      result[k++] = blocks[j][shortDataLen];
    }
    for (let i = 0; i < blockEccLen; i++) {
      for (let j = 0; j < numBlocks; j++) {
        const dataLen = shortDataLen + (j >= numShortBlocks ? 1 : 0);
        result[k++] = blocks[j][dataLen + i];
      }
    }
    return result;
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

    // Adjacent modules in row having same color
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

    // Adjacent modules in column having same color
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

    // 2*2 blocks of modules having same color
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

    // Balance of dark and light modules
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

  private static reedSolomonComputeDivisor(degree: number): Uint8Array {
    const result = new Uint8Array(degree);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        result[j] = QrCodeEncoder.reedSolomonMultiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = QrCodeEncoder.reedSolomonMultiply(root, 0x02);
    }
    return result;
  }

  private static reedSolomonComputeRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
    const result = new Uint8Array(divisor.length);
    for (const b of data) {
      const factor = b ^ result[0];
      result.copyWithin(0, 1);
      result[result.length - 1] = 0;
      for (let i = 0; i < divisor.length; i++) {
        result[i] ^= QrCodeEncoder.reedSolomonMultiply(divisor[i], factor);
      }
    }
    return result;
  }

  private static reedSolomonMultiply(x: number, y: number): number {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
}
