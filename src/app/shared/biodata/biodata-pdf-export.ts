const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const SHEET_WIDTH_PX = 794;

let pdfLibsPreload: Promise<void> | null = null;

/** Warm up html2canvas + jsPDF so the first download starts faster after click. */
export function preloadBiodataPdfLibs(): Promise<void> {
  if (!pdfLibsPreload) {
    pdfLibsPreload = Promise.all([import('html2canvas'), import('jspdf')]).then(() => undefined);
  }
  return pdfLibsPreload;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  if (!images.length) {
    return Promise.resolve();
  }
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  ).then(() => undefined);
}

function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applyExportCloneStyles(doc: Document): void {
  doc.querySelectorAll('.biodata-preview-chrome').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.display = 'none';
    }
  });

  const roots = doc.querySelectorAll('.biodata-default-print');
  roots.forEach((root) => {
    if (!(root instanceof HTMLElement)) {
      return;
    }
    root.style.width = `${SHEET_WIDTH_PX}px`;
    root.style.maxWidth = `${SHEET_WIDTH_PX}px`;
    root.style.boxShadow = 'none';
    root.style.overflow = 'visible';
  });

  doc.querySelectorAll('.biodata-default-print, .biodata-default-print *').forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    node.style.overflow = 'visible';
    node.style.setProperty('-webkit-print-color-adjust', 'exact');
    node.style.setProperty('print-color-adjust', 'exact');
  });

  doc.querySelectorAll('.biodata-default-print .flex-1').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.minWidth = '0';
      node.style.flex = '1 1 0%';
    }
  });

  doc.querySelectorAll('.biodata-default-print .flex').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.display = 'flex';
    }
  });

  doc.querySelectorAll('.biodata-default-print svg').forEach((node) => {
    if (node instanceof SVGElement) {
      node.style.overflow = 'visible';
    }
  });
}

type ExportCaptureState = {
  bodyClass: string;
  sheet: HTMLElement;
  overlay: HTMLElement | null;
  scrollParent: HTMLElement | null;
  savedScrollTop: number;
};

function beginExportCapture(sheet: HTMLElement): ExportCaptureState {
  const overlay = sheet.closest('.biodata-default-print-root');
  const scrollParent =
    (overlay instanceof HTMLElement ? overlay : null) ??
    (sheet.closest('.biodata-ai-chat__thread') instanceof HTMLElement
      ? (sheet.closest('.biodata-ai-chat__thread') as HTMLElement)
      : null);

  const savedScrollTop = scrollParent?.scrollTop ?? 0;
  const bodyClass = 'biodata-pdf-export-active';

  document.body.classList.add(bodyClass);
  sheet.classList.add('biodata-pdf-export-sheet');

  if (overlay instanceof HTMLElement) {
    overlay.classList.add('biodata-pdf-export-overlay');
    overlay.scrollTop = 0;
  }

  return {
    bodyClass,
    sheet,
    overlay: overlay instanceof HTMLElement ? overlay : null,
    scrollParent,
    savedScrollTop,
  };
}

function endExportCapture(state: ExportCaptureState): void {
  state.sheet.classList.remove('biodata-pdf-export-sheet');

  if (state.overlay) {
    state.overlay.classList.remove('biodata-pdf-export-overlay');
    state.overlay.scrollTop = state.savedScrollTop;
  } else if (state.scrollParent) {
    state.scrollParent.scrollTop = state.savedScrollTop;
  }

  document.body.classList.remove(state.bodyClass);
}

/** Saves a biodata sheet DOM node as PDF — matches on-screen design (html2canvas + jsPDF). */
export async function downloadBiodataSheetPdf(
  sheet: HTMLElement,
  fileName: string,
): Promise<void> {
  await preloadBiodataPdfLibs();
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const capture = beginExportCapture(sheet);

  try {
    await waitForImages(sheet);
    await nextFrame();
    await nextFrame();

    const width = Math.max(sheet.offsetWidth, sheet.scrollWidth, SHEET_WIDTH_PX);
    const height = Math.max(sheet.scrollHeight, sheet.offsetHeight, 1);

    const canvas = await html2canvas(sheet, {
      scale: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (element) => element.classList.contains('biodata-preview-chrome'),
      onclone: (doc) => {
        applyExportCloneStyles(doc);
      },
    });

    if (!canvas.width || !canvas.height) {
      throw new Error('Empty biodata capture');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgWidthMm = A4_WIDTH_MM;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
    const imgData = canvas.toDataURL('image/png', 1);

    if (imgHeightMm <= A4_HEIGHT_MM) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm, undefined, 'SLOW');
    } else {
      let heightLeft = imgHeightMm;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm, undefined, 'SLOW');
      heightLeft -= A4_HEIGHT_MM;
      while (heightLeft > 0) {
        position = heightLeft - imgHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm, undefined, 'SLOW');
        heightLeft -= A4_HEIGHT_MM;
      }
    }

    const safeName = fileName.replace(/[<>:"/\\|?*]+/g, '').trim() || 'biodata';
    triggerFileDownload(pdf.output('blob'), `${safeName}.pdf`);
  } finally {
    endExportCapture(capture);
  }
}
