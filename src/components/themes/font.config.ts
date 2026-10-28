import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { cn } from '@/lib/utils';

// Self-hosted fonts (no fonts.gstatic.com fetch during next/font compile).
import '@fontsource-variable/inter';
import '@fontsource-variable/outfit';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/source-code-pro';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/fira-code';
import '@fontsource-variable/mulish';
import '@fontsource-variable/dm-sans';
import '@fontsource/playfair-display';
import '@fontsource/merriweather';
import '@fontsource/architects-daughter';
import '@fontsource/space-mono';
import '@fontsource/noto-sans-mono';

import './fonts-local.css';

export const fontVariables = cn(
  GeistSans.variable,
  GeistMono.variable,
  'font-theme-vars'
);
