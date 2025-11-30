"use client";

import { useState, useRef, useEffect } from "react";
import { countries, filterCountries } from "@/lib/countriesWithFlags";
import { getMaxPhoneDigits, extractDigits } from "@/lib/phoneValidation";
import type { Country } from "@/lib/countriesWithFlags";

interface CountryPhoneInputProps {
  countryCode: string;
  phone: string;
  onCountryChange: (country: Country) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
}

export default function CountryPhoneInput({
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
  error,
}: CountryPhoneInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected country from countryCode prop
  const selectedCountry = countryCode 
    ? countries.find((c) => c.code === countryCode) || null
    : null;

  // Initialize search term with selected country name when first loaded
  useEffect(() => {
    if (selectedCountry && searchTerm === "") {
      setSearchTerm(selectedCountry.name);
    }
  }, [selectedCountry?.code]);

  // Handle search and show countries
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = filterCountries(searchTerm);
      setFilteredCountries(results);
    } else {
      // Show all countries when search is empty
      setFilteredCountries(countries);
    }
  }, [searchTerm]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country: Country) => {
    setSearchTerm(country.name);
    setShowDropdown(false);
    onCountryChange(country);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = extractDigits(e.target.value);
    
    if (selectedCountry) {
      const maxDigits = getMaxPhoneDigits(selectedCountry.code);
      value = value.slice(0, maxDigits);
    }
    
    onPhoneChange(value);
  };

  const handleCountryInputFocus = () => {
    setShowDropdown(true);
    setFilteredCountries(countries);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-light tracking-wide">
        PHONE NUMBER <span className="text-red-600">*</span>
      </label>
      
      {/* Container for country selector and phone input */}
      <div className="flex gap-3 items-stretch">
        {/* Country Selector with Dropdown */}
        <div className="relative flex-1" ref={dropdownRef}>
          <div className="relative h-full">
            <input
              type="text"
              placeholder="Select country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleCountryInputFocus}
              className={`w-full h-full px-4 py-3 border focus:outline-none bg-white text-sm placeholder-gray-400 transition-colors font-light ${
                error
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-black"
              }`}
            />

            {/* Country Flag & Dial Code Display */}
            {selectedCountry && !showDropdown && !searchTerm.trim() && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <span className="text-gray-600 text-sm font-light">{selectedCountry.dialCode}</span>
              </div>
            )}

            {/* Dropdown with Countries */}
            {showDropdown && filteredCountries.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 shadow-lg max-h-72 overflow-y-auto z-50">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-light text-sm truncate">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.dialCode}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="flex-2">
          <input
            type="tel"
            placeholder="Enter number"
            value={phone}
            onChange={handlePhoneChange}
            className={`w-full h-full px-4 py-3 border focus:outline-none bg-white text-sm placeholder-gray-400 transition-colors font-light ${
              error
                ? "border-red-500 focus:border-red-600"
                : "border-gray-300 focus:border-black"
            }`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-xs font-light">
          {error}
        </p>
      )}

      {/* Help Text */}
      {selectedCountry && !error && (
        <div className="text-xs text-gray-500 font-light">
          {selectedCountry.flag} {selectedCountry.name} • Maximum {getMaxPhoneDigits(selectedCountry.code)} digits
        </div>
      )}
    </div>
  );
}
