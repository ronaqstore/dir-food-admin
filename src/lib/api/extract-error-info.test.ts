import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractErrorInfo } from './types.ts';

describe('extractErrorInfo', () => {
  it('extracts nested error object message and code from backend response', () => {
    const backendError = {
      error: {
        code: 'CONFLICT',
        message: 'A user with this phone number already exists'
      }
    };

    const res = extractErrorInfo(backendError, 'Request failed');
    assert.equal(res.code, 'CONFLICT');
    assert.equal(res.message, 'A user with this phone number already exists');
  });

  it('joins details when baseMessage is Validation failed', () => {
    const backendError = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Validation failed',
        details: ['phone must be valid', 'name should not be empty']
      }
    };

    const res = extractErrorInfo(backendError, 'Request failed');
    assert.equal(res.code, 'BAD_REQUEST');
    assert.equal(res.message, 'phone must be valid, name should not be empty');
  });

  it('handles top-level string message', () => {
    const error = {
      message: 'Invalid credentials'
    };

    const res = extractErrorInfo(error, 'Request failed');
    assert.equal(res.code, 'API_ERROR');
    assert.equal(res.message, 'Invalid credentials');
  });

  it('handles top-level string error', () => {
    const error = {
      error: 'Not found'
    };

    const res = extractErrorInfo(error, 'Request failed');
    assert.equal(res.code, 'API_ERROR');
    assert.equal(res.message, 'Not found');
  });

  it('never returns [object Object] and falls back to fallback status text', () => {
    const error = {
      error: {} as unknown as { message: string }
    };

    const res = extractErrorInfo(error, 'Something went wrong');
    assert.equal(res.message, 'Something went wrong');
  });
});
