import { useState, useCallback } from "react";

interface UseFormModalOptions<T> {
  initialData: T;
  onSave?: (data: T, isEditing: boolean) => void;
}

export function useFormModal<T>({ initialData, onSave }: UseFormModalOptions<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<T>(initialData);
  const [originalData, setOriginalData] = useState<T>(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const openModal = useCallback((data?: T & { id?: number }) => {
    if (data) {
      setFormData(data);
      setOriginalData(data);
      setEditingId(data.id || null);
    } else {
      setFormData(initialData);
      setOriginalData(initialData);
      setEditingId(null);
    }
    setIsOpen(true);
  }, [initialData]);

  const closeModal = useCallback(() => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      setIsOpen(false);
      resetForm();
    }
  }, [hasChanges]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setOriginalData(initialData);
    setEditingId(null);
  }, [initialData]);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(formData, !!editingId);
    setIsOpen(false);
    resetForm();
  }, [formData, editingId, onSave, resetForm]);

  return {
    isOpen,
    setIsOpen,
    formData,
    setFormData,
    editingId,
    hasChanges,
    showExitConfirm,
    setShowExitConfirm,
    showDeleteConfirm,
    setShowDeleteConfirm,
    openModal,
    closeModal,
    resetForm,
    confirmExit,
    updateField,
    handleSave,
  };
}
