"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search } from "lucide-react"
import type { Doctor } from "@/types/doctor"

interface AutocompleteSearchProps {
  doctors: Doctor[]
  onSearch: (value: string) => void
  searchTerm: string
}

export default function AutocompleteSearch({ doctors, onSearch, searchTerm }: AutocompleteSearchProps) {
  const [inputValue, setInputValue] = useState(searchTerm)
  const [suggestions, setSuggestions] = useState<Doctor[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update input value when searchTerm prop changes
  useEffect(() => {
    setInputValue(searchTerm)
  }, [searchTerm])

  // Update suggestions when input changes
  const updateSuggestions = useCallback(() => {
    if (inputValue.trim() === "") {
      setSuggestions([])
      return
    }

    const filtered = doctors
      .filter((doctor) => doctor.name.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 3) // Limit to top 3 suggestions

    setSuggestions(filtered)
  }, [inputValue, doctors])

  useEffect(() => {
    updateSuggestions()
  }, [updateSuggestions])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    if (inputValue.trim() !== "") {
      setShowSuggestions(true)
    }
  }

  const handleSuggestionClick = (doctor: Doctor) => {
    setInputValue(doctor.name)
    onSearch(doctor.name)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(inputValue)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative w-[83vw] -translate-x-96">

      <div className="">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Symptoms, Doctors, Specialists, Clinics"
          className="w-full py-3 px-4 pl-12 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          data-testid="autocomplete-input"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((doctor) => (
            <div
              key={doctor.id}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSuggestionClick(doctor)}
              data-testid="suggestion-item"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                  {doctor.photo && (
                    <img
                      src={doctor.photo || "/placeholder.svg"}
                      alt={doctor.name}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium">{doctor.name}</div>
                  <div className="text-sm text-gray-600">{doctor.specialities.map((s) => s.name).join(", ")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
