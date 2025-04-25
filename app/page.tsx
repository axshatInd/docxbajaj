"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DoctorCard from "@/components/doctor-card";
import FilterPanel from "@/components/filter-panel";
import AutocompleteSearch from "@/components/autocomplete-search";
import Pagination from "@/components/pagination";
import type { Doctor } from "@/types/doctor";

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;
  const [manualPageChange, setManualPageChange] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filter values from URL params
  const consultationType = searchParams.get("consultationType");
  const specialties =
    searchParams.get("specialties")?.split(",").filter(Boolean) || [];
  const sortBy = searchParams.get("sortBy");
  const page = searchParams.get("page")
    ? Number.parseInt(searchParams.get("page") || "1")
    : 1;

  // Set current page from URL on initial load
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }

        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError("Failed to load doctors. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Memoize the filtered doctors list
  const filteredDoctors = useMemo(() => {
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by consultation type
    if (consultationType) {
      if (consultationType === "video") {
        filtered = filtered.filter((doctor) => doctor.video_consult);
      } else if (consultationType === "clinic") {
        filtered = filtered.filter((doctor) => doctor.in_clinic);
      }
    }

    // Filter by specialties
    if (specialties.length > 0) {
      filtered = filtered.filter((doctor) =>
        doctor.specialities.some((specialty) =>
          specialties.includes(specialty.name)
        )
      );
    }

    // Sort doctors
    if (sortBy) {
      if (sortBy === "fees") {
        filtered.sort((a, b) => {
          const aFees = Number.parseInt(a.fees.replace(/[^\d]/g, "") || "0");
          const bFees = Number.parseInt(b.fees.replace(/[^\d]/g, "") || "0");
          return aFees - bFees;
        });
      } else if (sortBy === "experience") {
        filtered.sort((a, b) => {
          const aExp = Number.parseInt(a.experience.match(/\d+/)?.[0] || "0");
          const bExp = Number.parseInt(b.experience.match(/\d+/)?.[0] || "0");
          return bExp - aExp; // Descending order for experience
        });
      }
    }

    return filtered;
  }, [doctors, searchTerm, consultationType, specialties, sortBy]);

  const updateFilters = useCallback(
    (type: string | null, specs: string[], sort: string | null) => {
      // We need to ensure we are handling filters only, not URL state
      const params = new URLSearchParams(window.location.search);

      if (type) {
        params.set("consultationType", type);
      } else {
        params.delete("consultationType");
      }

      if (specs.length > 0) {
        params.set("specialties", specs.join(","));
      } else {
        params.delete("specialties");
      }

      if (sort) {
        params.set("sortBy", sort);
      } else {
        params.delete("sortBy");
      }

      // Reset to page 1 when filters change
      params.set("page", "1");
      setCurrentPage(1); // Update the page to 1

      // Update the URL without refreshing the page
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router] // We now only rely on router here
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handlePageChange = (page: number) => {
    // Only update the page if it's different from the current one
    if (page !== currentPage) {
      setManualPageChange(true); // Track manual page change

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());

      router.push(`?${params.toString()}`, { scroll: false });
      setCurrentPage(page); // Update the state with the new page
    }
  };

  useEffect(() => {
    // Retrieve the page number from the URL on initial mount
    const pageFromURL = new URLSearchParams(window.location.search).get("page");
    const initialPage = pageFromURL ? Number(pageFromURL) : 1;

    // Update the page if it's different from the currentPage
    if (initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, []); // Empty dependency array means this runs only once on mount

  // Get current doctors for pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="bg-blue-700 p-4 flex justify-center items-center">
        <div className="w-full max-w-3xl relative">
          <AutocompleteSearch
            doctors={doctors}
            onSearch={handleSearchChange}
            searchTerm={searchTerm}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <FilterPanel
            doctors={doctors}
            updateFilters={updateFilters}
            initialConsultationType={consultationType}
            initialSpecialties={specialties}
            initialSortBy={sortBy}
          />
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-semibold text-green-600">
              {filteredDoctors.length} Doctors found
            </h2>
          </div>

          <div className="space-y-4">
            {currentDoctors.length > 0 ? (
              currentDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium text-red-500">
                  No doctors found matching your criteria
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </div>

          {filteredDoctors.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
