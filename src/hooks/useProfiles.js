import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProfiles } from '../services/profileService';
import { isFirebaseConfigured } from '../config/firebase';
import { ITEMS_PER_PAGE } from '../constants/profileSchema';

export function useProfiles(isAuthenticated, searchTerm) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef(null);

  const loadProfiles = useCallback(async (append = false) => {
    if (!isFirebaseConfigured || !isAuthenticated) return;

    if (append) setIsLoadingMore(true);
    else setLoading(true);

    try {
      const { profiles: fetched, lastDoc, hasMore: more } = await fetchProfiles({
        lastDocSnapshot: append ? lastDocRef.current : null,
        searchTerm: append ? '' : searchTerm,
        pageSize: ITEMS_PER_PAGE,
      });

      lastDocRef.current = lastDoc;

      if (append) {
        setProfiles((prev) => [...prev, ...fetched]);
      } else {
        setProfiles(fetched);
        lastDocRef.current = lastDoc;
        setHasMore(more);
      }

      if (append) setHasMore(more);
      else if (searchTerm?.trim()) setHasMore(false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [isAuthenticated, searchTerm]);

  const refresh = useCallback(() => {
    lastDocRef.current = null;
    return loadProfiles(false);
  }, [loadProfiles]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => loadProfiles(false), searchTerm ? 500 : 0);
    return () => clearTimeout(timer);
  }, [searchTerm, isAuthenticated, loadProfiles]);

  useEffect(() => {
    if (hasMore && !isLoadingMore && !loading && !searchTerm && isAuthenticated) {
      const timer = setTimeout(() => loadProfiles(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [profiles, hasMore, isLoadingMore, loading, searchTerm, isAuthenticated, loadProfiles]);

  return { profiles, setProfiles, loading, isLoadingMore, hasMore, refresh };
}
