import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";

export default function useApi(endpoint, id = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = id 
        ? await api.getById(endpoint, id)
        : await api.getAll(endpoint);
      
      setData(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [endpoint, id]);

  // Create new item
  const createData = async (newData) => {
    try {
      setLoading(true);
      const response = await api.create(endpoint, newData);
      await fetchData(); // Refresh data
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to create data");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update item
  const updateData = async (itemId, updatedData) => {
    try {
      setLoading(true);
      const response = await api.update(endpoint, itemId, updatedData);
      
      // Update local state immediately for better UX
      if (!id) { // Only update if we're fetching all items
        setData(prevData => 
          prevData.map(item => 
            item.id === itemId ? { ...item, ...updatedData } : item
          )
        );
      } else {
        setData(prevData => ({ ...prevData, ...updatedData }));
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to update data");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const deleteData = async (itemId) => {
    try {
      setLoading(true);
      await api.remove(endpoint, itemId);
      
      // Update local state
      if (!id) {
        setData(prevData => prevData.filter(item => item.id !== itemId));
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to delete data");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Patch item (partial update)
  const patchData = async (itemId, patchData) => {
    try {
      setLoading(true);
      const response = await api.patch(endpoint, itemId, patchData);
      
      // Update local state
      if (!id) {
        setData(prevData => 
          prevData.map(item => 
            item.id === itemId ? { ...item, ...patchData } : item
          )
        );
      } else {
        setData(prevData => ({ ...prevData, ...patchData }));
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to patch data");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset state
  const reset = () => {
    setData([]);
    setError(null);
    setLoading(true);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    createData,
    updateData,
    patchData,
    deleteData,
    reset
  };
}