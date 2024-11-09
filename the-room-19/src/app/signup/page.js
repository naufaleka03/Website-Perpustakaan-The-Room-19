import { FaEyeSlash } from "react-icons/fa";

export default function SignUpPage() {
  return (
    <div className="flex h-[982px] w-[1512px] bg-white">
      {/* Left side image */}
      <div className="w-[785px] h-full">
        <img 
          className="w-full h-full object-cover" 
          src="https://via.placeholder.com/785x982" 
          alt="Signup banner"
        />
      </div>

      {/* Right side form */}
      <div className="flex-1 py-[72px] px-[122px] bg-white">
        <div className="max-w-[473px]">
          {/* Header */}
          <div className="mt-[30px]">
            <h1 className="text-[32px] font-medium text-[#333333]">Sign up</h1>
            <p className="text-base text-[#666666]/80">
              Sign up to access The Room 19
            </p>
          </div>

          {/* Form */}
          <form className="mt-[27px] space-y-4">
            {/* Form fields */}
            {[
              { label: 'Full Name', type: 'text' },
              { label: 'Username', type: 'text' },
              { label: 'Email address', type: 'email' },
              { label: 'Phone Number', type: 'tel' },
            ].map((field) => (
              <div key={field.label} className="form-group">
                <label className="text-base text-[#666666]">
                  {field.label}
                </label>
                <input 
                  type={field.type}
                  className="w-full h-14 rounded-xl border border-[#666666]/30 mt-1"
                />
              </div>
            ))}

            {/* Password fields */}
            {[
              { label: 'Password', showHint: true },
              { label: 'Confirm Password', showHint: false },
            ].map((field) => (
              <div key={field.label} className="form-group">
                <div className="flex justify-between">
                  <label className="text-base text-[#666666]">
                    {field.label}
                  </label>
                  <button type="button" className="text-lg text-[#666666]/80 flex items-center gap-1">
                    <FaEyeSlash className="mr-1 scale-x-[-1]" />
                    Hide
                  </button>
                </div>
                <input 
                  type="password"
                  className="w-full h-14 rounded-xl border border-[#666666]/30 mt-1"
                />
                {field.showHint && (
                  <p className="text-sm text-[#666666] mt-1">
                    Use 8 or more characters with a mix of letters, numbers & symbols
                  </p>
                )}
              </div>
            ))}

            {/* Submit button */}
            <button 
              type="submit"
              className="w-[250px] h-16 bg-[#C4C4C4] rounded-[32px] text-white text-[22px] font-medium mt-6"
            >
              Sign up
            </button>

            {/* Login link */}
            <p className="text-base mt-4">
              <span className="text-[#333333]">Already have an account? </span>
              <a href="/login" className="text-[#111111] underline">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}