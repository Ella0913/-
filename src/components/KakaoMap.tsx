import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, AlertCircle, RefreshCw, HelpCircle, Info } from "lucide-react";

interface KakaoMapProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onPositionSelect?: (lat: number, lng: number, address: string) => void;
  readonly?: boolean;
}

// Preset popular landmarks for quick visual feedback
const PRESET_LANDMARKS = [
  { name: "서울 종로", lat: 37.5818, lng: 126.9815, address: "서울시 종로구 삼청동" },
  { name: "성수동 카페", lat: 37.5446, lng: 127.0559, address: "성수동 카페거리 피치" },
  { name: "한남동 스토어", lat: 37.5348, lng: 127.0022, address: "한남동 플래그십 스토어" },
  { name: "을지로 디앤디", lat: 37.5661, lng: 126.9945, address: "을지로 가구 편집숍 디앤디" },
  { name: "부산 영도", lat: 35.0912, lng: 129.0416, address: "부산 영도 피아크 문화 공간" },
  { name: "강릉 강문", lat: 37.7951, lng: 128.9181, address: "강릉 강문해변 에어비앤비" },
];

// Simple in-memory cache to prevent duplicate requests to OpenStreetMap Nominatim rate-limits
const addressCache: Record<string, string> = {};

export default function KakaoMap({
  initialLat,
  initialLng,
  initialAddress,
  onPositionSelect,
  readonly = false,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const isFirstRender = useRef(true);
  
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialAddress || "");
  
  // Coordinate states
  const defaultLat = 37.3166;
  const defaultLng = 126.8315;
  const [selectedLat, setSelectedLat] = useState(initialLat || defaultLat);
  const [selectedLng, setSelectedLng] = useState(initialLng || defaultLng);

  useEffect(() => {
    setSelectedLat(initialLat || defaultLat);
    setSelectedLng(initialLng || defaultLng);
    if (initialAddress) {
      setCurrentAddress(initialAddress);
    }
    
    // Only resolve address if we do not have an initialAddress
    // Crucial change: If initialAddress is already present, DO NOT trigger resolveAddress on mount
    // to prevent overwriting the saved location name with raw coordinate strings on load
    if (!initialAddress && !isFirstRender.current) {
      resolveAddress(initialLat || defaultLat, initialLng || defaultLng, false);
    }
    
    isFirstRender.current = false;
  }, [initialLat, initialLng, initialAddress]);

  // Try to automatically get current location on mount if registering a new item
  useEffect(() => {
    if (initialLat === undefined && initialLng === undefined && !readonly) {
      findMyLocation(false);
    }
  }, []);

  // Kakao Maps initialization effect with a 2-second timeout safeguard (optimized from 5.5s)
  useEffect(() => {
    let timer: any;
    let fallbackTimeout: any;

    const initMap = () => {
      const kakaoObj = (window as any).kakao;
      if (!kakaoObj || !kakaoObj.maps) {
        // Continue polling
        timer = setTimeout(initMap, 150);
        return;
      }

      try {
        kakaoObj.maps.load(() => {
          clearTimeout(fallbackTimeout);
          setLoading(false);
          setUseFallback(false);

          const container = containerRef.current;
          if (!container) return;

          const kakaoMaps = kakaoObj.maps;
          const options = {
            center: new kakaoMaps.LatLng(initialLat || defaultLat, initialLng || defaultLng),
            level: 4,
          };

          // Create Kakao Map
          const map = new kakaoMaps.Map(container, options);
          mapRef.current = map;

          // Add simple zoom controller
          const zoomControl = new kakaoMaps.ZoomControl();
          map.addControl(zoomControl, kakaoMaps.ControlPosition.RIGHT);

          // Create Marker
          const markerPosition = new kakaoMaps.LatLng(initialLat || defaultLat, initialLng || defaultLng);
          const marker = new kakaoMaps.Marker({
            position: markerPosition,
            clickable: !readonly,
          });

          marker.setMap(map);
          markerRef.current = marker;

          // Initialize address text only if we don't already have one loaded (avoids over-writing)
          if (!initialAddress) {
            resolveAddress(initialLat || defaultLat, initialLng || defaultLng, false);
          }

          // Map Click Handler for selection
          if (!readonly && onPositionSelect) {
            kakaoMaps.event.addListener(map, "click", (mouseEvent: any) => {
              const latlng = mouseEvent.getLatLng();
              const targetLat = latlng.getLat();
              const targetLng = latlng.getLng();

              setSelectedLat(targetLat);
              setSelectedLng(targetLng);

              // Move pin
              marker.setPosition(latlng);
              
              // Reverse-Geocode & dispatch callback (true for active user action)
              resolveAddress(targetLat, targetLng, true);
            });
          }
        });
      } catch (err) {
        console.warn("Kakao maps load exception; falling back", err);
        activateFallback();
      }
    };

    const activateFallback = () => {
      setUseFallback(true);
      setLoading(false);
      if (!initialAddress) {
        resolveAddress(initialLat || defaultLat, initialLng || defaultLng, false);
      }
    };

    // Fast 2-second timeout for fallback to avoid lagging on sandboxed preview domains
    fallbackTimeout = setTimeout(() => {
      console.warn("Kakao API loading took too long or is restricted. Triggering interactive location canvas.");
      activateFallback();
    }, 2000);

    initMap();

    return () => {
      if (timer) clearTimeout(timer);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [readonly]);

  // Dual geocode utility using Kakao Services and free reverse OpenStreetMap geocoder API
  const resolveAddress = async (lat: number, lng: number, triggerCallback: boolean = false) => {
    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (addressCache[cacheKey]) {
      const cached = addressCache[cacheKey];
      setCurrentAddress(cached);
      if (triggerCallback && onPositionSelect) {
        onPositionSelect(lat, lng, cached);
      }
      return;
    }

    const kakaoObj = (window as any).kakao;
    
    // Check if Kakao geocoder is available
    if (kakaoObj && kakaoObj.maps && kakaoObj.maps.services) {
      try {
        const geocoder = new kakaoObj.maps.services.Geocoder();
        const coord = new kakaoObj.maps.LatLng(lat, lng);
        
        geocoder.coord2Address(coord.getLng(), coord.getLat(), (result: any, status: any) => {
          if (status === kakaoObj.maps.services.Status.OK && result[0]) {
            const addressName = result[0].road_address
              ? result[0].road_address.address_name
              : result[0].address.address_name;
            
            addressCache[cacheKey] = addressName;
            setCurrentAddress(addressName);
            if (triggerCallback && onPositionSelect) {
              onPositionSelect(lat, lng, addressName);
            }
          } else {
            resolveFallbackAddress(lat, lng, triggerCallback);
          }
        });
        return;
      } catch {
        // Fallback to OSM
      }
    }

    resolveFallbackAddress(lat, lng, triggerCallback);
  };

  // Safe client-side reverse geocoding via OpenStreetMap Nominatim (Works in any sandbox!)
  const resolveFallbackAddress = async (lat: number, lng: number, triggerCallback: boolean = false) => {
    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    
    // Check closest preset landmark to avoid API spam
    let closestPreset = PRESET_LANDMARKS[0];
    let minDistance = Infinity;
    
    PRESET_LANDMARKS.forEach((preset) => {
      const dist = Math.pow(preset.lat - lat, 2) + Math.pow(preset.lng - lng, 2);
      if (dist < minDistance) {
        minDistance = dist;
        closestPreset = preset;
      }
    });

    // If extremely close to a preset, use that instantly
    if (minDistance < 0.001) {
      addressCache[cacheKey] = closestPreset.address;
      setCurrentAddress(closestPreset.address);
      if (triggerCallback && onPositionSelect) onPositionSelect(lat, lng, closestPreset.address);
      return;
    }

    // Attempt Nominatim fetch (non-blocking)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { "Accept-Language": "ko,en-US;q=0.9" } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Extract meaningful Korean address elements or return displayName
          const parts = data.address;
          let koAddress = "";
          if (parts.province || parts.city) {
            koAddress = `${parts.city || parts.province} ${parts.borough || parts.suburb || ""} ${parts.road || parts.neighbourhood || ""}`.trim();
          }
          const finalAddress = koAddress || data.display_name.split(",").reverse().join(" ").trim();
          
          addressCache[cacheKey] = finalAddress;
          setCurrentAddress(finalAddress);
          if (triggerCallback && onPositionSelect) onPositionSelect(lat, lng, finalAddress);
          return;
        }
      }
    } catch {
      // Ignored, fallback to local coords descriptor
    }

    // Default string fallback
    const fallbackStr = `기록된 핀 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    addressCache[cacheKey] = fallbackStr;
    setCurrentAddress(fallbackStr);
    if (triggerCallback && onPositionSelect) {
      onPositionSelect(lat, lng, fallbackStr);
    }
  };

  // Dual-purpose Geolocation function (supports silent fallback for auto-geolocation on mount)
  const findMyLocation = (showAlertOnError: boolean) => {
    if (!navigator.geolocation) {
      if (showAlertOnError) {
        alert("이 브라우저는 기기 위치 추적 기능을 지원하지 않습니다.");
      }
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedLat(lat);
        setSelectedLng(lng);

        const kakaoObj = (window as any).kakao;
        if (!useFallback && mapRef.current && markerRef.current && kakaoObj && kakaoObj.maps) {
          try {
            const moveLatLng = new kakaoObj.maps.LatLng(lat, lng);
            mapRef.current.panTo(moveLatLng);
            markerRef.current.setPosition(moveLatLng);
          } catch (e) {
            console.warn("Soft map move failed on mount:", e);
          }
        }
        
        resolveAddress(lat, lng, true);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        if (showAlertOnError) {
          let msg = "위치 정보를 가져올 수 없습니다.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "위치 획득 권한이 꺼져 있습니다. 브라우저 주소창 왼쪽에서 보관 승인을 허용해 주세요.";
          }
          alert(msg);
        } else {
          // Silent fallback to standard default values
          setSelectedLat(defaultLat);
          setSelectedLng(defaultLng);
          resolveAddress(defaultLat, defaultLng, true);
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleMyLocationClick = () => {
    findMyLocation(true);
  };

  // Web coordinate mapper for interactive mock canvas click
  const handleMockMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map bounding representing South Korea (Incheon, Seoul down to Busan/Jeju slightly)
    // lat bounds: 34.8 to 38.2
    // lng bounds: 126.2 to 129.4
    const clickYRatio = y / rect.height;
    const clickXRatio = x / rect.width;
    
    const clickLat = 38.2 - clickYRatio * (38.2 - 34.8);
    const clickLng = 126.2 + clickXRatio * (129.4 - 126.2);
    
    setSelectedLat(clickLat);
    setSelectedLng(clickLng);
    resolveAddress(clickLat, clickLng, true);
  };

  // Explicit preset Landmark applier
  const applyPresetLandmark = (preset: typeof PRESET_LANDMARKS[0]) => {
    setSelectedLat(preset.lat);
    setSelectedLng(preset.lng);
    setCurrentAddress(preset.address);
    if (onPositionSelect) {
      onPositionSelect(preset.lat, preset.lng, preset.address);
    }
  };

  return (
    <div className="relative w-full rounded-xl border border-stone-250 bg-[#FAF9F5] overflow-hidden flex flex-col font-sans">
      {/* Loading state indicator */}
      {loading && !useFallback && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-50/80 backdrop-blur-xs text-stone-600 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-stone-600" />
          <span className="text-xs font-medium tracking-tight">Kakao 지도를 파싱하는 중입니다...</span>
        </div>
      )}

      {/* Dual Engine Map Renderer Container */}
      {!useFallback ? (
        /* Kakao Active Div container */
        <div 
          ref={containerRef} 
          style={{ width: "100%", height: "220px" }}
          className="w-full h-[220px] bg-stone-100" 
        />
      ) : (
        /* Highly Interactive Minimalist Coordinates Grid Map (Fallback Mode matching Twilight theme) */
        <div className="relative w-full h-[220px] bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#EBE0FF] border-b border-[#F1E4FF] overflow-hidden select-none flex flex-col">
          {/* Subtle starfields/grid lines decoration in soft lavender */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#8B5CF6 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          
          {/* Elegant Diagnostic Overlay Warning Bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 bg-white/70 border border-[#E9D5FF] backdrop-blur-md text-[#6D28D9] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[10px] font-semibold z-10 shadow-[0_2px_10px_rgba(139,92,246,0.06)]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
              <span>샌드박스 환경으로 인해 스마트 로케이션 백업 지도가 준비되었습니다.</span>
            </span>
          </div>

          {/* Interactive Click Grid Canvas (Seoul/Korea scope) */}
          <div 
            className="relative w-full h-full cursor-crosshair z-0 flex items-center justify-center animate-fadeIn"
            onClick={handleMockMapClick}
          >
            {/* Minimal SVG contours representation of South Korea with nice lavender stroke */}
            <svg className="absolute inset-x-8 inset-y-4 w-5/6 h-5/6 opacity-45 pointer-events-none text-[#D4ADFC]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
              <path strokeWidth="1" strokeDasharray="4 4" d="M30 60 L170 60" />
              <path strokeWidth="1" strokeDasharray="4 4" d="M30 110 L170 110" />
              <path strokeWidth="1" strokeDasharray="4 4" d="M30 160 L170 160" />
              {/* Abstract land outlines */}
              <path strokeWidth="1.5" strokeLinecap="round" d="M70,30 Q90,35 110,35 Q130,40 120,60 Q110,80 130,110 T145,150 T130,180 Q105,170 95,185 Q70,175 60,150 Q45,120 55,90 Z" />
            </svg>

            {/* Simulated Coordinate Grid labels */}
            <div className="absolute bottom-1 right-2.5 text-[9px] font-mono text-[#8B5CF6]/60 pointer-events-none font-bold">
              GPS Lat: {selectedLat.toFixed(4)}, Lng: {selectedLng.toFixed(4)}
            </div>

            {/* Dynamic visual map marker pin based on coordinate percentage */}
            {(() => {
              // Inverse calculation
              const yRatio = Math.max(0, Math.min(1, (38.2 - selectedLat) / (38.2 - 34.8)));
              const xRatio = Math.max(0, Math.min(1, (selectedLng - 126.2) / (129.4 - 126.2)));
              
              return (
                <div 
                  className="absolute z-10 transition-all duration-300 pointer-events-none"
                  style={{ 
                    top: `${yRatio * 100}%`, 
                    left: `${xRatio * 100}%`,
                    transform: "translate(-50%, -100%)"
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Ring ping ripple in soft pink glow */}
                    <span className="absolute bottom-0 w-6 h-6 bg-[#FFB2DC]/60 rounded-full animate-ping" />
                    {/* Pin element */}
                    <div className="bg-gradient-to-tr from-[#8B5CF6] to-[#FFB2DC] text-white rounded-full p-2 shadow-lg flex items-center justify-center border border-white">
                      <MapPin className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Instruction tooltip over canvas to click map to move pointer */}
            {!readonly && (
              <div className="absolute bottom-2.5 left-2.5 bg-[#4A2084]/80 backdrop-blur-md px-2.5 py-1 rounded text-[9.5px] text-[#FCF7FF] font-semibold pointer-events-none shadow-xs border border-[#E9D5FF]/20">
                ※ 지도를 클릭하여 원하는 영감의 장소를 핀으로 지정
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Landmark selectors (Visible ONLY in Fallback engine to give user immediate awesome presets) */}
      {useFallback && !readonly && (
        <div className="p-2 border-b border-[#F1E4FF] bg-white/70 overflow-x-auto flex gap-1.5 no-scrollbar scale-95 origin-left">
          <span className="text-[10px] font-black text-[#8B5CF6]/70 shrink-0 self-center uppercase tracking-wider pl-1.5 mr-1">
            인기 보관지:
          </span>
          {PRESET_LANDMARKS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPresetLandmark(preset)}
              className="px-2.5 py-1 text-[10px] bg-white border border-[#E9D5FF] text-[#8B5CF6] hover:bg-[#FCF7FF] hover:border-[#D4ADFC] hover:text-[#4A2084] rounded-md shrink-0 transition-all cursor-pointer shadow-xs font-semibold"
            >
              📍 {preset.name}
            </button>
          ))}
        </div>
      )}

      {/* Location Panel with My Location Button */}
      <div className="bg-white border-t border-stone-150 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2 max-w-[70%]">
          <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider">
              선택한 아카이브 핀 위치
            </span>
            <span className="text-stone-700 font-medium truncate leading-normal">
              {currentAddress || "핀을 클릭하여 위치를 지정해주세요."}
            </span>
          </div>
        </div>

        {/* Location selector button */}
        {!readonly && (
          <button
            type="button"
            onClick={handleMyLocationClick}
            className="px-3.5 py-2 bg-stone-900 text-stone-100 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 transition-all text-[11px] font-medium tracking-tight shadow-xs active:scale-95 shrink-0 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 animate-pulse" />
            <span>현재 내 위치</span>
          </button>
        )}
      </div>
    </div>
  );
}

