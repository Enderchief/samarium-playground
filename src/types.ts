export interface Run {
  stdout: string;
  stderr: string;
  code: number;
  signal: string | null;
  output: string;
}

export interface Output {
  run: Run;
  language: string;
  version: string;
}

export const versions = ["0.3.1", "0.4.0", "0.5.0", "0.5.1"] as const;
export type Version = (typeof versions)[number];
