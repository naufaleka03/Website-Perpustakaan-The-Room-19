'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/supabase/client';
import { IoIosArrowDown } from 'react-icons/io';

export default function Questionnaire() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    // Demographic Info
    ageGroup: '',
    occupation: '',
    educationLevel: '',
    state: '',
    city: '',
    preferredLanguage: '',

    // Reading Behavior & Preferences
    favoriteGenres: [],
    preferredBookTypes: [],
    preferredFormats: [],
    readingFrequency: '',
    readingTimeAvailability: '',
    favoriteBooks: [],

    // Personality & Mood-based Inputs
    readerType: '',
    desiredFeelings: [],
    readingHabits: '',

    // Optional Add-ons
    readingGoals: '',
    dislikedGenres: [],
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    // Simulate loading user data (replace with real fetch if needed)
    setTimeout(() => setLoading(false), 800);
  }, []);

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
    const newErrors = {};
    if (!formData.ageGroup) newErrors.ageGroup = 'Age group is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.preferredLanguage) newErrors.preferredLanguage = 'Preferred language is required';
    if (formData.favoriteGenres.length === 0) newErrors.favoriteGenres = 'Select at least one favorite genre';
    if (formData.preferredBookTypes.length === 0) newErrors.preferredBookTypes = 'Select at least one book type';
    if (formData.preferredFormats.length === 0) newErrors.preferredFormats = 'Select at least one format';
    if (!formData.readingFrequency) newErrors.readingFrequency = 'Reading frequency is required';
    if (!formData.readingTimeAvailability) newErrors.readingTimeAvailability = 'Reading time availability is required';
    if (formData.favoriteBooks.length === 0) newErrors.favoriteBooks = 'Add at least one favorite book';
    if (!formData.readerType) newErrors.readerType = 'Select your reader type';
    if (formData.desiredFeelings.length === 0) newErrors.desiredFeelings = 'Select at least one desired feeling';
    if (!formData.readingHabits.trim()) newErrors.readingHabits = 'Describe your reading habits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSubmitStatus(null);
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
            <h2 className="text-lg font-semibold text-[#111010] mb-4">🧑 Demographic Info</h2>
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
                {errors.ageGroup && <p className="text-red-500 text-xs mt-1">{errors.ageGroup}</p>}
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
                {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
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
                {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
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
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
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
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
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
                {errors.preferredLanguage && <p className="text-red-500 text-xs mt-1">{errors.preferredLanguage}</p>}
              </div>
            </div>
          </div>

          {/* Reading Behavior & Preferences Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4">📚 Reading Behavior & Preferences</h2>
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
                {errors.preferredBookTypes && <p className="text-red-500 text-xs mt-1">{errors.preferredBookTypes}</p>}
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
                {errors.preferredFormats && <p className="text-red-500 text-xs mt-1">{errors.preferredFormats}</p>}
              </div>
                
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Favorite Genres</label>
                <div className="relative group">
                  {formData.favoriteGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.favoriteGenres.map((genre) => {
                        const genreLabel = genres.find(g => g.value === genre)?.label;
                        return (
                          <div
                            key={genre}
                            className="flex items-center gap-1 bg-[#2e3105]/10 px-2 py-1 rounded-full text-sm text-[#666666]"
                          >
                            <span>{genreLabel}</span>
                            <button
                              type="button"
                              onClick={() => removeGenre(genre, 'favoriteGenres')}
                              className="text-[#666666] hover:text-[#2e3105]"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="relative group">
                    <select
                      onChange={(e) => handleGenreSelect(e, 'favoriteGenres')}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                    >
                      <option value="">Select a genre to add</option>
                      {genres
                        .filter(genre => !formData.favoriteGenres.includes(genre.value))
                        .map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                      <IoIosArrowDown size={16} />
                    </div>
                  </div>
                </div>
                {errors.favoriteGenres && <p className="text-red-500 text-xs mt-1">{errors.favoriteGenres}</p>}
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
                {errors.readingFrequency && <p className="text-red-500 text-xs mt-1">{errors.readingFrequency}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">How much time can you dedicate to reading?</label>
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
                {errors.readingTimeAvailability && <p className="text-red-500 text-xs mt-1">{errors.readingTimeAvailability}</p>}
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
                {errors.favoriteBooks && <p className="text-red-500 text-xs mt-1">{errors.favoriteBooks}</p>}
              </div>
            </div>
          </div>

          {/* Personality & Mood-based Inputs Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4">🧠 Personality & Mood-based Inputs</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">What kind of reader are you?</label>
                <div className="space-y-2">
                  {['Explorer', 'Escapist', 'Knowledge Seeker', 'Casual Reader', 'Avid Reader'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="readerType"
                        value={type.toLowerCase()}
                        checked={formData.readerType === type.toLowerCase()}
                        onChange={(e) => setFormData({ ...formData, readerType: e.target.value })}
                        className="rounded"
                      />
                      <span className="text-sm text-[#666666]">{type}</span>
                    </label>
                  ))}
                </div>
                {errors.readerType && <p className="text-red-500 text-xs mt-1">{errors.readerType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">How do you want to feel after reading a book?</label>
                <div className="space-y-0.5 text-sm text-[#666666]">
                  {feelings.map(({ value, label }) => (
                    <label key={value} className="flex items-center p-1.5 rounded-lg hover:bg-[#2e3105]/5 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.desiredFeelings.includes(value)}
                        onChange={() => handleCheckboxChange(value, 'desiredFeelings')}
                        className="mr-2 w-4 h-4 rounded border-[#666666]/30 text-[#2e3105] focus:ring-[#2e3105]/20"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errors.desiredFeelings && <p className="text-red-500 text-xs mt-1">{errors.desiredFeelings}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666666] mb-1">Personal story about reading habits</label>
                <textarea
                  value={formData.readingHabits}
                  onChange={(e) => setFormData({ ...formData, readingHabits: e.target.value })}
                  className="w-full h-[100px] rounded-lg border border-[#666666]/30 px-4 py-2 text-sm text-[#666666]"
                  placeholder="Tell us about your reading habits and preferences..."
                />
                {errors.readingHabits && <p className="text-red-500 text-xs mt-1">{errors.readingHabits}</p>}
              </div>
            </div>
          </div>

          {/* Optional Add-ons Section */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#111010] mb-4">💡 Optional Add-ons</h2>
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
                {errors.readingGoals && <p className="text-red-500 text-xs mt-1">{errors.readingGoals}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#666666] mb-1">Genres you dislike</label>
                <div className="space-y-2">
                  {formData.dislikedGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.dislikedGenres.map((genre) => {
                        const genreLabel = genres.find(g => g.value === genre)?.label;
                        return (
                          <div
                            key={genre}
                            className="flex items-center gap-1 bg-[#2e3105]/10 px-2 py-1 rounded-full text-sm text-[#666666]"
                          >
                            <span>{genreLabel}</span>
                            <button
                              type="button"
                              onClick={() => removeGenre(genre, 'dislikedGenres')}
                              className="text-[#666666] hover:text-[#2e3105]"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="relative group">
                    <select
                      onChange={(e) => handleGenreSelect(e, 'dislikedGenres')}
                      className="w-full h-[35px] rounded-lg border border-[#666666]/30 px-4 pr-8 text-sm text-[#666666] appearance-none bg-white transition-all duration-300 hover:border-[#2e3105]/50 focus:border-[#2e3105] focus:ring-1 focus:ring-[#2e3105]/20 outline-none"
                    >
                      <option value="">Select a genre to add</option>
                      {genres
                        .filter(genre => !formData.dislikedGenres.includes(genre.value))
                        .map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666] transition-transform duration-300 group-hover:text-[#2e3105] group-focus-within:rotate-180">
                      <IoIosArrowDown size={16} />
                    </div>
                  </div>
                </div>
                {errors.dislikedGenres && <p className="text-red-500 text-xs mt-1">{errors.dislikedGenres}</p>}
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">Failed to save preferences. Please try again.</div>
          )}
        </form>
      </div>
    </div>
  );
}
