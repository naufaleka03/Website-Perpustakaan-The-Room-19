export default function CloseConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  currentStatus,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative">
        <h2 className="text-xl font-semibold text-[#111010] mb-4">
          {currentStatus === "closed" ? "Open Event" : "Close Event"}
        </h2>
        <p className="text-sm text-[#666666] mb-6">
          Are you sure you want to{" "}
          {currentStatus === "closed" ? "open" : "close"} the event{" "}
          <span className="font-semibold">"{eventName}"</span>?
          {currentStatus !== "closed" && (
            <span className="block mt-2 text-yellow-700">
              Note: Users won't be able to register for this event once it's
              closed.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-['Poppins'] text-[#666666] border border-[#666666]/30 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white ${
              currentStatus === "closed"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {currentStatus === "closed"
              ? "Yes, Open Event"
              : "Yes, Close Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
