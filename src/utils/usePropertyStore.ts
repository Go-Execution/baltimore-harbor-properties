'use client';

import { useState, useEffect, useCallback } from 'react';
import { Property, Reservation } from '@/types';
import {
  getStoredProperties,
  getStoredReservations,
  getStoredSettings,
  saveProperty,
  deleteProperty,
  togglePropertyStatus,
  resetPropertiesToDefault,
  addReservation,
  updateReservationStatus,
  saveSettings,
  replaceStoredProperties,
  replaceStoredSettings,
  DEFAULT_SETTINGS,
} from './propertyStore';
import {
  dbDeleteProperty,
  dbFetchProperties,
  dbFetchSettings,
  dbResetProperties,
  dbSaveProperty,
  dbSaveSettings,
} from '@/lib/supabase/propertyDatabase';

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

    void Promise.allSettled([dbFetchProperties(), dbFetchSettings()]).then(([propertyResult, settingsResult]) => {
      if (propertyResult.status === 'fulfilled' && propertyResult.value?.length) {
        replaceStoredProperties(propertyResult.value, false);
        setProperties(propertyResult.value);
        setActiveProperties(propertyResult.value.filter((property) => !property.status || property.status === 'Active'));
      } else if (propertyResult.status === 'rejected') {
        console.warn('Supabase property sync unavailable; using local cache.', propertyResult.reason);
      }

      if (settingsResult.status === 'fulfilled' && settingsResult.value) {
        replaceStoredSettings(settingsResult.value, false);
        setSettings(settingsResult.value);
      } else if (settingsResult.status === 'rejected') {
        console.warn('Supabase settings sync unavailable; using local cache.', settingsResult.reason);
      }
    });
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

  const handleSaveProperty = async (prop: Partial<Property> & { id?: number }) => {
    const previous = getStoredProperties();
    const saved = saveProperty(prop);
    try {
      const cloudSaved = await dbSaveProperty(saved);
      saveProperty(cloudSaved);
      refreshData();
      return cloudSaved;
    } catch (error) {
      replaceStoredProperties(previous);
      throw error;
    }
  };

  const handleDeleteProperty = async (id: number) => {
    await dbDeleteProperty(id);
    const success = deleteProperty(id);
    if (success) refreshData();
    return success;
  };

  const handleToggleStatus = async (id: number) => {
    const previous = getStoredProperties();
    const updated = togglePropertyStatus(id);
    if (updated) {
      try {
        await dbSaveProperty(updated);
        refreshData();
      } catch (error) {
        replaceStoredProperties(previous);
        throw error;
      }
    }
    return updated;
  };

  const handleResetToDefault = async () => {
    const reset = await dbResetProperties();
    resetPropertiesToDefault();
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

  const handleSaveSettings = async (newSettings: Partial<typeof DEFAULT_SETTINGS>) => {
    const previous = getStoredSettings();
    const updated = saveSettings(newSettings);
    try {
      await dbSaveSettings(updated);
      refreshData();
      return updated;
    } catch (error) {
      replaceStoredSettings(previous);
      throw error;
    }
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
