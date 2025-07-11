"use client"

import { useState, useEffect, Fragment } from 'react';
import TermsPopup from './TermsPopup';
import { createClient } from '@/app/supabase/client';
import { useRouter } from 'next/navigation';
import { FaUpload, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { RiLoader4Line } from 'react-icons/ri';
import { BiSearch } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

// Simple Genre Modal Component without external dependencies
const GenreSelectModal = ({ isOpen, onClose, genres = [], selectedGenres = [], onChange, title = "Select Genres" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGenres, setFilteredGenres] = useState(genres);
  const [localSelected, setLocalSelected] = useState([...selectedGenres]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Reset filtered genres when genres prop changes
  useEffect(() => {
    setFilteredGenres(genres);
  }, [genres]);

  // Update local selection when selectedGenres prop changes
  useEffect(() => {
    setLocalSelected([...selectedGenres]);
  }, [selectedGenres]);

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
    setLocalSelected(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleClearAll = () => {
    setLocalSelected([]);
  };

  const handleApply = () => {
    onChange(localSelected);
    onClose();
  };
  
  // Stop propagation on modal content click to prevent closing
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
          </h3>
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
                    checked={localSelected.includes(genre)}
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
      </div>
    </div>
  );
};

export default function MembershipForm({ application }) {
  console.log('MembershipForm application prop:', application);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: application?.full_name || '',
    email: application?.email || '',
    phone: application?.phone_number || '',
    address: application?.address || '',
    favoriteGenre: application?.favorite_book_genre ? application.favorite_book_genre.split(',').map(g => g.trim()) : [],
    emergencyContactName: application?.emergency_contact_name || '',
    emergencyContactNumber: application?.emergency_contact_number || '',
  });
  console.log('MembershipForm initial formData:', formData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [filePreview, setFilePreview] = useState(application?.id_card_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verification-ids/${application.id_card_url}` : null);
  const [dragActive, setDragActive] = useState(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  
  const supabase = createClient();
  const router = useRouter();

  // List of book genres
  const allGenres = [
    "Arts & Architecture",
    "Business",
    "Children's Books",
    "Crime & Mystery",
    "Fantasy & Sci-Fi",
    "Historical Fiction",
    "Psychology & Self Help",
    "Romance",
    "Science",
    "Biography",
    "Comics & Graphic Novels",
    "Cooking",
    "Education",
    "Health & Fitness",
    "History",
    "Horror",
    "Literary Fiction",
    "Mathematics",
    "Medical",
    "Philosophy",
    "Poetry",
    "Politics",
    "Religion",
    "Sports",
    "Technology",
    "Travel",
  ];

  // Fetch user ID and user profile data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        
        setUserId(session.user.id);
        await fetchUserProfile(session.user.id);

        // Fetch genres from API
        const response = await fetch('/api/genres');
        const data = await response.json();
        if (data.success && data.data) {
          setGenres(data.data.map(genre => genre.genre_name));
        } else {
          setGenres(allGenres);
        }
      } catch (error) {
        console.error('Error fetching session or genres:', error);
        setGenres(allGenres);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSession();
  }, [router]);

  // Fetch user profile data for auto-filling the form
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('name, email, phone_number, address, city, state')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFormData({
          fullName: data.name || '',
          email: data.email || '',
          phone: data.phone_number || '',
          address: data.address ? `${data.address}, ${data.city || ''}, ${data.state || ''}` : '',
          favoriteGenre: [],
          emergencyContactName: '',
          emergencyContactNumber: '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (application) {
      setFormData({
        fullName: application.full_name || '',
        email: application.email || '',
        phone: application.phone_number || '',
        address: application.address || '',
        favoriteGenre: application.favorite_book_genre ? application.favorite_book_genre.split(',').map(g => g.trim()) : [],
        emergencyContactName: application.emergency_contact_name || '',
        emergencyContactNumber: application.emergency_contact_number || '',
      });
      setFilePreview(application.id_card_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verification-ids/${application.id_card_url}` : null);
    }
  }, [application]);

  const handleChange = (e) => {
    console.log('handleChange event:', e);
    if (!e || !e.target) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleGenreSelect = (selectedGenres) => {
    setFormData({
      ...formData,
      favoriteGenre: selectedGenres,
    });
    setIsGenreModalOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelection(selectedFile);
  };
  
  const handleFileSelection = (selectedFile) => {
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        setErrors({
          ...errors,
          idCard: 'Please upload an image file for your ID card',
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          idCard: 'File size must be less than 5MB',
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create file preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // Clear any file-related errors
      if (errors.idCard) {
        setErrors({
          ...errors,
          idCard: null,
        });
      }
    }
  };
  
  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }
    
    if (!formData.emergencyContactNumber.trim()) {
      newErrors.emergencyContactNumber = 'Emergency contact number is required';
    }
    
    if (!file && !application?.id_card_url) {
      newErrors.idCard = 'Please upload your ID card';
    }
    
    if (!isAgreed) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
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
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      // 1. Verify authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to apply for membership');
      }
      let filePath = application?.id_card_url || null;
      // 1a. Delete previous ID card image if exists and a new file is uploaded
      if (file) {
        if (application?.id_card_url) {
          await supabase.storage.from('verification-ids').remove([application.id_card_url]);
        }
        // 2. Upload ID card
        if (!file.name) throw new Error('File name is missing');
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('verification-ids')
          .upload(`${userId}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });
        if (uploadError) {
          throw new Error(`Failed to upload ID card: ${uploadError.message}`);
        }
        filePath = uploadData.path;
      }
      if (!filePath) {
        throw new Error('No ID card file available. Please upload your ID card.');
      }
      // 3. Submit membership application
      const applicationData = {
        user_id: userId,
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address,
        favorite_book_genre: formData.favoriteGenre.join(', '),
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_number: formData.emergencyContactNumber,
        id_card_url: filePath,
        status: 'request',
        created_at: application?.created_at || new Date().toISOString()
      };
      let response;
      if (application && application.id) {
        // Update existing application
        response = await fetch(`/api/memberships/${application.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData)
        });
      } else {
        // Create new application
        response = await fetch('/api/memberships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData)
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
      // 4. Update visitor status
      const { error: visitorError } = await supabase
        .from('visitors')
        .update({ 
          membership_applied: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      if (visitorError) {
        console.warn('Warning: Failed to update visitor status:', visitorError);
      }
      setSubmitStatus('success');
      setTimeout(() => {
        router.push('/user/dashboard/membership');
      }, 3000);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to submit application. Please try again.'
      });
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this after submitStatus is defined
  useEffect(() => {
    if (submitStatus) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitStatus]);

  // Loading skeleton
  if (isLoading) {
    return <MembershipFormSkeleton />;
  }

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      {/* Hero Section */}
      <div className="relative mb-8 mt-0">
        <div className="w-full h-[240px] bg-gradient-to-r from-[#2e3105] to-[#4d4d4d] object-cover" />
        <div className="absolute inset-0 flex items-center bg-gradient-to-l from-[#4d4d4d]/80 to-black/90 w-full mx-auto px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto w-full">
            <h1 className="text-[#fcfcfc] text-5xl font-medium leading-[48px] font-manrope mb-2">
              MEMBERSHIP
            </h1>
            <p className="text-[#fcfcfc]/80 max-w-xl font-light">
              Join our membership program to access exclusive borrowing privileges, attend special events, and be part of The Room 19 community.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-8 mb-12">
        {submitStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800">Application Submitted Successfully!</h3>
              <p className="text-green-700 text-sm">
                Your membership application has been received. Our staff will review it shortly, and you'll be notified once it's approved.
                You'll be redirected to the dashboard in a few seconds.
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800">Something went wrong!</h3>
              <p className="text-red-700 text-sm">
                There was an error submitting your application. Please try again later or contact support if the problem persists.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-[#111010] mb-6 font-manrope">Membership Application Form</h2>
          <p className="text-[#666666] mb-6 text-sm">
            Please fill out the form below to apply for membership at The Room 19 Library. Membership allows you to borrow books and access exclusive features.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="pb-4 border-b border-[#666666]/10">
              <h3 className="text-[#111010] font-medium mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`h-[40px] w-full rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm font-normal font-['Poppins'] text-[#666666]`}
                    placeholder="Enter your full name"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">As it appears on your ID card/document</p>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Email
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-[40px] w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm font-normal font-['Poppins'] text-[#666666]`}
                    placeholder="Enter your email address"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">We'll send membership status updates to this email</p>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`h-[40px] w-full rounded-lg border ${errors.phone ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm font-normal font-['Poppins'] text-[#666666]`}
                    placeholder="Enter your phone number"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">For verification purposes and important updates</p>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Address
                  </label>
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`h-[40px] w-full rounded-lg border ${errors.address ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm font-normal font-['Poppins'] text-[#666666]`}
                    placeholder="Enter your current address"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">Your current residential address</p>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="pb-4 border-b border-[#666666]/10">
              <h3 className="text-[#111010] font-medium mb-4">Reading Preferences</h3>
              
              <div>
                <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                  Favorite Book Genre
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    name="favoriteGenre"
                    value={formData.favoriteGenre.join(', ')}
                    onChange={handleChange}
                    className="h-[40px] w-full rounded-lg border border-[#666666]/30 px-4 text-sm font-normal font-['Poppins'] text-[#666666]"
                    placeholder="E.g., Science Fiction, Mystery, Biography"
                    onClick={() => setIsGenreModalOpen(true)}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setIsGenreModalOpen(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2e3105]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-[#666666]/80 mt-1">Helps us recommend books you might enjoy</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pb-4 border-b border-[#666666]/10">
              <h3 className="text-[#111010] font-medium mb-4">Emergency Contact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Emergency Contact Name
                  </label>
                  <input 
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className={`h-[40px] w-full rounded-lg border ${errors.emergencyContactName ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm font-normal font-['Poppins'] text-[#666666]`}
                    placeholder="Enter emergency contact name"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">A person we can contact in case of emergency</p>
                  {errors.emergencyContactName && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                    Emergency Contact Number
                  </label>
                  <input 
                    type="tel"
                    name="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={handleChange}
                    className={`h-[40px] w-full rounded-lg border ${errors.emergencyContactNumber ? 'border-red-500' : 'border-[#666666]/30'} px-4 text-sm font-normal font-['Poppins'] text-[#666666]`}
                    placeholder="Enter emergency contact number"
                  />
                  <p className="text-xs text-[#666666]/80 mt-1">Phone number of your emergency contact</p>
                  {errors.emergencyContactNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ID Upload */}
            <div className="pb-4 border-b border-[#666666]/10">
              <h3 className="text-[#111010] font-medium mb-4">Identification</h3>
              
              <div>
                <label className="block text-[#666666] text-sm font-medium font-['Poppins'] mb-1">
                  Upload ID Card
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-[#2e3105] bg-[#f3f4e0]' : errors.idCard ? 'border-red-300' : 'border-[#666666]/30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file"
                    id="idCardUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  {filePreview ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-48 h-32 mb-3">
                        <img 
                          src={filePreview} 
                          alt="ID preview" 
                          className="object-cover rounded-md w-48 h-32" 
                        />
                      </div>
                      <p className="text-sm text-[#666666]">
                        {file && file.name
                          ? file.name
                          : application?.id_card_url
                            ? application.id_card_url.split('/').pop() || 'Existing file'
                            : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFilePreview(null);
                        }}
                        className="mt-2 text-sm text-red-500 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FaUpload className="text-[#666666]/60 text-2xl mb-2" />
                      <p className="text-sm text-[#666666] mb-2">Drag and drop your ID card image here or</p>
                      <label 
                        htmlFor="idCardUpload" 
                        className="px-4 py-2 bg-[#2e3105] text-white rounded cursor-pointer text-sm hover:bg-[#404615] transition"
                      >
                        Choose file
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#666666]/80 mt-1">Upload a clear image of your government-issued ID (max 5MB)</p>
                <p className="text-xs text-[#666666]/80">Supported formats: JPG, PNG, or PDF</p>
                {errors.idCard && (
                  <p className="text-red-500 text-xs mt-1">{errors.idCard}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                id="termsAgreement"
                checked={isAgreed}
                onChange={() => setIsAgreed(!isAgreed)}
                className={`mt-1 rounded ${errors.terms ? 'border-red-500' : ''}`}
              />
              <div>
                <label htmlFor="termsAgreement" className="text-sm text-[#666666] cursor-pointer">
                  I have{' '}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsOpen(true);
                    }}
                    className="font-medium text-[#2e3105] hover:underline"
                  >
                    read
                  </button>
                  {' '}and <span className="font-medium">agree</span> to the terms and conditions.
                </label>
                {errors.terms && (
                  <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
                )}
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <FaInfoCircle className="text-blue-500 text-lg flex-shrink-0 mt-1" />
              <div className="text-sm text-blue-800">
                <p className="mb-1 font-medium">Important Notice:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Your application will be reviewed by our staff within 1-2 business days.</li>
                  <li>You will receive a notification email once your membership is approved.</li>
                  <li>Membership allows you to borrow books for a duration of 7 days.</li>
                  <li>Please provide accurate information for verification purposes.</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`h-[45px] w-full bg-[#111010] rounded-3xl text-white text-base font-semibold font-manrope flex items-center justify-center gap-2 transition ${
                isSubmitting ? 'opacity-75' : 'hover:bg-[#333] transition-colors'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="animate-spin text-xl" />
                  PROCESSING...
                </>
              ) : (
                'SUBMIT APPLICATION'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modals */}
      <TermsPopup 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />

      <GenreSelectModal
        isOpen={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
        genres={genres.length > 0 ? genres : allGenres}
        selectedGenres={formData.favoriteGenre}
        onChange={handleGenreSelect}
        title="Select Your Favorite Genre"
      />
    </div>
  );
}

MembershipForm.defaultProps = {
  application: undefined,
};

function MembershipFormSkeleton() {
  const skeletonClass = "bg-[#f0f0f0] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#f8f8f8] before:to-transparent";

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      {/* Hero Section Skeleton */}
      <div className="relative mb-8 mt-0">
        <div className="w-full h-[240px] bg-gradient-to-r from-[#e9eacd] to-[#f0f0f0]" />
        <div className="absolute inset-0 flex items-center w-full mx-auto px-4 lg:px-8">
          <div className="max-w-[1200px] mx-auto w-full">
            <div className={`h-12 ${skeletonClass} rounded w-1/3 mb-2`}></div>
            <div className={`h-4 ${skeletonClass} rounded w-1/2`}></div>
          </div>
        </div>
      </div>

      {/* Form Section Skeleton */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className={`h-8 ${skeletonClass} rounded w-1/3 mb-6`}></div>
          <div className={`h-4 ${skeletonClass} rounded w-full mb-8`}></div>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="pb-4 border-b border-[#f0f0f0]">
              <div className={`h-5 ${skeletonClass} rounded w-1/4 mb-4`}></div>
              
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className={`h-4 ${skeletonClass} rounded w-1/5 mb-2`}></div>
                    <div className={`h-10 ${skeletonClass} rounded-lg w-full mb-1`}></div>
                    <div className={`h-3 ${skeletonClass} rounded w-2/3`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="pb-4 border-b border-[#f0f0f0]">
              <div className={`h-5 ${skeletonClass} rounded w-1/4 mb-4`}></div>
              
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i}>
                    <div className={`h-4 ${skeletonClass} rounded w-1/5 mb-2`}></div>
                    <div className={`h-10 ${skeletonClass} rounded-lg w-full mb-1`}></div>
                    <div className={`h-3 ${skeletonClass} rounded w-2/3`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* ID Card Upload Section */}
            <div className="pb-4 border-b border-[#f0f0f0]">
              <div className={`h-5 ${skeletonClass} rounded w-1/4 mb-4`}></div>
              <div className={`h-[200px] ${skeletonClass} rounded-lg w-full mb-2`}></div>
              <div className={`h-3 ${skeletonClass} rounded w-2/3 mb-1`}></div>
              <div className={`h-3 ${skeletonClass} rounded w-1/2`}></div>
            </div>

            {/* Terms and Notice Section */}
            <div className="space-y-4">
              <div className={`h-6 ${skeletonClass} rounded w-3/4`}></div>
              <div className={`h-[120px] ${skeletonClass} rounded-lg w-full`}></div>
            </div>

            {/* Submit Button Skeleton */}
            <div className={`h-[45px] ${skeletonClass} rounded-3xl w-full mt-8`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
  