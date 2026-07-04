// CountryPhoneSelect.jsx — WhatsApp-style with inline dial-code typing + SVG flags
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { HiChevronDown, HiSearch, HiX, HiCheck } from "react-icons/hi";

/* ═══════════════════════════════════════════════════════════════
   FLAG IMAGE — uses flagcdn.com SVG for instant rendering
   SVGs are tiny (~1KB each) and cached aggressively by browsers
═══════════════════════════════════════════════════════════════ */
const FlagImg = React.memo(({ code, size = 20, className = "" }) => {
  const lc = code.toLowerCase();
  return (
    <>
      <img
        src={`https://flagcdn.com/${lc}.svg`}
        width={size}
        height={Math.round(size * 0.75)}
        alt={code}
        loading="lazy"
        decoding="async"
        className={`inline-block object-cover flex-shrink-0 rounded-[2px] ${className}`}
        style={{ aspectRatio: "4/3" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          if (e.currentTarget.nextElementSibling)
            e.currentTarget.nextElementSibling.style.display = "flex";
        }}
      />
      {/* Text fallback — hidden by default */}
      <span
        className="items-center justify-center rounded bg-gray-200 text-gray-500 font-mono text-[9px] font-bold flex-shrink-0"
        style={{
          display: "none",
          width: `${size}px`,
          height: `${Math.round(size * 0.75)}px`,
        }}
      >
        {code}
      </span>
    </>
  );
});
FlagImg.displayName = "FlagImg";

