(() => {
  const encoder = new TextEncoder();
  const bytes = text => encoder.encode(text);

  function concat(parts) {
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }

  async function canvasToJpeg(canvas, quality = 0.94) {
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create card image.')), 'image/jpeg', quality);
    });
    return new Uint8Array(await blob.arrayBuffer());
  }

  function createPdf(pages) {
    const objectCount = 2 + pages.length * 3;
    const objects = new Array(objectCount + 1);
    const pageRefs = [];

    objects[1] = bytes('<< /Type /Catalog /Pages 2 0 R >>');

    pages.forEach((page, index) => {
      const pageId = 3 + index * 3;
      const imageId = pageId + 1;
      const contentId = pageId + 2;
      pageRefs.push(`${pageId} 0 R`);

      const draw = `q\n${page.widthPt} 0 0 ${page.heightPt} 0 0 cm\n/Im${index + 1} Do\nQ\n`;
      const drawBytes = bytes(draw);
      objects[pageId] = bytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.widthPt} ${page.heightPt}] /Resources << /XObject << /Im${index + 1} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      objects[imageId] = concat([
        bytes(`<< /Type /XObject /Subtype /Image /Width ${page.pixelWidth} /Height ${page.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`),
        page.jpeg,
        bytes('\nendstream')
      ]);
      objects[contentId] = concat([
        bytes(`<< /Length ${drawBytes.length} >>\nstream\n`),
        drawBytes,
        bytes('endstream')
      ]);
    });

    objects[2] = bytes(`<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pages.length} >>`);

    const chunks = [bytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')];
    const offsets = new Array(objectCount + 1).fill(0);
    let cursor = chunks[0].length;

    for (let id = 1; id <= objectCount; id += 1) {
      offsets[id] = cursor;
      const start = bytes(`${id} 0 obj\n`);
      const end = bytes('\nendobj\n');
      chunks.push(start, objects[id], end);
      cursor += start.length + objects[id].length + end.length;
    }

    const xrefOffset = cursor;
    const xref = [`xref\n0 ${objectCount + 1}\n`, '0000000000 65535 f \n'];
    for (let id = 1; id <= objectCount; id += 1) {
      xref.push(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    }
    xref.push(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    chunks.push(bytes(xref.join('')));
    return new Blob([concat(chunks)], { type: 'application/pdf' });
  }

  async function canvasesToPdf(canvases, pageSize = 'A4') {
    const sizes = {
      A4: { widthPt: 841.89, heightPt: 595.28 },
      A5L: { widthPt: 595.28, heightPt: 419.53 },
      LETTER: { widthPt: 792, heightPt: 612 },
      A4P: { widthPt: 595.28, heightPt: 841.89 },
      A5P: { widthPt: 419.53, heightPt: 595.28 },
      A6P: { widthPt: 297.64, heightPt: 419.53 },
      '5X7': { widthPt: 360, heightPt: 504 },
      '4X6': { widthPt: 288, heightPt: 432 },
      SQUARE: { widthPt: 432, heightPt: 432 },
      LETTERP: { widthPt: 612, heightPt: 792 }
    };
    const key = String(pageSize || 'A4').toUpperCase();
    const selected = sizes[key] || sizes.A4;
    const pages = [];
    for (const canvas of canvases) {
      pages.push({
        ...selected,
        pixelWidth: canvas.width,
        pixelHeight: canvas.height,
        jpeg: await canvasToJpeg(canvas)
      });
    }
    return createPdf(pages);
  }

  function openBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 120000);
  }

  window.CardPDF = { canvasesToPdf, openBlob };
})();
