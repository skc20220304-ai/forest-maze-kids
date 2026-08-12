export interface StickerDefinition {
  stageId: number;
  motif: string;
  name: string;
  page: number;
  pageName: string;
  accent: string;
}

const motifs = [
  ['🐰', 'うさぎ'], ['🌰', 'どんぐり'], ['🍄', 'きのこ'], ['🦋', 'ちょうちょ'], ['🐞', 'てんとうむし'],
  ['🐸', 'かえる'], ['🦉', 'ふくろう'], ['🌼', 'おはな'], ['🌈', 'にじ'], ['🎁', 'たからばこ'],
] as const;
const pages = [
  ['はじまりの森', '#b7e5a4'], ['きのこの森', '#e7b4c2'], ['どうぶつの森', '#f2d28b'],
  ['星あかりの森', '#aab9e8'], ['たからものの森', '#f1b56f'], ['せせらぎの森', '#9bd9e8'],
  ['お花畑の森', '#f0a8c9'], ['雲の森', '#c5d7ed'], ['月夜の森', '#aaa1d4'], ['にじの森', '#f2c68b'],
] as const;

export const stickers: readonly StickerDefinition[] = Array.from({ length: 100 }, (_, index) => {
  const page = Math.floor(index / 10);
  const [motif, name] = motifs[index % motifs.length];
  return { stageId: index + 1, motif, name, page, pageName: pages[page][0], accent: pages[page][1] };
});

export const stickerForStage = (stageId: number) => stickers.find((sticker) => sticker.stageId === stageId) ?? stickers[0];
