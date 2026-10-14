'use client';

import { useState, useEffect, useCallback } from 'react';
import { Property, Reservation } from '@/types';
import {
  getStoredProperties,
  getActiveProperties,
  getStoredReservations,
  getStoredSettings,
  saveProperty,
  deleteProperty,
  togglePropertyStatus,
  resetPropertiesToDefault,
  addReservation,
  updateReservationStatus,
  saveSettings,
  DEFAULT_SETTINGS,
} from './propertyStore';

export function usePropertyStore() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeProperties, setActiveProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<typeof DEFAULT_SETTINGS>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshData = useCallback(() => {
    const all = getStoredProperties();
    setProperties(all);
    setActiveProperties(all.filter((p) => !p.status || p.status === 'Active'));
    setReservations(getStoredReservations());
    setSettings(getStoredSettings());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshData();

    const handlePropsUpdate = () => refreshData();
    const handleResUpdate = () => refreshData();
    const handleSettingsUpdate = () => refreshData();

    window.addEventListener('csp:properties-updated', handlePropsUpdate);
    window.addEventListener('csp:reservations-updated', handleResUpdate);
    window.addEventListener('csp:settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('csp:properties-updated', handlePropsUpdate);
      window.removeEventListener('csp:reservations-updated', handleResUpdate);
      window.removeEventListener('csp:settings-updated', handleSettingsUpdate);
    };
  }, [refreshData]);

  const handleSaveProperty = (prop: Partial<Property> & { id?: number }) => {
    const saved = saveProperty(prop);
    refreshData();
    return saved;
  };

  const handleDeleteProperty = (id: number) => {
    const success = deleteProperty(id);
    if (success) refreshData();
    return success;
  };

  const handleToggleStatus = (id: number) => {
    const updated = togglePropertyStatus(id);
    if (updated) refreshData();
    return updated;
  };

  const handleResetToDefault = () => {
    const reset = resetPropertiesToDefault();
    refreshData();
    return reset;
  };

  const handleAddReservation = (res: Reservation) => {
    addReservation(res);
    refreshData();
  };

  const handleUpdateReservationStatus = (id: string, status: Reservation['status']) => {
    updateReservationStatus(id, status);
    refreshData();
  };

  const handleSaveSettings = (newSettings: Partial<typeof DEFAULT_SETTINGS>) => {
    const updated = saveSettings(newSettings);
    refreshData();
    return updated;
  };

  return {
    properties,
    activeProperties,
    reservations,
    settings,
    isLoaded,
    saveProperty: handleSaveProperty,
    deleteProperty: handleDeleteProperty,
    togglePropertyStatus: handleToggleStatus,
    resetToDefault: handleResetToDefault,
    addReservation: handleAddReservation,
    updateReservationStatus: handleUpdateReservationStatus,
    saveSettings: handleSaveSettings,
  };
}
