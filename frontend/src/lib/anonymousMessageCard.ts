import { type AnonymousMode } from './anonymousFormats';

export function fitMessage(context: Pick<CanvasRenderingContext2D, 'font' | 'measureText'>, text: string, width: number, height: number) {
  // Wrap even unbroken URLs/words, preserving every character and explicit newline.
  for (let size = 64; size > 0; size -= 0.5) {
    context.font = `700 ${size}px Arial, sans-serif`;
    const lines: string[] = [];
    for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
      let line = '';
      for (const token of paragraph.match(/\s+|\S+/gu) ?? []) {
        if (context.measureText(line + token).width <= width) { line += token; continue; }
        if (line) { lines.push(line); line = ''; }
        for (const character of Array.from(token)) {
          if (line && context.measureText(line + character).width > width) {
            lines.push(line); line = '';
          }
          line += character;
        }
      }
      lines.push(line);
    }
    if (lines.length * size * 1.35 <= height && lines.every(line => context.measureText(line).width <= width)) {
      return { lines, size, lineHeight: size * 1.35 };
    }
  }
  throw new Error('Message cannot fit in the image.');
}

export async function createAnonymousMessageCard(message: string, mode: AnonymousMode, id: string, locale: string) {
  await document.fonts.ready;
  const logo = new Image();
  logo.src = '/aqryo-logo.png';
  await logo.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1920;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('PNG could not be created.');
  context.fillStyle = '#faf7ff'; context.fillRect(0, 0, 1080, 1920);
  const gradient = context.createLinearGradient(0, 0, 1080, 380);
  gradient.addColorStop(0, '#6d28d9'); gradient.addColorStop(1, mode === 'confession' ? '#ec4899' : '#36d7c4');
  context.fillStyle = gradient; context.fillRect(0, 0, 1080, 340);
  context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillStyle = '#fff'; context.font = '900 76px Arial, sans-serif';
  const headings: Record<string, [string, string]> = {
    tr: ['SORU', 'İTİRAF'], en: ['QUESTION', 'CONFESSION'], es: ['PREGUNTA', 'CONFESIÓN'],
    pt: ['PERGUNTA', 'CONFISSÃO'], fr: ['QUESTION', 'CONFESSION'], de: ['FRAGE', 'GESTÄNDNIS'],
    it: ['DOMANDA', 'CONFESSIONE'], ar: ['سؤال', 'اعتراف'], hi: ['सवाल', 'इकरार'],
    id: ['PERTANYAAN', 'PENGAKUAN'], ru: ['ВОПРОС', 'ПРИЗНАНИЕ'], bn: ['প্রশ্ন', 'স্বীকারোক্তি'],
    ur: ['سوال', 'اعتراف'], vi: ['CÂU HỎI', 'LỜI THÚ NHẬN'], fil: ['TANONG', 'PAG-AMIN'],
  };
  const title = (headings[locale] ?? headings.en)[mode === 'confession' ? 1 : 0];
  context.fillText(title, 540, 220, 900);
  const fitted = fitMessage(context, message, 872, 1230);
  context.font = `700 ${fitted.size}px Arial, sans-serif`;
  context.fillStyle = '#241633'; context.textBaseline = 'top';
  const rtl = /[\u0590-\u08ff]/.test(message);
  context.direction = rtl ? 'rtl' : 'ltr'; context.textAlign = rtl ? 'right' : 'left';
  fitted.lines.forEach((line, index) => context.fillText(line, rtl ? 976 : 104, 420 + index * fitted.lineHeight));
  context.direction = 'ltr';
  const logoWidth = 230, logoHeight = logoWidth * logo.naturalHeight / logo.naturalWidth;
  context.drawImage(logo, (1080 - logoWidth) / 2, 1720, logoWidth, logoHeight);
  context.textAlign = 'center'; context.font = '600 30px Arial, sans-serif'; context.fillStyle = '#6b547f';
  context.fillText('aqryo.com', 540, 1830);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG could not be created.')), 'image/png'));
  return new File([blob], `aqryo-${mode}-${id}.png`, { type: 'image/png' });
}