/* ═══════════════════════════════════════════════════════════════
   COUNTRIES DATA
═══════════════════════════════════════════════════════════════ */
export const COUNTRIES = [
  { code: "AF", name: "Afghanistan",          dial: "+93"   },
  { code: "AL", name: "Albania",              dial: "+355"  },
  { code: "DZ", name: "Algeria",              dial: "+213"  },
  { code: "AD", name: "Andorra",              dial: "+376"  },
  { code: "AO", name: "Angola",               dial: "+244"  },
  { code: "AG", name: "Antigua & Barbuda",    dial: "+1268" },
  { code: "AR", name: "Argentina",            dial: "+54"   },
  { code: "AM", name: "Armenia",              dial: "+374"  },
  { code: "AU", name: "Australia",            dial: "+61"   },
  { code: "AT", name: "Austria",              dial: "+43"   },
  { code: "AZ", name: "Azerbaijan",           dial: "+994"  },
  { code: "BS", name: "Bahamas",              dial: "+1242" },
  { code: "BH", name: "Bahrain",              dial: "+973"  },
  { code: "BD", name: "Bangladesh",           dial: "+880"  },
  { code: "BB", name: "Barbados",             dial: "+1246" },
  { code: "BY", name: "Belarus",              dial: "+375"  },
  { code: "BE", name: "Belgium",              dial: "+32"   },
  { code: "BZ", name: "Belize",               dial: "+501"  },
  { code: "BJ", name: "Benin",                dial: "+229"  },
  { code: "BT", name: "Bhutan",               dial: "+975"  },
  { code: "BO", name: "Bolivia",              dial: "+591"  },
  { code: "BA", name: "Bosnia & Herzegovina", dial: "+387"  },
  { code: "BW", name: "Botswana",             dial: "+267"  },
  { code: "BR", name: "Brazil",               dial: "+55"   },
  { code: "BN", name: "Brunei",               dial: "+673"  },
  { code: "BG", name: "Bulgaria",             dial: "+359"  },
  { code: "BF", name: "Burkina Faso",         dial: "+226"  },
  { code: "BI", name: "Burundi",              dial: "+257"  },
  { code: "CV", name: "Cabo Verde",           dial: "+238"  },
  { code: "KH", name: "Cambodia",             dial: "+855"  },
  { code: "CM", name: "Cameroon",             dial: "+237"  },
  { code: "CA", name: "Canada",               dial: "+1"    },
  { code: "CF", name: "Central African Rep.", dial: "+236"  },
  { code: "TD", name: "Chad",                 dial: "+235"  },
  { code: "CL", name: "Chile",                dial: "+56"   },
  { code: "CN", name: "China",                dial: "+86"   },
  { code: "CO", name: "Colombia",             dial: "+57"   },
  { code: "KM", name: "Comoros",              dial: "+269"  },
  { code: "CG", name: "Congo",                dial: "+242"  },
  { code: "CD", name: "Congo (DRC)",          dial: "+243"  },
  { code: "CR", name: "Costa Rica",           dial: "+506"  },
  { code: "CI", name: "Côte d'Ivoire",        dial: "+225"  },
  { code: "HR", name: "Croatia",              dial: "+385"  },
  { code: "CU", name: "Cuba",                 dial: "+53"   },
  { code: "CY", name: "Cyprus",               dial: "+357"  },
  { code: "CZ", name: "Czech Republic",       dial: "+420"  },
  { code: "DK", name: "Denmark",              dial: "+45"   },
  { code: "DJ", name: "Djibouti",             dial: "+253"  },
  { code: "DM", name: "Dominica",             dial: "+1767" },
  { code: "DO", name: "Dominican Republic",   dial: "+1809" },
  { code: "EC", name: "Ecuador",              dial: "+593"  },
  { code: "EG", name: "Egypt",                dial: "+20"   },
  { code: "SV", name: "El Salvador",          dial: "+503"  },
  { code: "GQ", name: "Equatorial Guinea",    dial: "+240"  },
  { code: "ER", name: "Eritrea",              dial: "+291"  },
  { code: "EE", name: "Estonia",              dial: "+372"  },
  { code: "SZ", name: "Eswatini",             dial: "+268"  },
  { code: "ET", name: "Ethiopia",             dial: "+251"  },
  { code: "FJ", name: "Fiji",                 dial: "+679"  },
  { code: "FI", name: "Finland",              dial: "+358"  },
  { code: "FR", name: "France",               dial: "+33"   },
  { code: "GA", name: "Gabon",                dial: "+241"  },
  { code: "GM", name: "Gambia",               dial: "+220"  },
  { code: "GE", name: "Georgia",              dial: "+995"  },
  { code: "DE", name: "Germany",              dial: "+49"   },
  { code: "GH", name: "Ghana",                dial: "+233"  },
  { code: "GR", name: "Greece",               dial: "+30"   },
  { code: "GD", name: "Grenada",              dial: "+1473" },
  { code: "GT", name: "Guatemala",            dial: "+502"  },
  { code: "GN", name: "Guinea",               dial: "+224"  },
  { code: "GW", name: "Guinea-Bissau",        dial: "+245"  },
  { code: "GY", name: "Guyana",               dial: "+592"  },
  { code: "HT", name: "Haiti",                dial: "+509"  },
  { code: "HN", name: "Honduras",             dial: "+504"  },
  { code: "HU", name: "Hungary",              dial: "+36"   },
  { code: "IS", name: "Iceland",              dial: "+354"  },
  { code: "IN", name: "India",                dial: "+91"   },
  { code: "ID", name: "Indonesia",            dial: "+62"   },
  { code: "IR", name: "Iran",                 dial: "+98"   },
  { code: "IQ", name: "Iraq",                 dial: "+964"  },
  { code: "IE", name: "Ireland",              dial: "+353"  },
  { code: "IL", name: "Israel",               dial: "+972"  },
  { code: "IT", name: "Italy",                dial: "+39"   },
  { code: "JM", name: "Jamaica",              dial: "+1876" },
  { code: "JP", name: "Japan",                dial: "+81"   },
  { code: "JO", name: "Jordan",               dial: "+962"  },
  { code: "KZ", name: "Kazakhstan",           dial: "+7"    },
  { code: "KE", name: "Kenya",                dial: "+254"  },
  { code: "KI", name: "Kiribati",             dial: "+686"  },
  { code: "KW", name: "Kuwait",               dial: "+965"  },
  { code: "KG", name: "Kyrgyzstan",           dial: "+996"  },
  { code: "LA", name: "Laos",                 dial: "+856"  },
  { code: "LV", name: "Latvia",               dial: "+371"  },
  { code: "LB", name: "Lebanon",              dial: "+961"  },
  { code: "LS", name: "Lesotho",              dial: "+266"  },
  { code: "LR", name: "Liberia",              dial: "+231"  },
  { code: "LY", name: "Libya",                dial: "+218"  },
  { code: "LI", name: "Liechtenstein",        dial: "+423"  },
  { code: "LT", name: "Lithuania",            dial: "+370"  },
  { code: "LU", name: "Luxembourg",           dial: "+352"  },
  { code: "MG", name: "Madagascar",           dial: "+261"  },
  { code: "MW", name: "Malawi",               dial: "+265"  },
  { code: "MY", name: "Malaysia",             dial: "+60"   },
  { code: "MV", name: "Maldives",             dial: "+960"  },
  { code: "ML", name: "Mali",                 dial: "+223"  },
  { code: "MT", name: "Malta",                dial: "+356"  },
  { code: "MH", name: "Marshall Islands",     dial: "+692"  },
  { code: "MR", name: "Mauritania",           dial: "+222"  },
  { code: "MU", name: "Mauritius",            dial: "+230"  },
  { code: "MX", name: "Mexico",               dial: "+52"   },
  { code: "FM", name: "Micronesia",           dial: "+691"  },
  { code: "MD", name: "Moldova",              dial: "+373"  },
  { code: "MC", name: "Monaco",               dial: "+377"  },
  { code: "MN", name: "Mongolia",             dial: "+976"  },
  { code: "ME", name: "Montenegro",           dial: "+382"  },
  { code: "MA", name: "Morocco",              dial: "+212"  },
  { code: "MZ", name: "Mozambique",           dial: "+258"  },
  { code: "MM", name: "Myanmar",              dial: "+95"   },
  { code: "NA", name: "Namibia",              dial: "+264"  },
  { code: "NR", name: "Nauru",                dial: "+674"  },
  { code: "NP", name: "Nepal",                dial: "+977"  },
  { code: "NL", name: "Netherlands",          dial: "+31"   },
  { code: "NZ", name: "New Zealand",          dial: "+64"   },
  { code: "NI", name: "Nicaragua",            dial: "+505"  },
  { code: "NE", name: "Niger",                dial: "+227"  },
  { code: "NG", name: "Nigeria",              dial: "+234"  },
  { code: "NO", name: "Norway",               dial: "+47"   },
  { code: "OM", name: "Oman",                 dial: "+968"  },
  { code: "PK", name: "Pakistan",             dial: "+92"   },
  { code: "PW", name: "Palau",                dial: "+680"  },
  { code: "PA", name: "Panama",               dial: "+507"  },
  { code: "PG", name: "Papua New Guinea",     dial: "+675"  },
  { code: "PY", name: "Paraguay",             dial: "+595"  },
  { code: "PE", name: "Peru",                 dial: "+51"   },
  { code: "PH", name: "Philippines",          dial: "+63"   },
  { code: "PL", name: "Poland",               dial: "+48"   },
  { code: "PT", name: "Portugal",             dial: "+351"  },
  { code: "QA", name: "Qatar",                dial: "+974"  },
  { code: "RO", name: "Romania",              dial: "+40"   },
  { code: "RU", name: "Russia",               dial: "+7"    },
  { code: "RW", name: "Rwanda",               dial: "+250"  },
  { code: "KN", name: "Saint Kitts & Nevis",  dial: "+1869" },
  { code: "LC", name: "Saint Lucia",          dial: "+1758" },
  { code: "VC", name: "Saint Vincent",        dial: "+1784" },
  { code: "WS", name: "Samoa",                dial: "+685"  },
  { code: "SM", name: "San Marino",           dial: "+378"  },
  { code: "ST", name: "São Tomé & Príncipe",  dial: "+239"  },
  { code: "SA", name: "Saudi Arabia",         dial: "+966"  },
  { code: "SN", name: "Senegal",              dial: "+221"  },
  { code: "RS", name: "Serbia",               dial: "+381"  },
  { code: "SC", name: "Seychelles",           dial: "+248"  },
  { code: "SL", name: "Sierra Leone",         dial: "+232"  },
  { code: "SG", name: "Singapore",            dial: "+65"   },
  { code: "SK", name: "Slovakia",             dial: "+421"  },
  { code: "SI", name: "Slovenia",             dial: "+386"  },
  { code: "SB", name: "Solomon Islands",      dial: "+677"  },
  { code: "SO", name: "Somalia",              dial: "+252"  },
  { code: "ZA", name: "South Africa",         dial: "+27"   },
  { code: "SS", name: "South Sudan",          dial: "+211"  },
  { code: "ES", name: "Spain",                dial: "+34"   },
  { code: "LK", name: "Sri Lanka",            dial: "+94"   },
  { code: "SD", name: "Sudan",                dial: "+249"  },
  { code: "SR", name: "Suriname",             dial: "+597"  },
  { code: "SE", name: "Sweden",               dial: "+46"   },
  { code: "CH", name: "Switzerland",          dial: "+41"   },
  { code: "SY", name: "Syria",                dial: "+963"  },
  { code: "TW", name: "Taiwan",               dial: "+886"  },
  { code: "TJ", name: "Tajikistan",           dial: "+992"  },
  { code: "TZ", name: "Tanzania",             dial: "+255"  },
  { code: "TH", name: "Thailand",             dial: "+66"   },
  { code: "TL", name: "Timor-Leste",          dial: "+670"  },
  { code: "TG", name: "Togo",                 dial: "+228"  },
  { code: "TO", name: "Tonga",                dial: "+676"  },
  { code: "TT", name: "Trinidad & Tobago",    dial: "+1868" },
  { code: "TN", name: "Tunisia",              dial: "+216"  },
  { code: "TR", name: "Turkey",               dial: "+90"   },
  { code: "TM", name: "Turkmenistan",         dial: "+993"  },
  { code: "TV", name: "Tuvalu",               dial: "+688"  },
  { code: "UG", name: "Uganda",               dial: "+256"  },
  { code: "UA", name: "Ukraine",              dial: "+380"  },
  { code: "AE", name: "United Arab Emirates", dial: "+971"  },
  { code: "GB", name: "United Kingdom",       dial: "+44"   },
  { code: "US", name: "United States",        dial: "+1"    },
  { code: "UY", name: "Uruguay",              dial: "+598"  },
  { code: "UZ", name: "Uzbekistan",           dial: "+998"  },
  { code: "VU", name: "Vanuatu",              dial: "+678"  },
  { code: "VE", name: "Venezuela",            dial: "+58"   },
  { code: "VN", name: "Vietnam",              dial: "+84"   },
  { code: "YE", name: "Yemen",                dial: "+967"  },
  { code: "ZM", name: "Zambia",               dial: "+260"  },
  { code: "ZW", name: "Zimbabwe",             dial: "+263"  },
];

