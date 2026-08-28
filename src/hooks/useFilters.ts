import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useFilters<T extends Record<string, any>>(
    initialFilters: T,
    key: string = 'filters'
) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [localFilters, setLocalFilters] = useState<T>(() => {
        const saved = searchParams.get(key);
        if (saved) {
            try {
                return { ...initialFilters, ...JSON.parse(saved) };
            } catch {
                return initialFilters;
            }
        }
        return initialFilters;
    });

    const updateFilters = useCallback((newFilters: Partial<T>) => {
        const updated = { ...localFilters, ...newFilters };
        setLocalFilters(updated);


        const params = new URLSearchParams(searchParams);
        params.set(key, JSON.stringify(updated));
        setSearchParams(params);
    }, [localFilters, searchParams, setSearchParams, key]);

    const resetFilters = useCallback(() => {
        setLocalFilters(initialFilters);
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        setSearchParams(params);
    }, [initialFilters, searchParams, setSearchParams, key]);

    const filteredData = useMemo(() => {
        return (data: any[]) => {
            return data.filter(item => {
                return Object.entries(localFilters).every(([filterKey, filterValue]) => {
                    if (!filterValue) return true;
                    if (Array.isArray(filterValue) && filterValue.length === 0) return true;

                    const itemValue = item[filterKey];
                    if (!itemValue) return false;

                    if (typeof filterValue === 'string') {
                        return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                    }
                    if (typeof filterValue === 'number') {
                        return itemValue === filterValue;
                    }
                    if (Array.isArray(filterValue)) {
                        return filterValue.every(val => itemValue.includes(val));
                    }
                    return true;
                });
            });
        };
    }, [localFilters]);

    return {
        filters: localFilters,
        updateFilters,
        resetFilters,
        filteredData,
        setFilters: updateFilters,
    };
}