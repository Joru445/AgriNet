import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  apiGetInquiryById,
  apiRequestCompletion,
  apiSubmitProof,
  apiConfirmProof,
  apiRejectProof,
} from "../services/inquiry.service";

import { uploadTransactionProof } from "../services/cloudinary.service";

export default function useTransactionProof() {
  const { inquiryId } = useParams();
  const { profile } = useAuth();

  const [inquiry, setInquiry] = useState(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const loadInquiry = useCallback(async () => {
    if (!inquiryId) {
      setError("Invalid transaction.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiGetInquiryById(inquiryId);

      if (!data) {
        throw new Error("Transaction not found.");
      }

      setInquiry(data);
    } catch (error) {
      console.error("Failed to load transaction:", error);

      setError(error.message || "Failed to load transaction.");
    } finally {
      setLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    loadInquiry();
  }, [loadInquiry]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const status = inquiry?.status === "resolved" ? "completed" : inquiry?.status;

  const isConsumer =
    profile?.role === "consumer" && inquiry?.consumerId === profile?.uid;

  const isFarmer =
    profile?.role === "farmer" && inquiry?.farmerId === profile?.uid;

  const isAdmin = profile?.role === "admin";

  function selectFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The image must be smaller than 10 MB.");
      return;
    }

    setError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);
  }

  function removeFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
  }

  async function requestCompletion() {
    if (!isConsumer) {
      throw new Error("Only the consumer can request transaction completion.");
    }

    try {
      setProcessing(true);
      setError("");

      await apiRequestCompletion(inquiryId);

      await loadInquiry();
    } catch (error) {
      console.error("Failed to request transaction completion:", error);

      setError(error.message || "Failed to continue the transaction.");

      throw error;
    } finally {
      setProcessing(false);
    }
  }

  async function uploadProof() {
    if (!isConsumer) {
      throw new Error("Only the consumer can submit proof.");
    }

    if (!selectedFile) {
      const error = new Error("Please select a proof image.");

      setError(error.message);
      throw error;
    }

    try {
      setProcessing(true);
      setError("");

      const proof = await uploadTransactionProof(selectedFile);

      await apiSubmitProof(inquiryId, proof);

      removeFile();

      await loadInquiry();
    } catch (error) {
      console.error("Failed to submit transaction proof:", error);

      setError(error.message || "Failed to submit transaction proof.");

      throw error;
    } finally {
      setProcessing(false);
    }
  }

  async function confirmProof() {
    if (!isFarmer) {
      throw new Error("Only the farmer can confirm the transaction.");
    }

    try {
      setProcessing(true);
      setError("");

      await apiConfirmProof(inquiryId);

      await loadInquiry();
    } catch (error) {
      console.error("Failed to confirm transaction proof:", error);

      setError(error.message || "Failed to confirm transaction.");

      throw error;
    } finally {
      setProcessing(false);
    }
  }

  async function rejectProof() {
    if (!isFarmer) {
      throw new Error("Only the farmer can reject the transaction proof.");
    }

    try {
      setProcessing(true);
      setError("");

      await apiRejectProof(inquiryId);

      await loadInquiry();
    } catch (error) {
      console.error("Failed to reject transaction proof:", error);

      setError(error.message || "Failed to reject transaction proof.");

      throw error;
    } finally {
      setProcessing(false);
    }
  }

  return {
    inquiry,
    inquiryId,
    profile,

    status,

    loading,
    processing,
    error,

    isConsumer,
    isFarmer,
    isAdmin,

    selectedFile,
    previewUrl,

    selectFile,
    removeFile,

    requestCompletion,
    uploadProof,
    confirmProof,
    rejectProof,

    reload: loadInquiry,
  };
}
