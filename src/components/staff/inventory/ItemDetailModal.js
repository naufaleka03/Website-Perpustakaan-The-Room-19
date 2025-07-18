export default function ItemDetailModal({ isOpen, item, onClose }) {
  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Item Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="w-full">
            <img
              src={item?.item_image || "https://via.placeholder.com/400"}
              alt={item?.item_name}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Item Name</h4>
              <p className="text-sm text-gray-900">{item?.item_name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="text-sm text-gray-700">
                {item?.description || "No description available"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Price</h4>
              <p className="text-sm text-gray-900">
                {formatPrice(item?.price)}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Stock Quantity
              </h4>
              <p className="text-sm text-gray-900">
                {item?.stock_quantity || 0} units
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
