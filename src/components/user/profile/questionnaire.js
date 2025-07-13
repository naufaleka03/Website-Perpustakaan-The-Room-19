'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/supabase/client';
import { IoIosArrowDown } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaBook, FaSmile, FaQuestionCircle } from 'react-icons/fa';

export default function Questionnaire() {
  const router = useRouter();
  const supabase = createClient();

  // 1. Ensure all formData fields are initialized to empty string/array/defaults
  const [formData, setFormData] = useState({
    ageGroup: '',
    occupation: '',
    educationLevel: '',
    state: '',
    city: '',
    preferredLanguage: '',
    favoriteGenres: [],
    preferredBookTypes: [],
    preferredFormats: [],
    readingFrequency: '',
    readingTimeAvailability: '',
    favoriteBooks: [],
    readingMotivation: [],
    bookVibe: [],
    readingHabits: '',
    readingGoals: '',
    dislikedGenres: [],
  });
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  // --- Genre Modal State and Fetch ---
  const [genreModalOpen, setGenreModalOpen] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [genreSearch, setGenreSearch] = useState('');

  // Add state for disliked genre modal
  const [dislikedGenreModalOpen, setDislikedGenreModalOpen] = useState(false);

  // Add localStorage persistence for formData
  const LOCAL_STORAGE_KEY = 'userProfileQuestionnaireData';

  // On mount, load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch {}
    }
  }, []);

  // On formData change, save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    // Simulate loading user data (replace with real fetch if needed)
    setTimeout(() => setLoading(false), 800);
  }, []);

  useEffect(() => {
    // Fetch genres from API
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres');
        const data = await response.json();
        if (data.success && data.data) {
          setAvailableGenres(data.data.map(g => g.genre_name));
        } else {
          setAvailableGenres([]);
        }
      } catch (error) {
        setAvailableGenres([]);
      }
    };
    fetchGenres();
  }, []);

  // --- Reading Motivation and Book Vibe Options ---
  const readingMotivations = [
    { value: 'learn', label: 'To learn new things', desc: '(I read to gain knowledge or skills.)' },
    { value: 'relax', label: 'To relax and unwind', desc: '(I read to de-stress and enjoy quiet time.)' },
    { value: 'entertain', label: 'To be entertained', desc: '(I read for fun, excitement, or adventure.)' },
    { value: 'inspire', label: 'To be inspired', desc: '(I read to find motivation or new perspectives.)' },
    { value: 'connect', label: 'To connect with others', desc: '(I read to discuss books or join communities.)' },
  ];
  const bookVibes = [
    { value: 'feelgood', label: 'Feel Good', desc: '(Books that make me happy or leave me with a positive feeling.)' },
    { value: 'funny', label: 'Funny', desc: '(Stories that are humorous, light-hearted, or easy to read.)' },
    { value: 'adventurous', label: 'Adventurous', desc: '(Books full of action, adventure, or thrilling moments.)' },
    { value: 'mysterious', label: 'Mysterious', desc: '(Stories with mysteries, puzzles, or lots of suspense.)' },
    { value: 'romantic', label: 'Romantic', desc: '(Books that focus on love stories or relationships.)' },
    { value: 'emotional', label: 'Emotional', desc: '(Stories that move me or make me feel deeply.)' },
    { value: 'serious', label: 'Serious', desc: '(Books that make me think or reflect on life.)' },
  ];

  // --- Genre Modal Component ---
  const GenreModal = ({ isOpen, onClose, selected, onChange }) => {
    const [localSelected, setLocalSelected] = useState(selected);
    const [search, setSearch] = useState('');
    useEffect(() => { setLocalSelected(selected); }, [selected]);
    if (!isOpen) return null;
    const filteredGenres = availableGenres.filter(g => g.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50" onClick={onClose}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-medium text-gray-900">Select Favorite Genres</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><IoClose size={24} /></button>
          </div>
          <div className="p-4 border-b">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search genres" className="w-full h-[38px] bg-[#f2f2f2] rounded-2xl border border-[#cdcdcd] pl-4 pr-4 text-xs text-gray-400" />
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            {filteredGenres.map(genre => (
              <label key={genre} className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={localSelected.includes(genre)}
                  onChange={() => setLocalSelected(localSelected.includes(genre) ? localSelected.filter(g => g !== genre) : [...localSelected, genre])}
                  className="w-4 h-4 rounded-2xl border-[#cdcdcd]"
                  style={{ accentColor: "#2e3105" }}
                />
                <span className="text-black text-xs font-medium">{genre}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={() => { setLocalSelected([]); }} className="text-xs text-gray-500 hover:underline">Clear All</button>
            <button onClick={() => { onChange(localSelected); onClose(); }} className="bg-[#2e3105] text-white rounded-2xl px-4 py-1 text-xs font-medium hover:bg-[#404615]">Apply</button>
          </div>
        </div>
      </div>
    );
  };

  const bookTypes = [
    { value: 'fiction', label: 'Fiction' },
    { value: 'non_fiction', label: 'Non-Fiction' }
  ];

  const formats = [
    { value: 'paperback', label: 'Paperback' },
    { value: 'hardcover', label: 'Hardcover' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'audiobook', label: 'Audiobook' }
  ];

  const feelings = [
    { value: 'inspired', label: 'Inspired' },
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'thrilled', label: 'Thrilled' },
    { value: 'educated', label: 'Educated' },
    { value: 'entertained', label: 'Entertained' },
    { value: 'thoughtful', label: 'Thoughtful' }
  ];

  const genres = [
    { value: 'arts_architecture', label: 'Arts & Architecture' },
    { value: 'business', label: 'Business' },
    { value: 'children_book', label: "Children's Books" },
    { value: 'chinese_literature', label: 'Chinese Literature' },
    { value: 'climate_change', label: 'Climate Change' },
    { value: 'colonialism', label: 'Colonialism' },
    { value: 'crc_fict', label: 'Colonialism, Race, Class (Fict.)' },
    { value: 'crime_mystery', label: "Crime & Mystery" },
    { value: 'critiques_capitalism', label: 'Critiques on Capitalism' },
    { value: 'dystopian_postapocalyptic', label: 'Dystopian & Post-Apocalyptic' },
    { value: 'education', label: 'Education' },
    { value: 'family', label: 'Family' },
    { value: 'fantasy_scifi', label: 'Fantasy & Sci-Fi' },
    { value: 'feminism', label: 'Feminism' },
    { value: 'graphic_novels', label: 'Graphic Novels' },
    { value: 'historical_fiction', label: 'Historical Fiction' },
    { value: 'history', label: 'History' },
    { value: 'indonesian_literature', label: 'Indonesian Literature' },
    { value: 'japanese_literature', label: 'Japanese Literature' },
    { value: 'korean_literature', label: 'Korean Literature' },
    { value: 'literacy_criticalism', label: 'Literacy Criticalism' },
    { value: 'magazine_zine', label: 'Magazine & Zine' },
    { value: 'memoirs_biography', label: 'Memoirs & Biography' },
    { value: 'natural_science', label: 'Natural Science' },
    { value: 'on_womanhood', label: 'On Womanhood' },
    { value: 'other_people', label: "Other People's Book" },
    { value: 'pets', label: 'Pets!' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'poetry_literacy', label: 'Poetry & Literacy Criticism' },
    { value: 'politics_sociology', label: 'Politics & Sociology' },
    { value: 'psychology_selfhelp', label: 'Psychology & Self Help' },
    { value: 'religions', label: 'Religions' },
    { value: 'romance', label: 'Romance' },
    { value: 'russian_literature', label: 'Russian Literature' },
    { value: 'science', label: 'Science' },
    { value: 'self_discovery', label: 'Self Discovery' },
    { value: 'self_help', label: 'Self Help' },
    { value: 'travel', label: 'Travel' },
    { value: 'western_classic_lit', label: 'Western Classic Lit.' },
    { value: 'western_classics', label: 'Western Classics' },
    { value: 'western_contemporary', label: 'Western Contemporary Lit.' },
    { value: 'world_literature', label: 'World Literature' },
  ];

  const handleCheckboxChange = (value, field) => {
    const newValues = formData[field].includes(value)
      ? formData[field].filter(item => item !== value)
      : [...formData[field], value];
    setFormData({ ...formData, [field]: newValues });
  };

  const handleSelectChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
    e.target.blur(); // Remove focus after selection
  };

  const handleGenreSelect = (e, field) => {
    const value = e.target.value;
    if (value && !formData[field].includes(value)) {
      setFormData({ ...formData, [field]: [...formData[field], value] });
    }
    e.target.value = ''; // Reset select
    e.target.blur(); // Remove focus after selection
  };

  const removeGenre = (genreToRemove, field) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(genre => genre !== genreToRemove)
    });
  };

  const handleBookInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newBook = e.target.value.trim();
      if (!formData.favoriteBooks.includes(newBook) && formData.favoriteBooks.length < 3) {
        setFormData({
          ...formData,
          favoriteBooks: [...formData.favoriteBooks, newBook]
        });
      }
      e.target.value = '';
    }
  };

  const removeBook = (bookToRemove) => {
    setFormData({
      ...formData,
      favoriteBooks: formData.favoriteBooks.filter(book => book !== bookToRemove)
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.ageGroup) errors.ageGroup = 'Age group is required.';
    if (!formData.occupation) errors.occupation = 'Occupation is required.';
    if (!formData.educationLevel) errors.educationLevel = 'Education level is required.';
    if (!formData.state) errors.state = 'State is required.';
    if (!formData.city) errors.city = 'City is required.';
    if (!formData.preferredLanguage) errors.preferredLanguage = 'Preferred language is required.';
    if (!formData.favoriteGenres.length) errors.favoriteGenres = 'Select at least one favorite genre.';
    if (!formData.preferredBookTypes.length) errors.preferredBookTypes = 'Select at least one book type.';
    if (!formData.preferredFormats.length) errors.preferredFormats = 'Select at least one format.';
    if (!formData.readingFrequency) errors.readingFrequency = 'Reading frequency is required.';
    if (!formData.readingTimeAvailability) errors.readingTimeAvailability = 'Reading time availability is required.';
    if (!formData.readingMotivation.length) errors.readingMotivation = 'Select at least one reading motivation.';
    if (!formData.bookVibe.length) errors.bookVibe = 'Select at least one book vibe.';
    // favoriteBooks, readingHabits, readingGoals, dislikedGenres are optional
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Map the form data to match the database schema
      const preferencesData = {
        user_id: session.user.id,
        age_group: formData.ageGroup,
        occupation: formData.occupation,
        education_level: formData.educationLevel,
        state: formData.state,
        city: formData.city,
        preferred_language: formData.preferredLanguage,
        reading_frequency: formData.readingFrequency,
        reading_time_availability: formData.readingTimeAvailability,
        reader_type: formData.readerType,
        reading_goals: formData.readingGoals ? parseInt(formData.readingGoals) : null,
        reading_habits: formData.readingHabits,
        favorite_genres: formData.favoriteGenres,
        preferred_book_types: formData.preferredBookTypes,
        preferred_formats: formData.preferredFormats,
        favorite_books: formData.favoriteBooks,
        desired_feelings: formData.desiredFeelings,
        disliked_genres: formData.dislikedGenres
      };

      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferencesData),
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      setSubmitStatus('success');
      setFormErrors({});
      setTimeout(() => router.push('/user/dashboard/profile'), 2000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#232310] to-[#5f5f2c] flex items-center justify-center">
        <div className="max-w-[600px] w-full mx-auto p-8 bg-white rounded-xl shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#232310] to-[#5f5f2c] p-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">Reading Preferences Questionnaire</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Demographic Info Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4 flex items-center gap-2"><FaUser className="text-[#2e3105]" /> Demographic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Age Group</label>
                <div className="relative group">
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={(e) => handleSelectChange(e, 'ageGroup')}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                  >
                    <option value="">Select age group</option>
                    <option value="<18">Under 18</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                    <IoIosArrowDown size={16} />
                  </div>
                </div>
                {formErrors.ageGroup && <p className="text-red-500 text-xs mt-1">{formErrors.ageGroup}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Select your age group for demographic insights.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666]"
                  placeholder="Enter your occupation"
                />
                {formErrors.occupation && <p className="text-red-500 text-xs mt-1">{formErrors.occupation}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Your occupation helps us tailor recommendations to your field.</p>
              </div>

              <div>
                <label className="block text-sm text-[#666666] mb-1">Education Level</label>
                <div className="relative group">
                  <select
                    value={formData.educationLevel}
                    onChange={(e) => handleSelectChange(e, 'educationLevel')}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                  >
                    <option value="">Select education level</option>
                    <option value="high_school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                    <IoIosArrowDown size={16} />
                  </div>
                </div>
                {formErrors.educationLevel && <p className="text-red-500 text-xs mt-1">{formErrors.educationLevel}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Your education level influences your reading preferences.</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-[#666666] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666]"
                    placeholder="Enter your state"
                  />
                  {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                  <p className="text-xs text-[#666666]/80 mt-1">Your state helps us find local bookstores and events.</p>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-[#666666] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666]"
                    placeholder="Enter your city"
                  />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  <p className="text-xs text-[#666666]/80 mt-1">Your city helps us find local bookstores and events.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Preferred Reading Language</label>
                <div className="relative group">
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => handleSelectChange(e, 'preferredLanguage')}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                  >
                    <option value="">Select language</option>
                    <option value="english">English</option>
                    <option value="indonesian">Indonesian</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                    <IoIosArrowDown size={16} />
                  </div>
                </div>
                {formErrors.preferredLanguage && <p className="text-red-500 text-xs mt-1">{formErrors.preferredLanguage}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Your preferred language helps us find books in your language.</p>
              </div>
            </div>
          </div>

          {/* Reading Behavior & Preferences Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4 flex items-center gap-2"><FaBook className="text-[#2e3105]" /> Reading Behavior & Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Preferred Book Types</label>
                <div className="space-y-0.5 text-sm text-[#666666]">
                  {bookTypes.map(({ value, label }) => (
                    <label key={value} className="flex items-center p-1.5 rounded-lg hover:bg-[#2e3105]/5 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferredBookTypes.includes(value)}
                        onChange={() => handleCheckboxChange(value, 'preferredBookTypes')}
                        className="mr-2 w-4 h-4 rounded border-[#666666]/30 text-[#2e3105] focus:ring-[#2e3105]/20"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {formErrors.preferredBookTypes && <p className="text-red-500 text-xs mt-1">{formErrors.preferredBookTypes}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Select the types of books you prefer to read.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Preferred Formats</label>
                <div className="space-y-0.5 text-sm text-[#666666]">
                  {formats.map(({ value, label }) => (
                    <label key={value} className="flex items-center p-1.5 rounded-lg hover:bg-[#2e3105]/5 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferredFormats.includes(value)}
                        onChange={() => handleCheckboxChange(value, 'preferredFormats')}
                        className="mr-2 w-4 h-4 rounded border-[#666666]/30 text-[#2e3105] focus:ring-[#2e3105]/20"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {formErrors.preferredFormats && <p className="text-red-500 text-xs mt-1">{formErrors.preferredFormats}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Select the formats you prefer for your reading experience.</p>
              </div>
                
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#666666] mb-1">Favorite Genres</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.favoriteGenres.length === 0 && <span className="text-xs text-gray-400">No genres selected.</span>}
                  {formData.favoriteGenres.map(genre => (
                    <span key={genre} className="bg-[#2e3105] text-white rounded-2xl px-3 py-1 text-xs flex items-center gap-1">{genre} <button onClick={() => setFormData({ ...formData, favoriteGenres: formData.favoriteGenres.filter(g => g !== genre) })}><IoClose size={14} /></button></span>
                  ))}
                </div>
                <button type="button" onClick={() => setGenreModalOpen(true)} className="bg-[#2e3105] text-white rounded-2xl px-4 py-1 text-xs font-medium hover:bg-[#404615]">Select Genres</button>
                <p className="text-xs text-[#666666]/80 mt-1">Select your favorite genres to help us find books that match your interests.</p>
                <GenreModal isOpen={genreModalOpen} onClose={() => setGenreModalOpen(false)} selected={formData.favoriteGenres} onChange={genres => setFormData({ ...formData, favoriteGenres: genres })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Reading Frequency</label>
                <div className="relative group">
                  <select
                    value={formData.readingFrequency}
                    onChange={(e) => handleSelectChange(e, 'readingFrequency')}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="rarely">Rarely</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                    <IoIosArrowDown size={16} />
                  </div>
                </div>
                {formErrors.readingFrequency && <p className="text-red-500 text-xs mt-1">{formErrors.readingFrequency}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Select how often you read books.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Reading Time Availability</label>
                <div className="relative group">
                  <select
                    value={formData.readingTimeAvailability}
                    onChange={(e) => handleSelectChange(e, 'readingTimeAvailability')}
                    className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                  >
                    <option value="">Select time availability</option>
                    <option value="<15 mins">Less than 15 minutes</option>
                    <option value="15-30 mins">15-30 minutes</option>
                    <option value="30-60 mins">30-60 minutes</option>
                    <option value="1 hour+">1 hour or more</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                    <IoIosArrowDown size={16} />
                  </div>
                </div>
                {formErrors.readingTimeAvailability && <p className="text-red-500 text-xs mt-1">{formErrors.readingTimeAvailability}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Select how much time you can dedicate to reading each day.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Top 3 Favorite Books</label>
                <div className="space-y-2">
                  {formData.favoriteBooks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.favoriteBooks.map((book) => (
                        <div
                          key={book}
                          className="flex items-center gap-1 bg-[#2e3105]/10 px-2 py-1 rounded-full text-sm text-[#666666]"
                        >
                          <span>{book}</span>
                          <button
                            type="button"
                            onClick={() => removeBook(book)}
                            className="text-[#666666] hover:text-[#2e3105]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.favoriteBooks.length < 3 && (
                    <input
                      type="text"
                      onKeyDown={handleBookInput}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] placeholder:text-[#666666]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none transition-all duration-300"
                      placeholder={`Type a book title and press Enter (${3 - formData.favoriteBooks.length} remaining)`}
                    />
                  )}
                </div>
                {formErrors.favoriteBooks && <p className="text-red-500 text-xs mt-1">{formErrors.favoriteBooks}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Add your top 3 favorite books to help us recommend them to you.</p>
              </div>
            </div>
          </div>

          {/* Personality & Mood-based Inputs Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4 flex items-center gap-2"><FaSmile className="text-[#2e3105]" /> Personality & Mood-based Inputs</h2>
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#666666] mb-1">Reading Motivation</label>
                <div className="flex flex-col gap-2">
                  {readingMotivations.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.readingMotivation?.includes(opt.value)}
                        onChange={() => {
                          const newVal = formData.readingMotivation?.includes(opt.value)
                            ? formData.readingMotivation.filter(v => v !== opt.value)
                            : [...(formData.readingMotivation || []), opt.value];
                          setFormData({ ...formData, readingMotivation: newVal });
                        }}
                        className="w-4 h-4 rounded border-[#cdcdcd]"
                        style={{ accentColor: "#2e3105" }}
                      />
                      <span className="text-sm text-[#111010] font-medium">{opt.label}</span>
                      <span className="text-xs text-[#666666]">{opt.desc}</span>
                    </label>
                  ))}
                </div>
                {formErrors.readingMotivation && <p className="text-red-500 text-xs mt-1">{formErrors.readingMotivation}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Select all that apply. This helps us understand why you read.</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#666666] mb-1">Preferred Book Vibe</label>
                <div className="flex flex-col gap-2">
                  {bookVibes.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.bookVibe?.includes(opt.value)}
                        onChange={() => {
                          const newVal = formData.bookVibe?.includes(opt.value)
                            ? formData.bookVibe.filter(v => v !== opt.value)
                            : [...(formData.bookVibe || []), opt.value];
                          setFormData({ ...formData, bookVibe: newVal });
                        }}
                        className="w-4 h-4 rounded border-[#cdcdcd]"
                        style={{ accentColor: "#2e3105" }}
                      />
                      <span className="text-sm text-[#111010] font-medium">{opt.label}</span>
                      <span className="text-xs text-[#666666]">{opt.desc}</span>
                    </label>
                  ))}
                </div>
                {formErrors.bookVibe && <p className="text-red-500 text-xs mt-1">{formErrors.bookVibe}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Pick the vibes you enjoy most in books. This helps us match your mood.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Personal story about reading habits</label>
                <textarea
                  value={formData.readingHabits}
                  onChange={(e) => setFormData({ ...formData, readingHabits: e.target.value })}
                  className="w-full h-[100px] rounded-lg border border-[#666666]/30 px-4 py-2 text-sm text-[#666666]"
                  placeholder="Tell us about your reading habits and preferences..."
                />
                {formErrors.readingHabits && <p className="text-red-500 text-xs mt-1">{formErrors.readingHabits}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Tell us about your reading habits and preferences to help us tailor recommendations.</p>
              </div>
            </div>
          </div>

          {/* Optional Add-ons Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4 flex items-center gap-2"><FaQuestionCircle className="text-[#2e3105]" /> Optional Add-ons</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#666666] mb-1">Reading Goals (books/month)</label>
                <input
                  type="number"
                  value={formData.readingGoals}
                  onChange={(e) => setFormData({ ...formData, readingGoals: e.target.value })}
                  className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 text-sm text-[#666666] focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none transition-all duration-300"
                  placeholder="Enter your reading goal"
                  min="0"
                />
                {formErrors.readingGoals && <p className="text-red-500 text-xs mt-1">{formErrors.readingGoals}</p>}
                <p className="text-xs text-[#666666]/80 mt-1">Set a reading goal to help us recommend books that are challenging and engaging.</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#666666] mb-1">Disliked Genres</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dislikedGenres.length === 0 && <span className="text-xs text-gray-400">No genres selected.</span>}
                  {formData.dislikedGenres.map(genre => (
                    <span key={genre} className="bg-red-200 text-red-800 rounded-2xl px-3 py-1 text-xs flex items-center gap-1">{genre} <button onClick={() => setFormData({ ...formData, dislikedGenres: formData.dislikedGenres.filter(g => g !== genre) })}><IoClose size={14} /></button></span>
                  ))}
                </div>
                <button type="button" onClick={() => setDislikedGenreModalOpen(true)} className="bg-red-600 text-white rounded-2xl px-4 py-1 text-xs font-medium hover:bg-red-700">Select Disliked Genres</button>
                <p className="text-xs text-[#666666]/80 mt-1">Select genres you dislike to avoid recommending them to you.</p>
                <GenreModal isOpen={dislikedGenreModalOpen} onClose={() => setDislikedGenreModalOpen(false)} selected={formData.dislikedGenres} onChange={genres => setFormData({ ...formData, dislikedGenres: genres })} />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="h-[40px] bg-[#2e3105] text-white rounded-3xl px-6 text-sm font-medium transition-all duration-300 hover:bg-[#404615]"
            >
              Save Preferences
            </button>
          </div>
          {submitStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">Preferences saved successfully!</div>
          )}
          {submitStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">Please fix the highlighted errors and try again.</div>
          )}
        </form>
      </div>
    </div>
  );
}
