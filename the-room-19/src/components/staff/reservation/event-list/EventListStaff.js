"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaPencil, FaTrash, FaLock, FaLockOpen } from "react-icons/fa6";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import CloseConfirmationModal from "./CloseConfirmationModal";

export default function EventListStaff() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [closeModal, setCloseModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
    currentStatus: "open",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const handleDelete = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents(events.filter((event) => event.id !== eventId));
      setDeleteModal({ isOpen: false, eventId: null, eventName: "" });
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
    }
  };

  const handleEdit = (e, eventId) => {
    e.stopPropagation();
    router.push(
      `/staff/dashboard/reservation/event-list/update-event?id=${eventId}`
    );
  };

  const handleStatusToggle = async (eventId) => {
    try {
      setIsUpdatingStatus(true);
      const event = events.find((e) => e.id === eventId);
      const newStatus = event.status === "open" ? "closed" : "open";

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event status");
      }

      setEvents(
        events.map((event) =>
          event.id === eventId ? { ...event, status: newStatus } : event
        )
      );
      setCloseModal({
        isOpen: false,
        eventId: null,
        eventName: "",
        currentStatus: "open",
      });
    } catch (err) {
      console.error("Error updating event status:", err);
      setError("Failed to update event status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const truncateDescription = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  return (
    <div className="w-full min-h-screen mx-auto bg-white px-0 pb-20">
      <div className="flex justify-center flex-col gap-4 max-w-[1200px] mx-auto px-16 lg:px-20 overflow-x-auto pt-10">
        <div className="flex justify-start items-center mb-6 mx-11">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#2e3105] text-white rounded-lg text-sm hover:bg-[#2e3105] transition-colors"
            onClick={() =>
              router.push(
                "/staff/dashboard/reservation/event-list/create-event"
              )
            }
          >
            <FaPlus size={14} />
            Create Event
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-[1200px] mx-5 px-6 mb-1 min-h-[400px]">
          {isLoading ? (
            <p>Loading events...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : events.length === 0 ? (
            <div className="col-span-3 flex justify-center items-center h-[400px]">
              <p className="text-[#666666] text-sm font-['Poppins']">
                No events available
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] max-w-[350px] h-[300px] flex flex-col relative"
                onClick={(e) => handleEdit(e, event.id)}
              >
                <img
                  src={event.event_poster || "/images/default-event.jpg"}
                  alt={event.event_name}
                  className="w-full h-[150px] object-cover"
                />
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <h3 className="text-[#111010] text-sm font-medium font-['Poppins'] line-clamp-1">
                    {event.event_name}
                  </h3>
                  <p className="text-[#666666] text-xs font-['Poppins'] line-clamp-2 flex-1">
                    {truncateDescription(event.description, 80)}
                  </p>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[#666666] text-xs font-['Poppins']">
                      {formatDate(event.event_date)}
                    </p>
                    <p className="text-[#111010] text-xs font-medium font-['Poppins']">
                      {formatPrice(event.ticket_fee)}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-2 flex gap-2">
                  <button
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors"
                    onClick={(e) => handleEdit(e, event.id)}
                  >
                    <FaPencil size={14} className="text-[#666666]" />
                  </button>
                  <button
                    className={`p-1.5 bg-white rounded-full shadow-md transition-colors ${
                      event.status === "closed"
                        ? "hover:bg-green-700"
                        : "hover:bg-yellow-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCloseModal({
                        isOpen: true,
                        eventId: event.id,
                        eventName: event.event_name,
                        currentStatus: event.status || "open",
                      });
                    }}
                    disabled={isUpdatingStatus}
                  >
                    {event.status === "closed" ? (
                      <FaLockOpen
                        size={14}
                        className="text-green-600 hover:text-white"
                      />
                    ) : (
                      <FaLock
                        size={14}
                        className="text-yellow-600 hover:text-white"
                      />
                    )}
                  </button>
                  <button
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({
                        isOpen: true,
                        eventId: event.id,
                        eventName: event.event_name,
                      });
                    }}
                  >
                    <FaTrash
                      size={14}
                      className="text-red-600 hover:text-white"
                    />
                  </button>
                </div>
                {event.status === "closed" && (
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Closed
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, eventId: null, eventName: "" })
        }
        onConfirm={() => handleDelete(deleteModal.eventId)}
        eventName={deleteModal.eventName}
      />

      <CloseConfirmationModal
        isOpen={closeModal.isOpen}
        onClose={() =>
          setCloseModal({
            isOpen: false,
            eventId: null,
            eventName: "",
            currentStatus: "open",
          })
        }
        onConfirm={() => handleStatusToggle(closeModal.eventId)}
        eventName={closeModal.eventName}
        currentStatus={closeModal.currentStatus}
      />
    </div>
  );
}
