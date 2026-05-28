import React, { useState, useEffect } from 'react';
import { TOTAL_PAGES, chapters, quickLinks } from '../data';
import { Menu, LogOut } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface MainAppProps {
  onLogout: () => void;
}

export default function MainApp({ onLogout }: MainAppProps) {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'home' | 'reader'>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfError, setPdfError] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  // Re-run error reset on page change
  useEffect(() => {
    setPdfError(false);
  }, [page]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfError(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    setPdfError(true);
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  const showPage = (p: number) => {
    const maxPage = numPages || TOTAL_PAGES;
    const target = Math.max(1, Math.min(maxPage, p));
    setPage(target);
    setView('reader');
    setDrawerOpen(false);
    setPdfError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (view !== 'reader') return;
      if (e.key === 'ArrowLeft') showPage(page - 1);
      if (e.key === 'ArrowRight') showPage(page + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [page, view]);

  // Handle search filtering
  const q = searchQuery.trim().toLowerCase();
  const filteredChapters = chapters
    .map((ch) => ({
      ...ch,
      items: ch.items.filter(([t]) => !q || (t as string).toLowerCase().includes(q)),
    }))
    .filter((ch) => ch.items.length > 0);

  return (
    <div id="appShell" className={drawerOpen ? 'drawerOpen' : ''}>
      <aside id="drawer" aria-label="목차">
        <div className="brandBlock">
          <div className="brandMark">B</div>
          <div>
            <strong>B·S·S E-Book 교안</strong>
            <span>안전보건 매뉴얼</span>
          </div>
        </div>
        <div className="searchBox">
          <input
            type="search"
            placeholder="검색: LOTO, 지게차, TBM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <nav id="toc">
          {filteredChapters.map((ch, idx) => (
            <div key={idx} className="tocGroup">
              <h3>{ch.group}</h3>
              {ch.items.map(([title, p]) => (
                <button
                  key={title as string}
                  className="tocItem"
                  onClick={() => showPage(p as number)}
                >
                  <span>{title}</span>
                  <small>p.{p}</small>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main>
        <header className="topBar justify-between flex w-full">
          <div className="flex items-center gap-3">
            <button id="menuBtn" aria-label="목차 열기" onClick={() => setDrawerOpen(true)}>
              <Menu size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 id="screenTitle" className="text-lg font-bold">{view === 'home' ? 'B·S·S E-Book 교안' : '자료 보기'}</h1>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-none border-none">
            <LogOut size={16} />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </header>

        {view === 'home' && (
          <section className="hero" id="homeView">
            <div className="heroCard">
              <div className="eyebrow">B·S·S 학습자료</div>
              <h2>사전 안전 학습</h2>
              <button onClick={() => showPage(1)}>시작하기</button>
            </div>
            <div className="quickGrid" id="quickGrid">
              {quickLinks.map(([icon, subtitle, p], i) => (
                <div key={i} className="quickCard" onClick={() => showPage(p as number)}>
                  <b>{icon}</b>
                  <span>{subtitle}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'reader' && (
          <section className="reader" id="readerView">
            <div className="flex flex-col gap-3 mb-4">
              <div className="readerToolbar !mb-0" style={{ marginBottom: 0 }}>
                <button onClick={() => showPage(page - 1)}>‹ 이전</button>
                <span id="pageLabel">
                  {page} / {numPages || TOTAL_PAGES}
                </span>
                <button onClick={() => showPage(page + 1)}>다음 ›</button>
              </div>
            </div>
            <div className="pageFrame overflow-hidden bg-gray-100 flex items-center justify-center rounded-xl relative" style={{ minHeight: '600px' }}>
              <TransformWrapper
                key={page}
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit={true}
                centerZoomedOut={true}
                limitToBounds={true}
                wheel={{ step: 0.002 }}
                pinch={{ step: 5 }}
              >
                <TransformComponent wrapperClass="w-full h-full flex items-center justify-center">
                  {pdfError ? (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white">
                        <img 
                          src={`https://placehold.co/800x1131/fffaf0/f6a531?text=PDF+Page+${page}`} 
                          alt={`Placeholder for page ${page}`}
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity p-8 text-center">
                          <div className="w-12 h-12 mb-3 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3.L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h3 className="text-white font-bold mb-2">PDF 파일을 찾을 수 없습니다.</h3>
                          <p className="text-gray-300 text-sm max-w-sm mb-4">
                            파일 탐색기를 통해 public/guidebook.pdf 파일을 업로드해 주세요.
                          </p>
                          <code className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs rounded-md font-mono">
                            /public/guidebook.pdf
                          </code>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Document
                      file="/guidebook.pdf"
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-3">
                          <div className="w-8 h-8 border-4 border-gray-300 border-t-yellow-500 rounded-full animate-spin"></div>
                          <span>PDF 로딩중...</span>
                        </div>
                      }
                      className="flex justify-center"
                    >
                      <Page
                        pageNumber={page}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                        loading={
                          <div className="w-[600px] h-[800px] bg-white flex items-center justify-center text-gray-400">
                            페이지 로딩중...
                          </div>
                        }
                      />
                    </Document>
                  )}
                </TransformComponent>
              </TransformWrapper>
            </div>
          </section>
        )}
      </main>

      {/* Mobile Back-drop */}
      {drawerOpen && (
        <div id="drawerBackdrop" onClick={() => setDrawerOpen(false)}></div>
      )}
    </div>
  );
}
