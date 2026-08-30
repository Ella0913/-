import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  MapPin,
  Calendar,
  Tag,
  Upload,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  VideoOff,
  Image as ImageIcon
} from "lucide-react";
import { ReferenceItem } from "../types";
import { MOCK_CAMERA_OPTIONS } from "../data";
import { motion, AnimatePresence } from "motion/react";
import KakaoMap from "./KakaoMap";

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ReferenceItem) => void;
  editingItem: ReferenceItem | null;
  popularTags: string[];
}

export default function CaptureModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  popularTags,
}: CaptureModalProps) {
  // Main form states
  const [imageUrl, setImageUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState("안산시 단원구 고잔동");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());

  // Camera stream states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");

  // Populate data if editing
  useEffect(() => {
    if (editingItem) {
      setImageUrl(editingItem.imageUrl);
      setMemo(editingItem.memo);
      setTags(editingItem.tags);
      setLocation(editingItem.location);
      setLat(editingItem.lat);
      setLng(editingItem.lng);
      setCreatedAt(editingItem.createdAt);
      setShowLiveCamera(false);
    } else {
      setImageUrl("");
      setMemo("");
      setTags([]);
      const now = new Date();
      setCreatedAt(now.toISOString());
      setLocation("");
      setLat(undefined);
      setLng(undefined);
      setShowLiveCamera(false);
    }
  }, [editingItem, isOpen]);

  // Clean camera resource on close or toggle
  useEffect(() => {
    if (!showLiveCamera) {
      stopCamera();
    }
    return () => stopCamera();
  }, [showLiveCamera]);

  const startCamera = async () => {
    try {
      setCameraError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCameraPermission(true);
    } catch (err: any) {
      console.warn("Camera init error:", err);
      setHasCameraPermission(false);
      setCameraError("카메라 장치 접근 권한이 없거나 찾을 수 없습니다.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const triggerLiveCamera = () => {
    setShowLiveCamera(true);
    startCamera();
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImageUrl(dataUrl);
        setShowLiveCamera(false);
        stopCamera();
      }
    } catch (e) {
      setCameraError("사진 촬영 실패");
    }
  };

  const handleUploadedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Coordinates select from KakaoMap component
  const handlePositionSelect = (selectedLat: number, selectedLng: number, addressName: string) => {
    setLat(selectedLat);
    setLng(selectedLng);
    setLocation(addressName);
  };

  const addTag = (newTag: string) => {
    const cleaned = newTag.replace(/#/g, "").trim();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setCurrentTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      addTag(currentTagInput);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const formatKoreanDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    } catch {
      return isoStr;
    }
  };

  const handleFormSubmit = () => {
    if (!imageUrl) {
      alert("영감으로 보관할 이미지를 업로드하거나 촬영해 주세요.");
      return;
    }

    const itemPayload: ReferenceItem = {
      id: editingItem?.id || `ref-${Date.now()}`,
      imageUrl,
      memo: memo.trim(),
      tags,
      location: location.trim() || "위치 정보 없음",
      lat,
      lng,
      createdAt,
      checklist: editingItem?.checklist || [], // keep fallback empty checklist to avoid breaking models
    };

    onSave(itemPayload);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="muji-capture-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-xl bg-[#FAF9F5] border border-stone-300 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - MUJI aesthetics: Sand/warm title with thin lines */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3.5">
          <div>
            <h3 className="text-sm font-semibold text-stone-800 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-stone-600" />
              {editingItem ? "Reference Card Detail" : "New Reference Storage"}
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              {editingItem ? `ID: ${editingItem.id}` : "신규 영감 등록"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-5 space-y-5.5 scroll-smooth">
          
          {/* 1. MUJI simplified visual image source box */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Inspiration Image (영감 이미지)
            </span>

            {/* Main Stage rendering Upload, Live webcam or preview */}
            <div className="relative aspect-video rounded-lg border border-stone-250 bg-stone-100 flex items-center justify-center overflow-hidden">
              {showLiveCamera ? (
                /* Webcam Stream Panel */
                <div className="absolute inset-0 bg-stone-950 flex flex-col justify-between p-3">
                  {hasCameraPermission !== false ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 gap-2 p-4">
                      <VideoOff className="w-8 h-8 text-stone-500" />
                      <span className="text-xs">{cameraError || "허용 중..."}</span>
                    </div>
                  )}

                  {/* Capture Button */}
                  {hasCameraPermission && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center border-4 border-stone-700/60 active:scale-95 transition-all shadow-md"
                    >
                      <Camera className="w-5 h-5 text-stone-800" />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowLiveCamera(false)}
                    className="absolute top-3 right-3 text-stone-300 text-[10px] bg-black/60 px-2 py-1 rounded"
                  >
                    취소
                  </button>
                </div>
              ) : imageUrl ? (
                /* Visual Preview image with replace triggers */
                <div className="relative w-full h-full">
                  <img
                    src={imageUrl}
                    alt="Ref attachment"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {!editingItem && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="px-2.5 py-1.5 rounded bg-stone-900/90 hover:bg-stone-900 text-stone-100 text-[10.5px] font-medium transition-all"
                      >
                        이미지 삭제
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* MUJI Style Pristine Upload Dropzone */
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 text-center w-full h-full">
                  <label className="border-2 border-dashed border-stone-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50/60 transition-colors w-full h-full">
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-xs font-semibold text-stone-700">기기에서 이미지 업로드</span>
                    <span className="text-[10px] text-stone-400 mt-1">파일 선택 또는 끌어다 놓기</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadedFile}
                    />
                  </label>

                  <div className="text-stone-300 text-xs font-bold hidden sm:block">OR</div>

                  <button
                    type="button"
                    onClick={triggerLiveCamera}
                    className="w-full sm:w-auto h-full sm:h-auto py-5 px-6 border border-stone-250 bg-white hover:bg-stone-50 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-7 h-7 text-stone-500" />
                    <span className="text-xs font-semibold text-stone-700">카메라 즉석 촬영</span>
                    <span className="text-[10px] text-stone-400">웹캠 이용</span>
                  </button>
                </div>
              )}
            </div>

            {/* Small Quick Unsplash select presets for demo flexibility */}
            {!imageUrl && !editingItem && (
              <div className="text-left py-1">
                <span className="text-[10.5px] text-stone-400 block mb-1">💡 테스트용 샘플 이미지 주입:</span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {MOCK_CAMERA_OPTIONS.slice(0, 3).map((opt, id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setImageUrl(opt.imageUrl);
                        if (!memo) setMemo(opt.memo);
                        if (!tags.includes(opt.category)) setTags([...tags, opt.category]);
                      }}
                      className="text-[10px] px-2 py-1 bg-white border border-stone-200 text-stone-600 hover:border-stone-400 rounded shrink-0 transition-colors"
                    >
                      +{opt.name.substring(0, 8)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. MUJI Interactive Integrated Map with marker pin selection & reverse search */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Kakao Map Location (기억의 위치 및 맵 핀)
            </span>
            
            <KakaoMap
              initialLat={lat}
              initialLng={lng}
              initialAddress={location}
              onPositionSelect={handlePositionSelect}
              readonly={false} // Allow users to change coordinates pin actively
            />
          </div>

          {/* 3. Date automatic tracker */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">
              Archived Date
            </span>
            <div className="p-2.5 bg-white border border-stone-200 rounded text-stone-700 text-xs font-mono">
              {formatKoreanDate(createdAt)}
            </div>
          </div>

          {/* 4. One-line Inspiration Memo content */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Inspiration Memo (어떤 영감을 받았나요?)
            </span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="스쳐 지나갔던 인상적인 컬러 매칭, 여백의 미가 드러나는 가구 구상, 빛의 부드러움을 여기에 적어 소생시킵니다."
              className="w-full text-xs p-3.5 bg-white border border-stone-250 focus:border-stone-800 focus:ring-0 rounded-lg outline-hidden text-stone-800 placeholder-stone-400 resize-none transition-shadow font-sans"
            />
          </div>

          {/* 5. Clean Tag Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Tags (태그 지정)
              </span>
              <span className="text-[10px] text-stone-400">엔터 또는 스페이스로 구분 등록</span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border border-stone-250 rounded-lg">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-[10px] font-medium px-2 py-0.75 bg-stone-100 text-stone-700 border border-stone-200 rounded"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="ml-1 p-0.5 rounded text-stone-400 hover:bg-stone-200 hover:text-stone-800"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "인테리어, 타이포그래피..." : ""}
                  value={currentTagInput}
                  onChange={(e) => setCurrentTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-grow min-w-[100px] border-none outline-hidden py-0.5 text-xs text-stone-800 placeholder-stone-400 focus:font-medium"
                />
              </div>

              {/* Quick Popular Tags selection */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {popularTags.slice(0, 6).map((pt) => {
                  const active = tags.includes(pt);
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => addTag(pt)}
                      className={`text-[10px] px-2 py-0.5 border rounded transition-all ${
                        active
                          ? "bg-stone-900 border-stone-900 text-stone-100 font-medium"
                          : "bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700"
                      }`}
                    >
                      #{pt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Footer sticky bar */}
        <div className="border-t border-stone-200 p-4.5 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[10px] text-stone-400 leading-normal max-w-sm">
            ※ 이 데이터는 사용자 개인 브라우저의 로컬 저장소에 고유하고 안전하게 보관됩니다.
          </span>
          <div className="flex gap-2 shrink-0 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-md text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 active:scale-97 text-stone-100 rounded-md text-xs font-semibold transition-all shadow-xs"
            >
              {editingItem ? "레퍼런스 수정 완료" : "보관하기"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
