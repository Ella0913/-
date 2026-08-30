import { useState, useEffect } from "react";
import {
  Camera,
  Search,
  Filter,
  X,
  PlusSquare,
  Sparkles,
  Info,
  Layers,
  CheckCircle,
  HelpCircle,
  BookmarkCheck
} from "lucide-react";
import { ReferenceItem } from "./types";
import { INITIAL_MOCK_DATA, POPULAR_TAGS } from "./data";
import ReferenceCard from "./components/ReferenceCard";
import CaptureModal from "./components/CaptureModal";
import FilterSidebar from "./components/FilterSidebar";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import appLogo from "./assets/images/app_logo_cutout_1781223297252.jpg";

export default function App() {
  // 1. Core Reference State loaded from LocalStorage or seeded with initial mock
  const [items, setItems] = useState<ReferenceItem[]>(() => {
    const saved = localStorage.getItem("snapref_archive");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MOCK_DATA;
      }
    }
    return INITIAL_MOCK_DATA;
  });

  // Sync state to local storage automatically
  useEffect(() => {
    localStorage.setItem("snapref_archive", JSON.stringify(items));
  }, [items]);

  // 2. Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  // UI state managers
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Informational banner feedback state
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 3500);
  };

  // 3. Filtering operations (supports cumulative tag intersection '교집합검색')
  const filteredItems = items.filter((item) => {
    // A. Keyword search: match memo, location, or tag text
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.memo.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query));

    // B. Multiple Tag Filter intersection (교집합 검색): checks if all selected tags are included
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((selTag) => item.tags.includes(selTag));

    // C. Location Filter matching
    const matchesLocation = !selectedLocation || item.location === selectedLocation;

    return matchesQuery && matchesTags && matchesLocation;
  });

  // Filter handlers
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearLocationFilter = () => setSelectedLocation("");

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedLocation("");
    triggerNotification("검색 필터가 초기화되었습니다.");
  };

  // 4. Save handler (Handles both creation AND edit updates)
  const handleSaveReference = (savedItem: ReferenceItem) => {
    const exists = items.some((item) => item.id === savedItem.id);
    if (exists) {
      // Modify
      setItems((prev) => prev.map((item) => (item.id === savedItem.id ? savedItem : item)));
      triggerNotification("레퍼런스가 안전하게 수정되었습니다.");
    } else {
      // Add reference
      setItems((prev) => [savedItem, ...prev]);
      triggerNotification("새로운 영감 스냅이 보관되었습니다.");
    }
  };

  // Delete handler
  const handleDeleteReference = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    triggerNotification("레퍼런스가 성공적으로 파기되었습니다.");
  };

  // Trigger Edit Detail/View Modal
  const handleCardClick = (item: ReferenceItem) => {
    setEditingItem(item);
    setIsCaptureOpen(true);
  };

  // Trigger New Capture
  const handleNewCaptureTrigger = () => {
    setEditingItem(null);
    setIsCaptureOpen(true);
  };

  return (
    <div id="snap-ref-app" className="min-h-screen bg-[#FFFDF9] text-[#3B0764] font-sans antialiased selection:bg-[#FFD3EC] selection:text-[#5B21B6] relative overflow-x-hidden">
      
      {/* Ambient soft background mesh lights (Twilight Dream) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="twilight-mesh-blur-1" />
        <div className="twilight-mesh-blur-2" />
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Dynamic Toast Feedback Notification Panel */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              id="app-alert-notification"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 border border-[#FFD3EC] text-[#9D4EDD] text-xs font-semibold shadow-[0_10px_25px_-5px_rgba(255,156,203,0.3)] backdrop-blur-md"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#FF9CCB] shrink-0" />
              <span>{showNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* glassmorphic Header Bar with twilight dream gradients */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9]/65 backdrop-blur-md border-b border-[#F1E4FF] px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Highly prominent custom cutout logo design */}
            <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-[#FFD3EC] shadow-[0_6px_20px_rgba(255,156,203,0.25)] bg-white shrink-0 p-1 flex items-center justify-center hover:scale-105 hover:rotate-2 transition-all duration-300">
              <img
                src={appLogo}
                alt="눈썰미 차곡차곡 로고"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-neutral-800 font-sans">
                  눈썰미 차곡차곡
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FCF4FA] border border-[#FFD3EC] text-[9.5px] font-bold text-[#FF9CCB] tracking-wider uppercase">
                  아카이브
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium font-sans">
                여러 관점의 레퍼런스에 관하여
              </p>
            </div>
          </div>

          {/* Header interactive controls */}
          <div className="flex items-center gap-2.5">
            {/* Header search bar */}
            <div className="relative hidden md:block w-72">
              <input
                id="header-search-bar"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메모, 태그, 좌표지 주소 실시간 탐색..."
                className="w-full text-xs py-1.5 pl-9 pr-8 bg-white/80 hover:bg-white focus:bg-white border border-[#E9D5FF] focus:border-[#D4ADFC] focus:ring-1 focus:ring-[#D4ADFC]/30 rounded-full outline-hidden transition-all placeholder-stone-400 font-sans text-stone-800"
              />
              <Search className="w-3.5 h-3.5 text-[#B2A4FF] absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-stone-300 hover:text-stone-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle for mobile design filters drawer */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden py-1.5 px-3.5 rounded-full border border-[#E9D5FF] bg-white hover:bg-[#FCF7FF] text-[#8B5CF6] active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5 text-[#B2A4FF]" />
              <span>필터 ({selectedTags.length + (selectedLocation ? 1 : 0)})</span>
            </button>

            {/* Humble designer space identity */}
            <div className="hidden sm:flex items-center gap-2 border-l border-[#F1E4FF] pl-3">
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D4ADFC] to-[#FFB2DC] text-[9px] font-bold text-white flex items-center justify-center font-mono shadow-xs">
                SR
              </span>
              <span className="text-[11px] font-semibold text-[#8B5CF6]">
                Dream Space
              </span>
            </div>
          </div>
        </header>

        {/* Main Structural Space container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar panels (Desktop only) */}
          <aside className="hidden md:block w-64 shrink-0 pr-2">
            <div className="sticky top-20">
              <FilterSidebar
                items={items}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                onClearFilters={clearAllFilters}
              />
            </div>
          </aside>

          {/* Primary Masonry stream view */}
          <div className="flex-grow space-y-4.5">
            
            {/* Multi-Active Filter chips list */}
            {(selectedTags.length > 0 || selectedLocation || searchQuery) && (
              <div id="active-filter-chips" className="flex flex-wrap items-center gap-2 p-3 bg-white/60 backdrop-blur-md border border-[#E9D5FF] rounded-2xl shadow-xs">
                <span className="text-[10.5px] font-bold text-[#8B5CF6] uppercase tracking-wider mr-1.5 pl-1">
                  활성 필터:
                </span>
                
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-3 py-1 bg-[#FAF6FF] text-[#8B5CF6] border border-[#E9D5FF] rounded-full shadow-xs">
                    단어: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="text-[#B2A4FF] hover:text-[#8B5CF6] transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-3 py-1 bg-gradient-to-r from-[#D4ADFC] to-[#FFB2DC] text-[#4A2084] rounded-full shadow-xs"
                  >
                    #{tag}
                    <button onClick={() => handleTagToggle(tag)} className="text-[#8B5CF6] hover:text-[#4A2084] transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedLocation && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-3 py-1 bg-[#FAF6FF] text-[#8B5CF6] border border-[#E9D5FF] rounded-full shadow-xs">
                    📍 {selectedLocation}
                    <button onClick={clearLocationFilter} className="text-[#B2A4FF] hover:text-[#8B5CF6] transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-[10.5px] text-[#8B5CF6] hover:text-[#4A2084] hover:underline font-bold ml-auto pr-1"
                >
                  모두 초기화
                </button>
              </div>
            )}

            {/* Galleries Section and status summaries */}
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#B2A4FF]" />
                  Inspiration Gallery Room
                </h2>
                <span className="text-[11px] text-stone-500">
                  {filteredItems.length === items.length
                    ? `총 ${items.length}개의 정갈한 시각 자가보관소`
                    : `검색 조건 충족 레퍼런스 ${filteredItems.length}개`}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#8B5CF6]/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB2DC] animate-pulse" />
                <span>Offline Ready</span>
              </div>
            </div>

            {/* Pinterest-like Masonry Grid feed container */}
            {filteredItems.length > 0 ? (
              <div
                id="masonry-feed-container"
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 w-full"
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <ReferenceCard
                      key={item.id}
                      item={item}
                      onClick={() => handleCardClick(item)}
                      onDelete={handleDeleteReference}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Pristine empty fallback states description */
              <div className="p-12 text-center bg-white/50 backdrop-blur-md border border-[#E9D5FF] rounded-3xl flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FAF6FF] border border-[#E9D5FF] flex items-center justify-center text-[#8B5CF6]">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-800">아직 아무것도 매칭되지 않았습니다</h3>
                  <p className="text-[11px] text-stone-500 max-w-sm mt-1 leading-relaxed">
                    검색 키워드를 축약해 주시거나, 하단의 원형 카메라 셔터를 눌러 길에서 만났던 간판이나 조영을 즉석 사진 아카이브로 추가해 보십시오.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D4ADFC] to-[#FFB2DC] text-[#4A2084] hover:opacity-90 rounded-full text-xs font-bold transition-all shadow-[0_4px_12px_rgba(212,173,252,0.3)] active:scale-95 cursor-pointer"
                >
                  전체보기로 되돌리기
                </button>
              </div>
            )}

          </div>
        </main>

        {/* Mobile Drawer Filter Slide-out Overlay drawer */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-45 md:hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFilterOpen(false)}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
              />
              {/* Drawer container */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                className="absolute left-0 top-0 bottom-0 w-[80vw] max-w-sm bg-white p-5 shadow-2xl overflow-y-auto flex flex-col gap-5 border-r border-stone-200"
              >
                <div className="flex items-center justify-between border-b border-stone-150 pb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-700" />
                    <span className="font-bold text-xs text-stone-800">필터 검색 창</span>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded text-stone-400 hover:bg-stone-50 hover:text-stone-700"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
                
                <FilterSidebar
                  items={items}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                  onClearFilters={clearAllFilters}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Action Button shutter (FAB) styled in Twilight Dream Lavender/Pink Gradient */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <motion.button
            id="camera-fab-button"
            onClick={handleNewCaptureTrigger}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative group bg-gradient-to-r from-[#9D4EDD] via-[#7BB0FF] to-[#FF9CCB] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(255,156,203,0.6)] cursor-pointer transition-all font-semibold outline-hidden border border-white/20"
            title="새 영감 기록하기"
          >
            <span className="absolute inset-0 rounded-full bg-[#FF9CCB]/30 animate-ping group-hover:animate-none opacity-60" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Camera className="w-5.5 h-5.5 stroke-[2] drop-shadow-sm" />
              <span className="text-[9px] font-black mt-0.5 tracking-tighter uppercase text-[#3B0764] drop-shadow-xs">SNAP</span>
            </div>
          </motion.button>
        </div>

        {/* Capture Dialog with KakaoMap position selector inside */}
        <AnimatePresence>
          {isCaptureOpen && (
            <CaptureModal
              isOpen={isCaptureOpen}
              onClose={() => {
                setIsCaptureOpen(false);
                setEditingItem(null);
              }}
              onSave={handleSaveReference}
              editingItem={editingItem}
              popularTags={POPULAR_TAGS}
            />
          )}
        </AnimatePresence>

        {/* Elegant glassmorphic Footnotes */}
        <footer className="border-t border-[#F1E4FF] bg-white/40 backdrop-blur-md mt-20 py-12 px-4 text-center text-xs text-stone-500 font-sans">
          <div className="max-w-md mx-auto space-y-2.5 flex flex-col items-center">
            {/* Highly expanded footer logo branding */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#FFD3EC] shadow-[0_6px_20px_rgba(255,156,203,0.2)] bg-white mb-2 flex items-center justify-center hover:scale-105 hover:-rotate-2 transition-all duration-300">
              <img
                src={appLogo}
                alt="눈썰미 차곡차곡 심볼"
                className="w-full h-full object-contain p-2"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="font-extrabold text-[#9D4EDD]">눈썰미 차곡차곡 © 2026</p>
            <p className="leading-relaxed text-stone-500 text-[11px]">
              여러 관점의 레퍼런스에 관하여
            </p>
            <div className="flex justify-center items-center gap-1.5 pt-1 text-[10px] text-[#7BB0FF] font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF9CCB] animate-pulse" />
              <span> 나만의 아카이브 스튜디오</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
