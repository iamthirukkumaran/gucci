"use client";

import { useState, useRef, useEffect } from "react";
import { countries, filterCountries, type Country } from "@/lib/countries";

interface CountrySelectorProps {
  value: string;
  onChange: (country: Country) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function CountrySelector({
  value,
  onChange,
  label = "COUNTRY",
  placeholder = "Select or type country name...",
  required = false,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected country
  const selectedCountry = countries.find((c) => c.name === value);

  // Handle search
  useEffect(() => {
    const results = filterCountries(searchTerm);
    setFilteredCountries(results);
  }, [searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm("");
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-light tracking-wider mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
        />

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full text-left px-4 py-3 font-light text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedCountry?.code === country.code
                      ? "bg-black text-white hover:bg-black"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{country.name}</span>
                    <span className="text-xs opacity-70">{country.dialCode}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm font-light">
                No countries found
              </div>
            )}
          </div>
        )}

        {selectedCountry && !isOpen && (
          <div className="absolute right-4 top-3 text-xs text-gray-600 font-light">
            {selectedCountry.dialCode}
          </div>
        )}
      </div>
    </div>
  );
}
