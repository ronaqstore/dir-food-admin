/**
 * Zero-dependency QR Code generator in pure TypeScript.
 * Based on Project Nayuki's public-domain QR Code specification implementation.
 */

export const QrEcc = {
  LOW: 0,
  MEDIUM: 1,
  QUARTILE: 2,
  HIGH: 3
} as const;

export type QrEcc = (typeof QrEcc)[keyof typeof QrEcc];

// Error correction codewords per block [version][ecc]
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, -1, -1, -1], // Version 0 (dummy)
  [7, 10, 13, 17], // Version 1
  [10, 16, 22, 28], // Version 2
  [15, 26, 36, 44], // Version 3
  [20, 36, 52, 64], // Version 4
  [26, 48, 72, 88], // Version 5
  [36, 64, 96, 112],
  [40, 72, 108, 130],
  [48, 88, 132, 156],
  [60, 110, 160, 192],
  [72, 130, 192, 224] // Version 10
];

const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, -1, -1, -1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 2, 2],
  [1, 2, 2, 4],
  [1, 2, 4, 4],
  [2, 4, 4, 4],
  [2, 4, 6, 5],
  [2, 4, 6, 6],
  [2, 5, 8, 8],
  [4, 5, 8, 8]
];

export class QrCodeEncoder {
  readonly size: number;
  readonly version: number;
  readonly errorCorrectionLevel: QrEcc;
  private readonly modules: boolean[][];
  private readonly isFunction: boolean[][];

