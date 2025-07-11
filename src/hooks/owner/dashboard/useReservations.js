"use client";

import { useState, useEffect } from 'react';

export function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/reservations');
        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const addReservation = async (reservationData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      const newReservation = await response.json();
      setReservations(prev => [...prev, newReservation]);
      return newReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateReservation = async (id, reservationData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      const updatedReservation = await response.json();
      setReservations(prev =>
        prev.map(reservation =>
          reservation.id === id ? updatedReservation : reservation
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteReservation = async (id) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      });
      setReservations(prev =>
        prev.filter(reservation => reservation.id !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    reservations,
    loading,
    error,
    addReservation,
    updateReservation,
    deleteReservation,
  };
} 