/**
 * PdfViewer - Visualizador de arquivos PDF
 *
 * Features:
 * - Navegação entre páginas
 * - Zoom in/out
 * - Fit to width/height
 * - Download
 * - Loading state
 * - Error handling
 */

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url?: string;
  file?: File;
  className?: string;
  defaultPage?: number;
  showDownload?: boolean;
}

export function PdfViewer({
  url,
  file,
  className,
  defaultPage = 1,
  showDownload = true,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(defaultPage);
  const [scale, setScale] = useState(1.0);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(defaultPage);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.25, 3));
    setPageWidth(undefined);
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
    setPageWidth(undefined);
  }

  function fitToWidth() {
    setPageWidth(undefined);
    setScale(1.0);
    // A biblioteca calcula automaticamente baseado no container
  }

  function handleDownload() {
    if (url) {
      window.open(url, '_blank');
    }
  }

  const source = url || file;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 border rounded-lg bg-card">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <Input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => setPageNumber(Number(e.target.value))}
              className="w-16 h-8 text-center"
            />
            <span className="text-muted-foreground">/ {numPages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={fitToWidth}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Download */}
        {showDownload && url && (
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>

      {/* PDF Document */}
      <div className="border rounded-lg bg-muted/30 overflow-auto">
        <Document
          file={source}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center p-8 text-destructive">
              <p className="text-sm font-medium">Erro ao carregar PDF</p>
              <p className="text-xs text-muted-foreground">
                Verifique se o arquivo é válido
              </p>
            </div>
          }
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={pageWidth}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
