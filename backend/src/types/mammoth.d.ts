declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ExtractOptions {
    buffer?: Buffer;
    path?: string;
  }

  export function extractRawText(options: ExtractOptions): Promise<MammothResult>;
  export function convertToHtml(options: ExtractOptions): Promise<MammothResult>;
}
