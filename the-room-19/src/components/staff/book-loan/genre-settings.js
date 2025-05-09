"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const GenreSettings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);

  const genres = [
    { name: "Arts & Architecture", count: 1 },
    { name: "Business", count: 2 },
    { name: "CCI", count: 2 },
    { name: "Children's Book", count: 2 },
    { name: "Chinese Literature", count: 3 },
    { name: "Climate Change", count: 3 },
    { name: "Colonialism", count: 3 },
    { name: "Colonialism, Race, Class (Fiction)", count: 4 },
    { name: "Crime & Mystery", count: 4 },
    { name: "Critiques on Capitalism", count: 4 },
    { name: "Dystopian & Post-Apocalyptic", count: 4 },
    { name: "Education", count: 5 },
    { name: "Family", count: 5 },
  ];

  const handleSelectAll = () => {
    if (selectedGenres.length === genres.length) {
      setSelectedGenres([]);
    } else {
      setSelectedGenres(genres.map((genre) => genre.name));
    }
  };

  const handleGenreSelect = (genreName) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreName)) {
        return prev.filter((name) => name !== genreName);
      } else {
        return [...prev, genreName];
      }
    });
  };

  const handleAddGenre = () => {
    if (newGenre.trim()) {
      // Add implementation for adding new genre
      console.log("Adding new genre:", newGenre);
      setNewGenre("");
    }
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-6">
          <h1 className="text-lg font-semibold font-manrope text-black mb-6">
            Genre Settings
          </h1>

          <div className="flex gap-8">
            {/* Left Panel - Genre List */}
            <div className="w-[400px] bg-white rounded-2xl border border-neutral-500/50 p-4 flex flex-col">
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <FiSearch className="text-stone-500/50 w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-10 pl-10 rounded-2xl border border-stone-300 text-xs font-normal font-manrope text-stone-500/50 focus:outline-none focus:border-lime-950"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Select All */}
              <div className="flex items-center mb-3">
                <button
                  onClick={handleSelectAll}
                  className="text-lime-950 text-xs font-medium font-manrope hover:text-lime-900"
                >
                  Select All
                </button>
              </div>

              {/* Genre List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {filteredGenres.map((genre, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.name)}
                        onChange={() => handleGenreSelect(genre.name)}
                        className="w-4 h-4 rounded-[3px] border border-stone-300 bg-zinc-100 cursor-pointer"
                      />
                      <span className="text-black text-xs font-medium font-manrope">
                        {genre.name}
                      </span>
                    </div>
                    <span className="text-stone-500 text-xs font-medium font-manrope">
                      {genre.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6">
                <button className="w-24 h-8 bg-lime-950 text-white rounded-lg text-xs font-medium font-manrope hover:bg-lime-900 transition-colors">
                  Transfer
                </button>
              </div>
            </div>

            {/* Right Panel - Add Genre */}
            <div className="w-[400px] bg-white rounded-2xl border border-neutral-500/50 p-4 flex flex-col">
              <h2 className="text-black text-xs font-medium font-manrope mb-3">
                Add genre
              </h2>
              <div className="border-b border-neutral-500/40 mb-4"></div>

              <input
                type="text"
                placeholder="Enter genre name"
                className="w-full h-10 px-4 bg-zinc-100 rounded-2xl border border-stone-300 text-xs font-medium font-manrope text-stone-500/40 focus:outline-none focus:border-lime-950"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddGenre()}
              />

              <div className="flex-1" />

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  className="w-24 h-8 border border-lime-950 text-lime-950 rounded-lg text-xs font-medium font-manrope hover:bg-lime-950/5 transition-colors"
                  onClick={() => setNewGenre("")}
                >
                  Delete
                </button>
                <button
                  className="w-24 h-8 bg-lime-950 text-white rounded-lg text-xs font-medium font-manrope hover:bg-lime-900 transition-colors"
                  onClick={handleAddGenre}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreSettings;