// Pre-sorted descending by dial length for matching
const COUNTRIES_BY_DIAL = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length,
);

export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "RW") || COUNTRIES[0];

// Export FlagImg so other components can use it
export { FlagImg };

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function CountryPhoneSelect({
  value = "",
  onChange,
  placeholder = "Phone number",
  error,
  valid,
  disabled = false,
  className = "",
}) {
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [rawInput, setRawInput]               = useState("");
  const [isOpen, setIsOpen]                   = useState(false);
  const [search, setSearch]                   = useState("");
  const containerRef = useRef(null);
  const searchRef    = useRef(null);
  const inputRef     = useRef(null);

  /* ── Sync inbound value on mount ── */
  useEffect(() => {
    if (!value) return;
    const matched = COUNTRIES_BY_DIAL.find((c) => value.startsWith(c.dial));
    if (matched) {
      setSelectedCountry(matched);
      setRawInput(value.slice(matched.dial.length).trimStart());
    } else {
      setRawInput(value.replace(/^\+/, ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Emit combined value ── */
  const emit = useCallback(
    (country, num) => {
      const digits = num.replace(/\D/g, "");
      onChange?.(digits ? `${country.dial}${digits}` : "");
    },
    [onChange],
  );

  /* ── Country selected from dropdown ── */
  const handleCountrySelect = useCallback(
    (country) => {
      setSelectedCountry(country);
      setIsOpen(false);
      setSearch("");
      emit(country, rawInput);
      // Focus back to number input
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [emit, rawInput],
  );

  /* ── Handle typing in the number input ──
     Key feature: if user types "+250..." we auto-detect the country
  ── */
  const handleInputChange = useCallback(
    (e) => {
      let val = e.target.value;

      // If the user starts with "+" they might be typing a dial code
      if (val.startsWith("+")) {
        const withPlus = val.replace(/[^\d+]/g, ""); // keep only digits and +
        // Try to match dial code as user types (check longest matches first)
        const matched = COUNTRIES_BY_DIAL.find((c) =>
          withPlus.startsWith(c.dial),
        );
        if (matched) {
          // Auto-select country and strip the dial code from input
          setSelectedCountry(matched);
          const remaining = withPlus.slice(matched.dial.length);
          setRawInput(remaining);
          emit(matched, remaining);
          return;
        }
        // No match yet — keep raw input as-is (user still typing the code)
        setRawInput(val);
        // Don't emit until we have a valid match
        return;
      }

      // Normal digits without + prefix
      const cleaned = val.replace(/[^\d\s\-().]/g, "");
      setRawInput(cleaned);
      emit(selectedCountry, cleaned);
    },
    [emit, selectedCountry],
  );

  /* ── Click-outside ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  /* ── Auto-focus search ── */
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [isOpen]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const borderCls = error
    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
    : valid
      ? "border-emerald-300 focus-within:border-emerald-400 focus-within:ring-emerald-100"
      : "border-gray-200 hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-emerald-100";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Input row ── */}
      <div
        className={`flex h-12 rounded-xl border-2 bg-gray-50/50 transition-all duration-200 focus-within:ring-4 ${borderCls}`}
        style={{ overflow: "visible" }}
      >
        {/* Country trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          aria-label={`Selected: ${selectedCountry.name} (${selectedCountry.dial})`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 border-r border-gray-200 bg-white/70 hover:bg-gray-100/80 transition-colors flex-shrink-0 rounded-l-[10px]"
          style={{ minWidth: "84px" }}
        >
          <FlagImg code={selectedCountry.code} size={20} />
          <span className="text-xs font-semibold text-gray-700 tabular-nums whitespace-nowrap">
            {selectedCountry.dial}
          </span>
          <HiChevronDown
            className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Number input — also accepts "+250..." for auto-country-detect */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          value={rawInput}
          onChange={handleInputChange}
          placeholder={`${placeholder} or type ${selectedCountry.dial}...`}
          disabled={disabled}
          autoComplete="tel"
          className="flex-1 min-w-0 px-3 bg-transparent text-gray-900 text-sm placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[9999] w-full sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          role="listbox"
          aria-label="Country dial codes"
        >
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No countries found</p>
            ) : (
              filtered.map((country) => {
                const isSel = selectedCountry.code === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSel ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <FlagImg code={country.code} size={22} />
                    <span className="flex-1 text-sm font-medium truncate">{country.name}</span>
                    <span className="text-xs text-gray-400 tabular-nums flex-shrink-0 font-mono">{country.dial}</span>
                    {isSel && <HiCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}