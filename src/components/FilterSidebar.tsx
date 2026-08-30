import { Tag, Search, MapPin, RefreshCw, X, ShieldCheck, Heart } from "lucide-react";
import { ReferenceItem } from "../types";
import { POPULAR_TAGS } from "../data";

interface FilterSidebarProps {
  items: ReferenceItem[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLocation: string;
  onLocationSelect: (loc: string) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({
  items,
  selectedTags,
  onTagToggle,
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationSelect,
  onClearFilters,
}: FilterSidebarProps) {
  // 1. Calculate Tag frequencies dynamically from actual saved items
  const tagCounts: { [key: string]: number } = {};
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Supplement with popular tags so cloud looks good even with minimal items
  POPULAR_TAGS.forEach((tag) => {
    if (!(tag in tagCounts)) {
      tagCounts[tag] = 0;
    }
  });

  const tagsList = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  // Determine Tag cloud size factor - styling custom Twilight look
  const getTagStyle = (count: number, isSelected: boolean) => {
    if (isSelected) {
      return "text-xs font-semibold px-3.5 py-1 bg-gradient-to-r from-[#D4ADFC] to-[#FFB2DC] text-[#4A2084] border-transparent rounded-full shadow-[0_4px_12px_rgba(212,173,252,0.3)]";
    }
    if (count >= 4) {
      return "text-xs font-medium px-3.5 py-1 bg-white hover:bg-[#FCF7FF] text-stone-700 border-[#E9D5FF] hover:border-[#D4ADFC] rounded-full";
    }
    return "text-[11px] font-normal px-3.5 py-1 bg-[#FAF6FF]/80 text-[#8B5CF6] border-[#F1E4FF] hover:border-[#D4ADFC] rounded-full";
  };

  // 2. Identify locations from saved items
  const locationsMap: { [key: string]: number } = {};
  items.forEach((item) => {
    if (item.location) {
      locationsMap[item.location] = (locationsMap[item.location] || 0) + 1;
    }
  });
  const locationsList = Object.keys(locationsMap).sort((a, b) => locationsMap[b] - locationsMap[a]);

  return (
    <div id="muji-filter-sidebar" className="w-full flex flex-col gap-6 font-sans">
      
      {/* Dynamic Count Panel inside clean lavender glass card */}
      <div className="bg-[#FAF6FF]/40 backdrop-blur-md border border-[#E9D5FF] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4.5 h-4.5 text-[#D4ADFC]" />
          <span className="text-xs font-semibold text-stone-700">전체 저장된 영감 수</span>
        </div>
        <span className="text-sm font-bold text-[#8B5CF6] font-mono">{items.length}개</span>
      </div>

      {/* Twilight Style Keyword Search Box */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#B2A4FF]" />
          키워드로 영감 상기
        </h4>
        <div className="relative">
          <input
            id="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="메모 내용, 주소 검색..."
            className="w-full text-xs p-2.5 pl-9 bg-white border border-[#E9D5FF] focus:border-[#D4ADFC] focus:ring-1 focus:ring-[#D4ADFC]/30 rounded-full outline-hidden text-stone-800 placeholder-stone-400 transition-all font-sans"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-3 text-stone-300 hover:text-stone-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#B2A4FF]" />
            태그 클라우드 (Tag Cloud)
          </h4>
          <span className="text-[9px] text-[#A78BFA] font-medium">빈도필터링</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
          {tagsList.map((tag) => {
            const count = tagCounts[tag] || 0;
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`flex items-center gap-1 border cursor-pointer transition-all ${getTagStyle(
                  count,
                  isSelected
                )}`}
              >
                <span>#{tag}</span>
                {count > 0 && <span className="opacity-60 text-[9px] font-mono">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location hotspots based on Kakao GPS reverse searches */}
      {locationsList.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B2A4FF]" />
            수집된 장소별 필터
          </h4>
          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
            {locationsList.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  onClick={() => onLocationSelect(isSelected ? "" : loc)}
                  className={`text-[11px] py-2 px-3 text-left rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-gradient-to-r from-[#D4ADFC]/80 to-[#B2A4FF]/80 border-transparent text-[#2E1065] font-semibold shadow-xs"
                      : "bg-white border-[#E9D5FF] text-stone-600 hover:bg-[#FCF8FF] hover:border-[#D4ADFC]"
                  }`}
                >
                  <span className="truncate max-w-[190px] flex items-center gap-1">
                    <MapPin className={`w-3 h-3 ${isSelected ? "text-[#581C87]" : "text-[#B2A4FF]"}`} />
                    {loc}
                  </span>
                  <span className={`text-[9px] font-mono font-bold ${isSelected ? "text-[#581C87]/80" : "text-[#B2A4FF]"}`}>
                    {locationsMap[loc]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear triggers */}
      {(selectedTags.length > 0 || selectedLocation || searchQuery) && (
        <button
          onClick={onClearFilters}
          className="w-full py-2 bg-[#F5EEFF] hover:bg-[#EEDDFF] text-[#8B5CF6] text-[11px] font-bold border border-[#E9D5FF] rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3 h-3" />
          모든 필터 초기화
        </button>
      )}

      {/* 눈썰미 차곡차곡 philosopher assurance card */}
      <div className="p-4 bg-white/70 backdrop-blur-md border border-[#E9D5FF]/60 rounded-2xl flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6]">
          <ShieldCheck className="w-4 h-4 text-[#D4ADFC]" />
          <span>차곡차곡 보장 가이드</span>
        </div>
        <p className="text-[10px] text-stone-500 leading-relaxed">
          눈썰미 차곡차곡은 불필요한 과장을 빼고 담백한 기능성에 몰두합니다. Kakao Map 연동과 Geolocation 실시간 길찾기를 활용해, 당신이 서 있는 그 자리를 레퍼런스로 영구 축적합니다.
        </p>
      </div>
    </div>
  );
}
