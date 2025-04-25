"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Doctor } from "@/types/doctor";

interface FilterPanelProps {
  doctors: Doctor[];
  updateFilters: (
    type: string | null,
    specialties: string[],
    sortBy: string | null
  ) => void;
  initialConsultationType: string | null;
  initialSpecialties: string[];
  initialSortBy: string | null;
}

export default function FilterPanel({
  doctors,
  updateFilters,
  initialConsultationType,
  initialSpecialties,
  initialSortBy,
}: FilterPanelProps) {
  const [consultationType, setConsultationType] = useState<string | null>(
    initialConsultationType
  );
  const [selectedSpecialties, setSelectedSpecialties] =
    useState<string[]>(initialSpecialties);
  const [sortBy, setSortBy] = useState<string | null>(initialSortBy);

  const [specialtiesOpen, setSpecialtiesOpen] = useState(true);
  const [consultationOpen, setConsultationOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  // Required specialty list with exact names for data-testid
  const requiredSpecialties = [
    "General Physician",
    "Dentist",
    "Dermatologist",
    "Paediatrician",
    "Gynaecologist and Obstetrician",
    "ENT",
    "Diabetologist",
    "Cardiologist",
    "Physiotherapist",
    "Endocrinologist",
    "Orthopaedic",
    "Ophthalmologist",
    "Gastroenterologist",
    "Pulmonologist",
    "Psychiatrist",
    "Urologist",
    "Dietitian/Nutritionist",
    "Psychologist",
    "Sexologist",
    "Nephrologist",
    "Neurologist",
    "Oncologist",
    "Ayurveda",
    "Homeopath",
  ];

  // Memoize the update function to prevent infinite loops
  const applyFilters = useCallback(() => {
    updateFilters(consultationType, selectedSpecialties, sortBy);
  }, [consultationType, selectedSpecialties, sortBy, updateFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // This will now only be called when the filters actually change

  // Update URL on filter change
  // useEffect(() => {
  //   const queryParams = new URLSearchParams();
  //   if (consultationType)
  //     queryParams.append("consultationType", consultationType);
  //   if (selectedSpecialties.length > 0) {
  //     selectedSpecialties.forEach((specialty) =>
  //       queryParams.append("specialty", specialty)
  //     );
  //   }
  //   if (sortBy) queryParams.append("sortBy", sortBy);

  //   const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
  //   window.history.pushState(null, "", newUrl);
  // }, [consultationType, selectedSpecialties, sortBy]);

  const handleConsultationTypeChange = (type: string | null) => {
    setConsultationType(type);
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(specialty)) {
        return prev.filter((s) => s !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  const handleSortChange = (sort: string) => {
    setSortBy((prevSort) => (prevSort === sort ? null : sort));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          className="text-blue-600 text-sm font-medium"
          onClick={() => {
            setConsultationType(null);
            setSelectedSpecialties([]);
            setSortBy(null);
          }}
        >
          Clear All
        </button>
      </div>

      {/* Sort Filter */}
      <div className="mb-6 border-b pb-4">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => setSortOpen(!sortOpen)}
          data-testid="filter-header-sort"
        >
          <h3 className="font-medium">Sort by</h3>
          {sortOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {sortOpen && (
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={sortBy === "fees"}
                onChange={() => handleSortChange("fees")}
                className="form-radio"
                data-testid="sort-fees"
              />
              <span>Price: Low-High</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={sortBy === "experience"}
                onChange={() => handleSortChange("experience")}
                className="form-radio"
                data-testid="sort-experience"
              />
              <span>Experience: Most Experienced first</span>
            </label>
          </div>
        )}
      </div>

      {/* Specialties Filter */}
      <div className="mb-6 border-b pb-4">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => setSpecialtiesOpen(!specialtiesOpen)}
          data-testid="filter-header-speciality"
        >
          <h3 className="font-medium">Specialities</h3>
          {specialtiesOpen ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>

        {specialtiesOpen && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {requiredSpecialties.map((specialty) => (
              <label
                key={specialty}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSpecialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="form-checkbox"
                  data-testid={`filter-specialty-${specialty.replace(
                    /\//g,
                    "-"
                  )}`}
                />
                <span>{specialty}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Consultation Mode Filter */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => setConsultationOpen(!consultationOpen)}
          data-testid="filter-header-moc"
        >
          <h3 className="font-medium">Mode of Consultation</h3>
          {consultationOpen ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </div>

        {consultationOpen && (
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={consultationType === "video"}
                onChange={() => handleConsultationTypeChange("video")}
                className="form-radio"
                data-testid="filter-video-consult"
              />
              <span>Video Consultation</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={consultationType === "clinic"}
                onChange={() => handleConsultationTypeChange("clinic")}
                className="form-radio"
                data-testid="filter-in-clinic"
              />
              <span>In-Clinic Consultation</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={consultationType === null}
                onChange={() => handleConsultationTypeChange(null)}
                className="form-radio"
                data-testid="filter-all"
              />
              <span>All</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
