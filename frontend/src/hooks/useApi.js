import { useCallback, useEffect, useState } from "react";
import {
  adminDeleteUser,
  adminGetOrders,
  adminGetUsers,
  adminPatchOrder,
  adminPatchUser,
  createProduct,
  deleteProduct,
  getProducts,
  patchProduct,
} from "../api/apiService";

const resourceMap = {
  products: {
    list: getProducts,
    create: createProduct,
    patch: patchProduct,
    remove: deleteProduct,
  },
  users: {
    list: adminGetUsers,
    patch: adminPatchUser,
    remove: adminDeleteUser,
  },
  orders: {
    list: adminGetOrders,
    patch: adminPatchOrder,
  },
};

const normalizeError = (error) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.error === "string") return data.error;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, value]) => {
        const message = Array.isArray(value) ? value.join(", ") : String(value);
        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return error?.message || "Request failed";
};

export default function useApi(resource, options = {}) {
  const config = resourceMap[resource];
  const { listParams } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (paramsOverride) => {
    if (!config?.list) {
      setError(`Unsupported resource: ${resource}`);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await config.list(paramsOverride ?? listParams);
      setData(response.data);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }, [config, listParams, resource]);

  const createData = useCallback(
    async (payload) => {
      if (!config?.create) {
        throw new Error(`Create not supported for ${resource}`);
      }

      try {
        setLoading(true);
        setError(null);
        const response = await config.create(payload);
        await fetchData();
        return response.data;
      } catch (err) {
        const message = normalizeError(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [config, fetchData, resource],
  );

  const patchData = useCallback(
    async (id, payload) => {
      if (!config?.patch) {
        throw new Error(`Patch not supported for ${resource}`);
      }

      try {
        setLoading(true);
        setError(null);
        const response = await config.patch(id, payload);
        await fetchData();
        return response.data;
      } catch (err) {
        const message = normalizeError(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [config, fetchData, resource],
  );

  const deleteData = useCallback(
    async (id) => {
      if (!config?.remove) {
        throw new Error(`Delete not supported for ${resource}`);
      }

      try {
        setLoading(true);
        setError(null);
        await config.remove(id);
        await fetchData();
      } catch (err) {
        const message = normalizeError(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [config, fetchData, resource],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    createData,
    patchData,
    deleteData,
  };
}
