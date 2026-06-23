// ProfessionPickerModal.jsx — Card-based profession picker (not bubbles)
import React, {
  useState, useRef, useEffect, useMemo, useCallback,
} from "react";
import {
  HiSearch, HiX, HiCheck, HiPencil,
  HiGlobe, HiCamera, HiHeart, HiBeaker,
  HiDesktopComputer, HiAcademicCap, HiBriefcase,
  HiColorSwatch, HiLightningBolt, HiOfficeBuilding,
  HiFire, HiUserGroup, HiCog, HiScale, HiTruck,
} from "react-icons/hi";

/* ═══════════════════════════════════════════════════════════════
   CATEGORY ICONS — mapped to hero icons
═══════════════════════════════════════════════════════════════ */
const CAT_ICONS = {
  "Travel & Tourism":          HiGlobe,
  "Photography & Media":       HiCamera,
  "Conservation & Environment":HiHeart,
  "Healthcare":                HiBeaker,
  "Technology":                HiDesktopComputer,
  "Education & Research":      HiAcademicCap,
  "Business & Finance":        HiBriefcase,
  "Arts & Culture":            HiColorSwatch,
  "Sports & Fitness":          HiLightningBolt,
  "Government & NGO":          HiOfficeBuilding,
  "Food & Hospitality":        HiFire,
  "Volunteering & Lifestyle":  HiUserGroup,
  "Engineering & Construction": HiCog,
  "Legal & Compliance":        HiScale,
  "Logistics & Transport":     HiTruck,
};

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const PROFESSION_CATEGORIES = [
  {
    category: "Travel & Tourism", color: "#0ea5e9",
    items: [
      "Tour Operator","Travel Agent","Safari Guide","Wildlife Guide",
      "Mountain Guide","Trekking Guide","River Guide","Dive Instructor",
      "Travel Blogger","Travel Vlogger","Destination Photographer",
      "Travel Writer","Expedition Leader","Adventure Tour Guide",
      "Cultural Tour Guide","Eco-Tourism Specialist","Cruise Director",
      "Resort Manager","Hotel Manager","Hostel Owner","Camp Manager",
      "Luxury Travel Consultant","Adventure Travel Planner",
    ],
  },
  {
    category: "Photography & Media", color: "#8b5cf6",
    items: [
      "Wildlife Photographer","Landscape Photographer","Travel Photographer",
      "Documentary Filmmaker","Videographer","Drone Pilot","Photo Editor",
      "Content Creator","Social Media Influencer","YouTuber","Podcaster",
      "Journalist","Photojournalist","Magazine Editor","Film Director",
      "Cinematographer","Nature Videographer","Live Streamer",
    ],
  },
  {
    category: "Conservation & Environment", color: "#059669",
    items: [
      "Wildlife Conservationist","Park Ranger","Environmental Scientist",
      "Marine Biologist","Zoologist","Ornithologist","Ecologist",
      "Conservation Biologist","Forest Ranger","Anti-Poaching Officer",
      "Sustainability Consultant","Climate Researcher","Wildlife Veterinarian",
      "Herpetologist","Primatologist","Botanist","Oceanographer",
      "Coral Reef Researcher","Wetland Ecologist",
    ],
  },
  {
    category: "Healthcare", color: "#ef4444",
    items: [
      "Physician","Surgeon","Nurse","Dentist","Pharmacist",
      "Physiotherapist","Psychologist","Psychiatrist","Pediatrician",
      "Cardiologist","Dermatologist","Emergency Doctor","Paramedic",
      "Travel Medicine Specialist","Wilderness First Responder",
      "Public Health Officer","Epidemiologist","Radiologist",
    ],
  },
  {
    category: "Technology", color: "#3b82f6",
    items: [
      "Software Engineer","Web Developer","Mobile Developer","Data Scientist",
      "AI/ML Engineer","DevOps Engineer","Cybersecurity Analyst",
      "Product Manager","UX Designer","UI Designer","System Administrator",
      "Cloud Architect","Blockchain Developer","Game Developer",
      "Digital Nomad","Remote Worker","Tech Entrepreneur","CTO",
    ],
  },
  {
    category: "Education & Research", color: "#f59e0b",
    items: [
      "Professor","Researcher","Teacher","Lecturer","Academic",
      "Anthropologist","Archaeologist","Historian","Geographer",
      "Linguist","Sociologist","Ethnographer","Cultural Researcher",
      "Field Researcher","PhD Student","Postdoctoral Researcher",
      "Science Communicator","Museum Curator",
    ],
  },
  {
    category: "Business & Finance", color: "#6366f1",
    items: [
      "Entrepreneur","CEO","Business Analyst","Financial Advisor",
      "Investment Banker","Accountant","Marketing Manager",
      "Sales Manager","HR Manager","Operations Manager",
      "Supply Chain Manager","Import/Export Manager","Trade Specialist",
      "Consultant","Management Consultant","Strategy Director",
    ],
  },
  {
    category: "Arts & Culture", color: "#ec4899",
    items: [
      "Artist","Painter","Sculptor","Illustrator","Graphic Designer",
      "Animator","Architect","Interior Designer","Fashion Designer",
      "Musician","Singer","Composer","DJ","Actor","Director",
      "Choreographer","Dancer","Cultural Ambassador","Art Curator",
    ],
  },
  {
    category: "Sports & Fitness", color: "#f97316",
    items: [
      "Athlete","Personal Trainer","Sports Coach","Yoga Instructor",
      "Pilates Instructor","CrossFit Coach","Marathon Runner",
      "Trail Runner","Mountain Climber","Rock Climber","Cyclist",
      "Triathlete","Swimmer","Surfer","Kitesurfer","Paraglider",
      "Skydiver","BASE Jumper","Mountaineer",
    ],
  },
  {
    category: "Government & NGO", color: "#14b8a6",
    items: [
      "Diplomat","Ambassador","Government Official","NGO Worker",
      "Humanitarian Aid Worker","UN Staff","Peace Corps Volunteer",
      "Development Worker","Policy Analyst","Lobbyist",
      "Community Organizer","Social Worker","Charity Director",
      "International Relations Specialist",
    ],
  },
  {
    category: "Food & Hospitality", color: "#dc2626",
    items: [
      "Chef","Pastry Chef","Food Blogger","Food Photographer",
      "Restaurant Owner","Sommelier","Barista","Mixologist",
      "Nutritionist","Dietitian","Culinary Instructor","Food Critic",
      "Caterer","Baker",
    ],
  },
  {
    category: "Volunteering & Lifestyle", color: "#84cc16",
    items: [
      "Volunteer","Digital Nomad","World Traveler","Backpacker",
      "Slow Traveler","Retiree Explorer","Gap Year Traveler",
      "Family Traveler","Solo Traveler","Luxury Traveler",
      "Budget Traveler","Pilgrim","Spiritual Seeker",
    ],
  },
  {
    category: "Engineering & Construction", color: "#78716c",
    items: [
      "Civil Engineer","Structural Engineer","Mechanical Engineer",
      "Electrical Engineer","Chemical Engineer","Aerospace Engineer",
      "Mining Engineer","Geologist","Geophysicist","Surveyor",
      "Urban Planner","Architect","Construction Manager","Site Engineer",
    ],
  },
  {
    category: "Legal & Compliance", color: "#7c3aed",
    items: [
      "Lawyer","Solicitor","Barrister","Judge","Notary",
      "Legal Consultant","Compliance Officer","Paralegal",
      "Intellectual Property Specialist","Immigration Lawyer",
      "International Law Expert","Human Rights Lawyer",
    ],
  },
  {
    category: "Logistics & Transport", color: "#0284c7",
    items: [
      "Pilot","Flight Attendant","Ship Captain","Sailor","Truck Driver",
      "Logistics Manager","Supply Chain Analyst","Freight Forwarder",
      "Customs Officer","Port Manager","Railway Engineer","Bus Driver",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   PROFESSION CARD — individual card component
═══════════════════════════════════════════════════════════════ */
const ProfessionCard = React.memo(({ item, catColor, catIcon: CatIcon, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-w-0 ${
      isSelected
        ? "shadow-md scale-[1.02]"
        : "bg-white hover:shadow-sm hover:-translate-y-0.5"
    }`}
    style={
      isSelected
        ? { borderColor: catColor, backgroundColor: `${catColor}10` }
        : { borderColor: "#e5e7eb" }
    }
  >
    {/* Icon */}
    <div
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 transition-all"
      style={{
        backgroundColor: isSelected ? catColor : "#f3f4f6",
        color: isSelected ? "#fff" : "#6b7280",
      }}
    >
      <CatIcon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
    </div>

    {/* Title */}
    <span className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-tight line-clamp-2">
      {item}
    </span>

    {/* Check badge */}
    {isSelected && (
      <div
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: catColor }}
      >
        <HiCheck className="w-3 h-3 text-white" />
      </div>
    )}
  </button>
));
ProfessionCard.displayName = "ProfessionCard";

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ProfessionPickerModal({
  isOpen,
  onClose,
  onSelect,
  current = "",
}) {
  const [search, setSearch]                     = useState("");
  const [activeCategory, setActiveCategory]     = useState("All");
  const [customMode, setCustomMode]             = useState(false);
  const [customValue, setCustomValue]           = useState("");
  const searchRef = useRef(null);
  const customRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch(""); setActiveCategory("All");
      setCustomMode(false); setCustomValue("");
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (customMode) setTimeout(() => customRef.current?.focus(), 60);
  }, [customMode]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PROFESSION_CATEGORIES.map((cat) => {
      if (activeCategory !== "All" && cat.category !== activeCategory) return null;
      const items = q ? cat.items.filter((i) => i.toLowerCase().includes(q)) : cat.items;
      return items.length ? { ...cat, items } : null;
    }).filter(Boolean);
  }, [search, activeCategory]);

  const totalVisible = filtered.reduce((n, c) => n + c.items.length, 0);

  const handleSelect = useCallback((profession) => {
    onSelect(profession);
    onClose();
  }, [onClose, onSelect]);

  const handleCustomSubmit = useCallback(() => {
    const val = customValue.trim();
    if (val) handleSelect(val);
  }, [customValue, handleSelect]);

  if (!isOpen) return null;

  const allCategories = ["All", ...PROFESSION_CATEGORIES.map((c) => c.category)];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full bg-white flex flex-col overflow-hidden sm:rounded-3xl"
        style={{
          maxWidth: "920px",
          maxHeight: "92vh",
          borderRadius: "24px 24px 0 0",
        }}
        role="dialog" aria-modal="true" aria-label="Select your profession"
      >
        <style>{`@media(min-width:640px){[data-pm-root]{border-radius:24px !important}}`}</style>

        <div data-pm-root className="flex flex-col overflow-hidden" style={{ maxHeight: "92vh" }}>

          {/* Drag handle (mobile) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 sm:px-7 pt-3 sm:pt-5 pb-3 flex-shrink-0">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-tight">
                What's your profession?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalVisible} options across {PROFESSION_CATEGORIES.length} categories
              </p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0 ml-3"
              aria-label="Close"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 sm:px-7 pb-3 flex-shrink-0">
            <div className="relative">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input ref={searchRef} type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveCategory("All"); }}
                placeholder="Search any profession…"
                className="w-full h-10 pl-10 pr-10 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex-shrink-0 border-b border-gray-100">
            <div className="flex gap-2 overflow-x-auto px-5 sm:px-7 pb-3" style={{ scrollbarWidth: "none" }}>
              {allCategories.map((cat) => {
                const active = activeCategory === cat;
                const CIcon  = CAT_ICONS[cat];
                return (
                  <button key={cat} type="button"
                    onClick={() => { setActiveCategory(cat); setSearch(""); }}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {CIcon && <CIcon className="w-3.5 h-3.5" />}
                    <span>{cat === "All" ? "All" : cat.split(" & ")[0].split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Card grid ── */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-6 min-h-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-gray-600 font-semibold mb-1">No results for &quot;{search}&quot;</p>
                <p className="text-sm text-gray-400 mb-5">You can add it manually below</p>
                <button type="button"
                  onClick={() => { setCustomMode(true); setCustomValue(search); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <HiPencil className="w-4 h-4" />Add &quot;{search}&quot; as custom
                </button>
              </div>
            ) : (
              filtered.map((cat) => {
                const CIcon = CAT_ICONS[cat.category] || HiOfficeBuilding;
                return (
                  <div key={cat.category}>
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-3">
                      <CIcon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>
                        {cat.category}
                      </h4>
                      <div className="flex-1 h-px" style={{ background: cat.color + "20" }} />
                      <span className="text-[10px] text-gray-400 tabular-nums">{cat.items.length}</span>
                    </div>

                    {/* Cards grid — same style as "I am a…" cards */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                      {cat.items.map((item) => (
                        <ProfessionCard
                          key={item}
                          item={item}
                          catColor={cat.color}
                          catIcon={CIcon}
                          isSelected={current === item}
                          onClick={() => handleSelect(item)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/80 px-5 sm:px-7 py-3.5 sm:py-4">
            {customMode ? (
              <div className="flex gap-2">
                <input ref={customRef} type="text" value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCustomSubmit();
                    if (e.key === "Escape") setCustomMode(false);
                  }}
                  placeholder="Type your profession and press Enter…"
                  className="flex-1 h-10 px-4 rounded-xl border-2 border-emerald-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                />
                <button type="button" onClick={handleCustomSubmit} disabled={!customValue.trim()}
                  className="px-4 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-all flex-shrink-0"
                >Add</button>
                <button type="button" onClick={() => setCustomMode(false)}
                  className="px-3 h-10 rounded-xl text-gray-500 hover:bg-gray-200 transition-all flex-shrink-0"
                ><HiX className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <button type="button" onClick={() => setCustomMode(true)}
                  className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 text-sm font-medium hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <HiPencil className="w-4 h-4" />Enter custom profession
                </button>
                <button type="button"
                  onClick={() => { onSelect(""); onClose(); }}
                  className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl text-gray-400 text-sm hover:text-gray-600 hover:bg-gray-100 transition-all"
                >Prefer not to say</button>
                {current && (
                  <div className="sm:ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                    <HiCheck className="w-3.5 h-3.5" />{current}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}