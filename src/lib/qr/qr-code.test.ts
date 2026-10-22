import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QrCodeEncoder, QrEcc } from './qr-code.ts';

describe('QrCodeEncoder', () => {
  it('encodes short text into version 1 or 2', () => {
    const qr = QrCodeEncoder.encodeText('HELLO', QrEcc.MEDIUM);
    assert.ok(qr.version >= 1);
    assert.equal(qr.size, qr.version * 4 + 17);
    const svgPath = qr.toSvgPath();
    assert.ok(svgPath.length > 0);
    assert.ok(svgPath.startsWith('M'));
  });

  it('encodes standard local restaurant URL without error', () => {
    const url = 'http://localhost:3005/r/dir-hujra-restarents';
    const qr = QrCodeEncoder.encodeText(url, QrEcc.MEDIUM);
    assert.equal(qr.version, 4);
    assert.equal(qr.size, 33); // 4 * 4 + 17
    const svgPath = qr.toSvgPath();
    assert.ok(svgPath.length > 500);
  });

  it('encodes long production URLs across multiple versions', () => {
    const longUrl = 'https://timergara.dirfood.com/r/dir-hujra-restarents-timergara-main-bazaar-special-deals?source=standee';
    const qr = QrCodeEncoder.encodeText(longUrl, QrEcc.MEDIUM);
    assert.ok(qr.version >= 5 && qr.version <= 14);
    assert.ok(qr.toSvgPath().length > 1000);
  });

  it('accurately reports finder pattern module states', () => {
    const qr = QrCodeEncoder.encodeText('https://dirfood.com', QrEcc.MEDIUM);
    // Top-left finder pattern center is at (3, 3) which is dark
    assert.equal(qr.getModule(3, 3), true);
    // Out of bounds returns false
    assert.equal(qr.getModule(-1, -1), false);
    assert.equal(qr.getModule(999, 999), false);
  });

  it('throws when payload exceeds maximum capacity', () => {
    const massivePayload = 'A'.repeat(3500);
    assert.throws(() => {
      QrCodeEncoder.encodeText(massivePayload, QrEcc.HIGH);
    }, /Data too long/);
  });
});
