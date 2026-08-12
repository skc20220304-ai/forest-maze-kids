export interface StickerDefinition {
  stageId: number;
  motif: string;
  name: string;
  page: number;
  pageName: string;
  accent: string;
  secondary: string;
}

const motifs = [
  ['🐰', 'うさぎ'], ['🐿️', 'りす'], ['🦊', 'きつね'], ['🦝', 'たぬき'], ['🦉', 'ふくろう'],
  ['🐸', 'かえる'], ['🦔', 'はりねずみ'], ['🐝', 'みつばち'], ['🦋', 'ちょうちょ'], ['🐞', 'てんとうむし'],
  ['🌻', 'ひまわり'], ['🍄', 'きのこ'], ['🌲', 'もりの木'], ['🌈', 'にじ'], ['🎁', 'たからばこ'],
] as const;
const decorations = [
  ['✨', 'きらり'], ['🌸', 'はなびら'], ['🍀', 'しあわせ'], ['💧', 'しずく'], ['☁️', 'ふわふわ'],
  ['🌙', 'おつきさま'], ['🔮', 'まほう'], ['🎀', 'リボン'], ['🎵', 'おんがく'], ['🎊', 'おいわい'],
] as const;
const pages = [
  ['はじまりの森', '#b7e5a4', '#e9f7bc'], ['きのこの森', '#e7b4c2', '#ffe1ee'], ['どうぶつの森', '#f2d28b', '#ffeec0'],
  ['星あかりの森', '#aab9e8', '#dfe8ff'], ['たからものの森', '#f1b56f', '#ffe0a6'], ['せせらぎの森', '#9bd9e8', '#d9f8ff'],
  ['お花畑の森', '#f0a8c9', '#ffe2f0'], ['雲の森', '#c5d7ed', '#edf5ff'], ['月夜の森', '#aaa1d4', '#e6e0ff'], ['にじの森', '#f2c68b', '#fff0c8'],
  ['水晶の森', '#9ed9d0', '#dffbf4'], ['風の森', '#b9d9a6', '#ecf9da'], ['おひさまの森', '#f3d77a', '#fff4c2'], ['雪の森', '#b9d9ee', '#eafaff'], ['おまつりの森', '#e7a4a4', '#ffe1df'],
] as const;

// 15 motifs × 10 decorations: each of the 150 cards has its own combination.
export const stickers: readonly StickerDefinition[] = Array.from({ length: 150 }, (_, index) => {
  const page = Math.floor(index / 10);
  const [motif, name] = motifs[index % motifs.length];
  const [decoration, decorationName] = decorations[Math.floor(index / motifs.length)];
  const [pageName, accent, secondary] = pages[page];
  return { stageId: index + 1, motif: `${motif}${decoration}`, name: `${decorationName} ${name}`, page, pageName, accent, secondary };
});

export const stickerForStage = (stageId: number) => stickers.find((sticker) => sticker.stageId === stageId) ?? stickers[0];
