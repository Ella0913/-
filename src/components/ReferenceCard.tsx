import { useState, useEffect } from "react";
import { MapPin, Calendar, Trash2, ExternalLink } from "lucide-react";
import { ReferenceItem } from "../types";
import { motion } from "motion/react";

interface ReferenceCardProps {
  key?: string;
  item: ReferenceItem;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export default function ReferenceCard({ item, onClick, onDelete }: ReferenceCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming) return;
    const timeout = setTimeout(() => {
      setIsConfirming(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isConfirming]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
        date.getDate()
      ).padStart(2, "0")}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      id={`ref-card-${item.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 hover:border-twilight-main shadow-sm hover:shadow-twilight-soft transition-all duration-500 cursor-pointer mb-4 break-inside-avoid"
      onClick={onClick}
    >
      {/* Target/Explore icon on hover */}
      <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 border border-twilight-main/30 text-[#8B5CF6] hover:bg-twilight-main hover:text-white transition-all shadow-xs">
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Image Preview Container */}
      <div className="relative overflow-hidden w-full bg-twilight-bg/40">
        <img
          src={item.imageUrl}
          alt={item.memo || "Reference Image"}
          className="w-full object-cover max-h-[380px] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Subtle coordinate label over image if present */}
        {item.lat && item.lng && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#1A1A2E]/80 backdrop-blur-md text-[9px] text-[#E9D5FF] font-mono tracking-tighter">
            {item.lat.toFixed(3)}, {item.lng.toFixed(3)}
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-stone-400 mb-2.5">
          <span className="flex items-center gap-1 shrink-0 text-[#B2A4FF] font-medium">
            <Calendar className="w-3 h-3 text-[#B2A4FF]/70" />
            {formatDate(item.createdAt)}
          </span>
          {item.location && (
            <span className="flex items-center gap-1 truncate max-w-[170px] text-stone-500" title={item.location}>
              <MapPin className="w-3 h-3 text-[#FFB2DC]" />
              {item.location}
            </span>
          )}
        </div>

        {/* Dynamic Memo text description */}
        <p className="text-[13px] text-stone-700 leading-relaxed font-normal mb-3.5 font-sans line-clamp-3 break-all">
          {item.memo || <span className="text-stone-300 italic">설명이나 메모가 기재되지 않았습니다.</span>}
        </p>

        {/* Minimal Tags line */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-[10.5px] font-medium px-2.5 py-0.5 bg-[#F3EBFF] text-[#8B5CF6] border border-[#E9D5FF] rounded-full hover:bg-twilight-main/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Delete trigger */}
      <div className="absolute bottom-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isConfirming) {
              onDelete(item.id);
            } else {
              setIsConfirming(true);
            }
          }}
          className={`p-1 px-2.5 rounded-full transition-all text-[10px] font-medium flex items-center gap-1 border ${
            isConfirming
              ? "bg-[#EF4444] text-white border-[#EF4444] hover:bg-[#DC2626] animate-pulse shadow-sm"
              : "bg-white hover:bg-rose-50 border-stone-200 text-stone-400 hover:text-rose-600 shadow-xs"
          }`}
          title={isConfirming ? "클릭하여 삭제 확정" : "삭제"}
        >
          <Trash2 className="w-3 h-3" />
          <span>{isConfirming ? "정말 삭제?" : "삭제"}</span>
        </button>
      </div>

    </motion.div>
  );
}
