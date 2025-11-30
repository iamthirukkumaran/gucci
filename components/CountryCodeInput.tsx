"use client";

import { useState, useRef, useEffect } from "react";
import { countries, type Country } from "@/lib/countries";

interface CountryCodeInputProps {
  value: string;
  onChange: (country: Country) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function CountryCodeInput({
  value,
  onChange,
  label = "COUNTRY CODE",
  placeholder = "Enter code or dial code (e.g., IN, 91, +971)",
  required = false,
}: CountryCodeInputProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find country by code
  const selectedCountry = countries.find((c) => c.code === value);

  // Handle search
  useEffect(() => {
    if (!input.trim()) {
      setFilteredCountries([]);
      return;
    }

    const term = input.toUpperCase().replace("+", "");
    const results = countries.filter(
      (country) =>
        country.code.includes(term) ||
        country.dialCode.replace("+", "").includes(term) ||
        country.name.toUpperCase().includes(term)
    );
    setFilteredCountries(results);
  }, [input]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setInput("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country);
    setInput("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value.toUpperCase();
    setInput(newInput);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (input.trim() || filteredCountries.length > 0) {
      setIsOpen(true);
    }
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
          value={input}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
        />

        {/* Selected country display when not typing */}
        {!isOpen && selectedCountry && (
          <div className="absolute right-4 top-3 text-xs text-gray-600 font-light">
            {selectedCountry.code} ({selectedCountry.dialCode})
          </div>
        )}

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={`${country.code}-${country.dialCode}`}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full text-left px-4 py-3 font-light text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedCountry?.code === country.code
                      ? "bg-black text-white hover:bg-black"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{country.code}</span>
                    <span className="text-xs opacity-70">
                      {country.dialCode} - {country.name}
                    </span>
                  </div>
                </button>
              ))
            ) : input.trim() ? (
              <div className="px-4 py-3 text-gray-500 text-sm font-light">
                No codes found for "{input}"
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
