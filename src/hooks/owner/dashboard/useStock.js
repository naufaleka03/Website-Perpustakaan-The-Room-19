"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const LOW_STOCK_THRESHOLD = 50;

export function useStock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchStock = useCallback(async (force = false) => {
    // Check if we need to fetch new data
    if (!force && lastFetch && Date.now() - lastFetch < CACHE_TIME) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/stock');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStock(data);
      setLastFetch(Date.now());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const updateStock = useCallback(async (itemId, newQuantity) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/stock/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedItem = await response.json();
      setStock(prev =>
        prev.map(item =>
          item.id === itemId ? updatedItem : item
        )
      );
      return updatedItem;
    } catch (err) {
      setError(err.message);
      console.error('Error updating stock:', err);
      throw err;
    }
  }, []);

  const addStockItem = useCallback(async (itemData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newItem = await response.json();
      setStock(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err.message);
      console.error('Error adding stock item:', err);
      throw err;
    }
  }, []);

  const removeStockItem = useCallback(async (itemId) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/stock/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStock(prev =>
        prev.filter(item => item.id !== itemId)
      );
    } catch (err) {
      setError(err.message);
      console.error('Error removing stock item:', err);
      throw err;
    }
  }, []);

  // Memoize low stock items calculation
  const lowStockItems = useMemo(() => {
    return stock.filter(item => {
      const quantity = typeof item.quantity === 'string' 
        ? parseInt(item.quantity) 
        : item.quantity;
      return quantity < LOW_STOCK_THRESHOLD;
    });
  }, [stock]);

  return {
    stock,
    loading,
    error,
    updateStock,
    addStockItem,
    removeStockItem,
    lowStockItems,
    refreshStock: () => fetchStock(true),
  };
} 