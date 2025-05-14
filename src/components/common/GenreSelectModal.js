"use client";

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BiSearch } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

const GenreSelectModal = ({ isOpen, onClose, genres = [], selectedGenres = [], onChange, title = "Select Genres" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGenres, setFilteredGenres] = useState(genres);

  // Reset filtered genres when genres prop changes
  useEffect(() => {
    setFilteredGenres(genres);
  }, [genres]);

  // Filter genres based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGenres(genres);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = genres.filter(genre => 
      genre.toLowerCase().includes(query)
    );
    setFilteredGenres(filtered);
  }, [searchQuery, genres]);

  const handleGenreToggle = (genre) => {
    let newSelected;
    if (selectedGenres.includes(genre)) {
      newSelected = selectedGenres.filter(g => g !== genre);
    } else {
      newSelected = [...selectedGenres, genre];
    }
    onChange(newSelected);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="flex items-center justify-between border-b p-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <IoClose size={24} />
                  </button>
                </div>

                {/* Search Box */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search genres"
                      className="w-full h-[38px] bg-[#f2f2f2] rounded-2xl border border-[#cdcdcd] pl-10 pr-4 text-xs text-gray-400"
                    />
                    <BiSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>

                {/* Genres List */}
                <div className="max-h-[350px] overflow-y-auto p-4">
                  {filteredGenres.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No genres found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {filteredGenres.map((genre) => (
                        <label
                          key={genre}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre)}
                            onChange={() => handleGenreToggle(genre)}
                            className="w-4 h-4 rounded-sm border-[#cdcdcd]"
                            style={{ accentColor: "#2e3105" }}
                          />
                          <span className="text-black text-xs font-medium truncate">
                            {genre}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center border-t p-4">
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 border border-[#2e3105] text-[#2e3105] text-xs rounded-2xl"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-[#2e3105] text-white text-xs rounded-2xl"
                  >
                    Apply
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GenreSelectModal; 