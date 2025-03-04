'use client';
import Image from 'next/image';
import { AiFillStar } from 'react-icons/ai';
import { useState } from 'react';

const DetailPage = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const description = "This book is a memoir by Baek Sehee, a young South Korean woman who struggles with depression and anxiety. Through a series of conversations with her therapist, she shares her thoughts and feelings about low self-esteem, societal expectations, and how she tries to navigate life despite feeling inadequate. Its unique title reflects her emotional duality—the desire to disappear but also the longing for small joys, like enjoying tteokbokki (a popular Korean dish). This book offers an honest and relatable perspective on mental health, especially for those who have ever felt trapped in similar emotions.";

  return (
    <div className="flex-1 min-h-[calc(100vh-72px)] bg-white">
      {/* Breadcrumb
      <div className="w-full h-[49px] bg-[#f2f2f2] px-6 py-4 mb-8">
        <p className="text-black text-base font-bold font-['Manrope']">
          Dashboard / Book Loan / Catalog Book / Detail
        </p>
      </div> */}

      <div className="w-full h-full relative bg-white">
        <div className="w-full mx-auto px-12 py-8">
          <div className="flex gap-8">
            {/* Book Cover */}
            <div className="w-[180px] h-[250px] rounded-2xl overflow-hidden">
              <img
                src="https://placehold.co/180x250"
                alt="Book Cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <h1 className="text-black text-lg font-extrabold font-['Manrope'] mb-2">
                I Want To Die But I Want To Eat Tteokpokki
              </h1>
              <h2 className="text-black text-base font-medium font-['Manrope'] mb-4">
                Baek Se Hee
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4].map((star) => (
                  <AiFillStar key={star} className="text-[#ECB43C] text-lg" />
                ))}
                <AiFillStar className="text-gray-300 text-lg" />
                <span className="text-[#666666] text-xs ml-2">4.0</span>
              </div>

              <hr className="border-[#767676]/40 mb-6" />

              {/* Tabs */}
              <div className="border-b border-[#767676]/40">
                <div className="flex gap-8">
                  <button className="text-[#2e3105] text-sm font-medium pb-2 border-b-2 border-[#2e3105]">
                    Description
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="py-6 text-sm font-xs font-['Manrope'] leading-relaxed">
                <p className="text-justify font-normal">
                  {isExpanded ? description : description.slice(0, 200) + '...'}
                </p>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#ECB43C] text-xs font-bold mt-2 hover:underline"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              </div>

              {/* Book Details Section */}
              <div className="mb-6">
                <div className="border-b border-[#767676]/40">
                  <div className="flex gap-8">
                    <button className="text-[#2e3105] text-sm font-medium pb-2 border-b-2 border-[#2e3105]">
                      Detail
                    </button>
                  </div>
                </div>

                <div className="py-6">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-black font-medium">Author</span></div>
                    <div className="text-black">Baek Se Hee</div>
                    <div><span className="text-black font-medium">Publisher</span></div>
                    <div className="text-black">Haru</div>
                    <div><span className="text-black font-medium">Published Year</span></div>
                    <div className="text-black">2019</div>
                    <div><span className="text-black font-medium">Category</span></div>
                    <div className="text-black">xxxx</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Status Card */}
            <div className="w-[280px] h-fit bg-white rounded-2xl border border-[#cdcdcd] p-6">
              <h3 className="text-black text-base font-semibold text-center mb-4">Book Status</h3>
              <hr className="border-[#767676]/40 mb-4" />
              
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#c3efc3] rounded-full" />
                <span className="text-black text-xs font-normal">Available now</span>
                <span className="text-black text-xs font-normal ml-auto">
                  Total stock: <span className="text-[#ecb43c] font-normal">5 left</span>
                </span>
              </div>

              <div className="space-y-3 mt-6">
                <button className="w-full h-[35px] bg-[#2e3105] text-white text-xs rounded-2xl">
                  Borrow Book
                </button>
                <button className="w-full h-[35px] border border-[#2e3105] text-[#2e3105] text-xs rounded-2xl">
                  Cart
                </button>
              </div>

              <hr className="border-[#767676]/40 my-6" />
              
              <h3 className="text-black text-base font-semibold text-center mb-2">Return Policy</h3>
              <p className="text-black text-xs text-justify font-medium font-['Manrope'] leading-relaxed">
                Book returns are automatic 7 days after borrowing. You can extend the loan period by following certain terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;