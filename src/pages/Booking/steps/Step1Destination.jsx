import React, { useMemo } from "react";
import { HiGlobe, HiLocationMarker, HiCheck } from "react-icons/hi";
import { SelectField } from "../components/FormComponents";

const GROUPS = [
  { v: "solo",      l: "Solo",      d: "Just me" },
  { v: "couple",    l: "Couple",    d: "Two of us" },
  { v: "family",    l: "Family",    d: "Kids welcome" },
  { v: "friends",   l: "Friends",   d: "Group trip" },
  { v: "corporate", l: "Corporate", d: "Business" },
  { v: "honeymoon", l: "Honeymoon", d: "Romantic" },
];

export default function Step1Destination({
  data, set, touch, errors, touched,
  countriesList, destinationsList,
}) {
  const filtered = useMemo(() => {
    if (!data.countryId) return [];
    return destinationsList.filter(d => String(d.countryId) === String(data.countryId));
  }, [destinationsList, data.countryId]);

  const selectedDest = useMemo(
    () => filtered.find(d => String(d.value) === String(data.destinationId)) || null,
    [filtered, data.destinationId],
  );

  return (
    <div className="space-y-4">
      <SelectField
        id="countryId" label="Destination Country" icon={HiGlobe}
        value={data.countryId}
        onChange={(v) => { set("countryId", v); set("destinationId", ""); }}
        onBlur={() => touch("countryId")}
        required
        error={touched.countryId && errors.countryId}
        valid={touched.countryId && !errors.countryId && !!data.countryId}
      >
        <option value="">— Select a country —</option>
        {countriesList.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </SelectField>

      {data.countryId && (
        filtered.length > 0 ? (
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-gray-700">
              Specific Destination <span className="text-red-500 ml-0.5">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {filtered.map(d => (
                <button key={d.value} type="button"
                  onClick={() => { set("destinationId", d.value); touch("destinationId"); }}
                  className={`group relative flex items-center gap-2.5 text-left p-2.5 rounded-xl
                    border-2 transition-all duration-200 overflow-hidden
                    ${data.destinationId === d.value
                      ? "border-emerald-400 bg-emerald-50/80 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"}`}>
                  <span className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {d.image ? (
                      <img src={d.image} alt="" loading="lazy" decoding="async"
                        className="w-full h-full object-cover" />
                    ) : (
                      <HiLocationMarker className="w-5 h-5 text-gray-400 m-3" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800 truncate">
                      {d.label}
                    </span>
                    {d.country && (
                      <span className="block text-[11px] text-gray-400 truncate">{d.country}</span>
                    )}
                  </span>
                  {data.destinationId === d.value && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full
                                    bg-emerald-500 flex items-center justify-center">
                      <HiCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {touched.destinationId && errors.destinationId && (
              <p className="text-xs text-red-500">{errors.destinationId}</p>
            )}

            {selectedDest && (
              <div className="am-slideDown flex items-center gap-3 rounded-xl bg-emerald-50/70
                              border border-emerald-100 p-3">
                <span className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedDest.image ? (
                    <img src={selectedDest.image} alt={selectedDest.label}
                      loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <HiLocationMarker className="w-6 h-6 text-gray-400 m-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                    Selected
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">{selectedDest.label}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              No destinations listed for this country yet
            </p>
            <p className="text-xs text-amber-700">
              <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline">
                Message us on WhatsApp
              </a>
              {" "}— we'll build a custom itinerary for you.
            </p>
          </div>
        )
      )}

      <div className="space-y-2">
        <span className="block text-sm font-semibold text-gray-700">
          Group Type <span className="text-red-500 ml-0.5">*</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GROUPS.map(g => (
            <button key={g.v} type="button"
              onClick={() => { set("groupType", g.v); touch("groupType"); }}
              className={`relative flex flex-col items-start text-left p-3 rounded-xl border-2
                transition-all duration-200
                ${data.groupType === g.v
                  ? "border-emerald-400 bg-emerald-50/80 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"}`}>
              <span className="text-sm font-semibold text-gray-800">{g.l}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">{g.d}</span>
              {data.groupType === g.v && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full
                                bg-emerald-500 flex items-center justify-center">
                  <HiCheck className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        {touched.groupType && errors.groupType && (
          <p className="text-xs text-red-500">{errors.groupType}</p>
        )}
      </div>
    </div>
  );
}