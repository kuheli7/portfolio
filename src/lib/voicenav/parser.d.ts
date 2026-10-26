// Types for the copied VoiceNav parser. Commands carry more fields than these; the demo only reads the ones below.
export type Command = {
  type: string;
  dir?: string;
  amount?: number;
  to?: string;
  speed?: string;
  faster?: boolean;
  text?: string;
  navigate?: boolean;
  kind?: string;
  [key: string]: unknown;
};

export function parse(raw: string): Command | null;
export function normalize(raw: string): string;
export function stripWake(raw: string): string | null;
export function toEnglish(raw: string): string;
export function splitChain(raw: string): string[] | null;
export function bestAlternative(alts: string[]): string;