  constructor(
    version: number,
    errorCorrectionLevel: QrEcc,
    dataCodewords: Uint8Array,
    mask: number = -1
  ) {
    if (version < 1 || version > 10) throw new RangeError('Version out of range');
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
        this.applyMask(m); // unapply
      }
      mask = bestMask;
    }
    this.applyMask(mask);
    this.drawFormatBits(mask);
  }

  getModule(x: number, y: number): boolean {
    return x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x];
  }

  /** Generates an SVG path string representing all dark modules */
  toSvgPath(): string {
    const parts: string[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x]) {
          parts.push(`M${x},${y}h1v1h-1z`);
        }
      }
    }
    return parts.join('');
  }

  static encodeText(text: string, ecl: QrEcc = QrEcc.MEDIUM): QrCodeEncoder {
    const bytes = new TextEncoder().encode(text);
    // Bit buffer for byte mode (mode 0100)
    const bb: number[] = [];
    function appendBits(val: number, len: number) {
      for (let i = len - 1; i >= 0; i--) {
        bb.push((val >>> i) & 1);
      }
    }

    appendBits(0b0100, 4); // Byte mode indicator
    // Find smallest version that fits
    let version = 1;
    let capacity = 0;
    for (; version <= 10; version++) {
      const dataCap = QrCodeEncoder.getNumDataCodewords(version, ecl);
      const countBits = version < 10 ? 8 : 16;
      const totalBits = 4 + countBits + bytes.length * 8;
      if (totalBits <= dataCap * 8) {
        capacity = dataCap;
        break;
      }
    }
    if (version > 10) throw new Error('Data too long for QR versions 1-10');

    appendBits(bytes.length, version < 10 ? 8 : 16);
    for (const b of bytes) appendBits(b, 8);

    // Terminator and padding
    const capBits = capacity * 8;
    const terminatorBits = Math.min(4, capBits - bb.length);
    appendBits(0, terminatorBits);
    while (bb.length % 8 !== 0) bb.push(0);

    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bb.length < capBits) {
      appendBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Pack into uint8
    const dataCodewords = new Uint8Array(capacity);
    for (let i = 0; i < bb.length; i++) {
      dataCodewords[i >>> 3] |= bb[i] << (7 - (i & 7));
    }

    return new QrCodeEncoder(version, ecl, dataCodewords);
  }

  private static getNumDataCodewords(ver: number, ecl: QrEcc): number {
    const total = Math.floor(QrCodeEncoder.getNumRawDataModules(ver) / 8);
    const ecPerBlock = ECC_CODEWORDS_PER_BLOCK[ver][ecl];
    const blocks = NUM_ERROR_CORRECTION_BLOCKS[ver][ecl];
    return total - ecPerBlock * blocks;
  }

  private static getNumRawDataModules(ver: number): number {
    const size = ver * 4 + 17;
    let count = size * size;
    count -= 8 * 8 * 3; // 3 finder patterns + separators
    count -= (size - 16) * 2; // timing patterns
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      const alignCount = numAlign * numAlign - 3;
      count -= alignCount * 25;
      count += (numAlign - 2) * 2 * 5; // overlap with timing
    }
    count -= 31; // format bits
    return count;
  }

  private drawFunctionPatterns(): void {
    // Finder patterns
    this.drawFinderPattern(0, 0);
    this.drawFinderPattern(this.size - 7, 0);
    this.drawFinderPattern(0, this.size - 7);

    // Timing patterns
    for (let i = 7; i < this.size - 7; i++) {
      this.setFunctionModule(6, i, i % 2 === 0);
      this.setFunctionModule(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    if (this.version >= 2) {
      const positions = this.getAlignmentPatternPositions();
      for (const y of positions) {
        for (const x of positions) {
          if (
            (x === 6 && y === 6) ||
            (x === 6 && y === this.size - 7) ||
            (x === this.size - 7 && y === 6)
          ) {
            continue;
          }
          this.drawAlignmentPattern(x, y);
        }
      }
    }

    // Dark module
    this.setFunctionModule(8, this.size - 8, true);

    // Reserve format info
    for (let i = 0; i < 9; i++) {
      this.setFunctionModule(8, i, false);
      this.setFunctionModule(i, 8, false);
    }
    for (let i = 0; i < 8; i++) {
      this.setFunctionModule(this.size - 1 - i, 8, false);
      this.setFunctionModule(8, this.size - 1 - i, false);
    }
  }

  private drawFinderPattern(x: number, y: number): void {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const dist = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
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
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        this.setFunctionModule(x + dx, y + dy, dist !== 1);
      }
    }
  }

  private getAlignmentPatternPositions(): number[] {
    if (this.version === 1) return [];
    const num = Math.floor(this.version / 7) + 2;
    const step = this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (num * 2 - 2)) * 2;
    const res = [6];
    for (let pos = this.size - 7; res.length < num; pos -= step) {
      res.splice(1, 0, pos);
    }
    return res;
  }

  private setFunctionModule(x: number, y: number, isDark: boolean): void {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  private addErrorCorrection(data: Uint8Array): Uint8Array {
    const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[this.version][this.errorCorrectionLevel];
    const blockEccLen = ECC_CODEWORDS_PER_BLOCK[this.version][this.errorCorrectionLevel];
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

    // Interleave
    const result = new Uint8Array(rawCodewords);
    let idx = 0;
    for (let i = 0; i < blocks[0].length; i++) {
      for (let j = 0; j < blocks.length; j++) {
        if (i < blocks[j].length) {
          result[idx++] = blocks[j][i];
        }
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
        if (!this.isFunction[y][x]) {
          let invert = false;
          switch (mask) {
            case 0:
              invert = (x + y) % 2 === 0;
              break;
            case 1:
              invert = y % 2 === 0;
              break;
            case 2:
              invert = x % 3 === 0;
              break;
            case 3:
              invert = (x + y) % 3 === 0;
              break;
            case 4:
              invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
              break;
            case 5:
              invert = ((x * y) % 2) + ((x * y) % 3) === 0;
              break;
            case 6:
              invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
              break;
            case 7:
              invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
              break;
          }
          if (invert) this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
  }

  private drawFormatBits(mask: number): void {
    const data = (this.errorCorrectionLevel << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.modules[i][8] = ((bits >>> (14 - i)) & 1) !== 0;
    this.modules[7][8] = ((bits >>> 8) & 1) !== 0;
    this.modules[8][8] = ((bits >>> 7) & 1) !== 0;
    this.modules[8][7] = ((bits >>> 6) & 1) !== 0;
    for (let i = 9; i < 15; i++) this.modules[8][14 - i] = ((bits >>> (14 - i)) & 1) !== 0;

    for (let i = 0; i < 8; i++) this.modules[8][this.size - 1 - i] = ((bits >>> i) & 1) !== 0;
    for (let i = 8; i < 15; i++) this.modules[this.size - 15 + i][8] = ((bits >>> i) & 1) !== 0;
  }

  private getPenaltyScore(): number {
    let result = 0;
    // Simple evaluation
    for (let y = 0; y < this.size; y++) {
      let runColor = false;
      let runLen = 0;
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x] === runColor) {
          runLen++;
          if (runLen === 5) result += 3;
          else if (runLen > 5) result++;
        } else {
          runColor = this.modules[y][x];
          runLen = 1;
        }
      }
    }
    return result;
  }

  private static reedSolomonComputeDivisor(degree: number): Uint8Array {
    let result = new Uint8Array([1]);
    let root = 1;
    for (let i = 0; i < degree; i++) {
      const next = new Uint8Array(result.length + 1);
      for (let j = 0; j < result.length; j++) {
        next[j] ^= QrCodeEncoder.reedSolomonMultiply(result[j], root);
        next[j + 1] ^= result[j];
      }
      result = next;
      root = QrCodeEncoder.reedSolomonMultiply(root, 0x02);
    }
    return result;
  }

  private static reedSolomonComputeRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
    const result = new Uint8Array(divisor.length - 1);
    for (const b of data) {
      const factor = b ^ result[0];
      result.copyWithin(0, 1);
      result[result.length - 1] = 0;
      for (let i = 0; i < result.length; i++) {
        result[i] ^= QrCodeEncoder.reedSolomonMultiply(divisor[i + 1], factor);
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
