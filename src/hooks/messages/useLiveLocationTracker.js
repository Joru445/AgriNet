import { useEffect, useRef, useState, useCallback } from "react";
import { updateLiveLocation, stopLiveLocation as apiStopLiveLocation } from "../../services/message.service";

const STORAGE_KEY_PREFIX = "agri_active_live_location_";
const LEGACY_STORAGE_KEY = "agri_active_live_location";
const MIN_UPDATE_INTERVAL_MS = 12000; // 12 seconds minimum between updates
const MIN_DISTANCE_DELTA_METERS = 15; // 15 meters

function getStoredSession(userId) {
  if (!userId) return null;
  try {
    // Clear any legacy un-scoped key to avoid cross-user session leaks
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);

    const userKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const stored = sessionStorage.getItem(userKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (
      parsed?.userId === userId &&
      parsed?.messageId &&
      parsed?.liveUntil &&
      Date.now() < parsed.liveUntil
    ) {
      return parsed;
    }
    // Expired or invalid -> cleanup
    sessionStorage.removeItem(userKey);
    return null;
  } catch {
    return null;
  }
}

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function useLiveLocationTracker(userId = null) {
  const [activeSession, setActiveSession] = useState(() => getStoredSession(userId));

  const watchIdRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const lastPositionRef = useRef(null);
  const timerRef = useRef(null);

  const clearCurrentWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Sync session if userId changes (e.g. logging in as receiver)
  useEffect(() => {
    if (!userId) {
      clearCurrentWatch();
      setActiveSession(null);
      return;
    }
    const session = getStoredSession(userId);
    setActiveSession(session);
    if (!session) {
      clearCurrentWatch();
    }
  }, [userId, clearCurrentWatch]);

  const stopTracking = useCallback(async (messageIdToStop) => {
    // Only stop if the active session belongs to this user
    if (activeSession?.userId && userId && activeSession.userId !== userId) {
      return;
    }
    const targetId = messageIdToStop || activeSession?.messageId;
    const convId = activeSession?.conversationId;
    clearCurrentWatch();
    if (userId) {
      try {
        sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${userId}`);
      } catch {}
    }
    try {
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
    setActiveSession(null);
    lastPositionRef.current = null;
    lastUpdateTimeRef.current = 0;

    if (targetId && targetId !== "undefined" && targetId !== "null") {
      try {
        await apiStopLiveLocation(targetId, convId);
      } catch (err) {
        console.error("[useLiveLocationTracker] Error stopping live location:", err);
      }
    }
  }, [activeSession?.messageId, activeSession?.conversationId, activeSession?.userId, userId, clearCurrentWatch]);

  const startTracking = useCallback((messageId, liveUntil, conversationId = null) => {
    if (!messageId || !liveUntil || !userId) return;

    const session = {
      messageId,
      liveUntil,
      conversationId,
      userId,
      startedAt: Date.now(),
    };

    try {
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(session));
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.warn("[useLiveLocationTracker] Unable to save to sessionStorage:", e);
    }

    setActiveSession(session);
  }, [userId]);

  // Effect to manage GPS watchPosition and countdown when activeSession is set
  useEffect(() => {
    if (!activeSession?.messageId || !activeSession?.liveUntil) {
      clearCurrentWatch();
      return;
    }

    const { messageId, liveUntil } = activeSession;

    // Check if session has expired
    if (Date.now() >= liveUntil) {
      stopTracking(messageId);
      return;
    }

    if (!navigator.geolocation) {
      console.warn("[useLiveLocationTracker] Geolocation not supported");
      return;
    }

    clearCurrentWatch();

    // Check expiration every 5 seconds
    timerRef.current = setInterval(() => {
      if (Date.now() >= liveUntil) {
        stopTracking(messageId);
      }
    }, 5000);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, heading } = pos.coords;
        const now = Date.now();

        if (now >= liveUntil) {
          stopTracking(messageId);
          return;
        }

        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        const lastPos = lastPositionRef.current;
        const distanceMoved = lastPos
          ? getDistanceInMeters(lastPos.lat, lastPos.lng, latitude, longitude)
          : Infinity;

        // Throttle check: must satisfy minimum interval OR moved significant distance
        const shouldUpdate =
          timeSinceLastUpdate >= MIN_UPDATE_INTERVAL_MS ||
          distanceMoved >= MIN_DISTANCE_DELTA_METERS;

        if (shouldUpdate) {
          lastUpdateTimeRef.current = now;
          lastPositionRef.current = { lat: latitude, lng: longitude };

          updateLiveLocation(messageId, {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy ? Math.round(accuracy) : null,
            heading: heading || null,
          });
        }
      },
      (err) => {
        console.warn("[useLiveLocationTracker] watchPosition error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    return () => {
      clearCurrentWatch();
    };
  }, [activeSession, clearCurrentWatch, stopTracking]);

  return {
    activeSession,
    isTracking: Boolean(activeSession),
    startTracking,
    stopTracking,
  };
}
