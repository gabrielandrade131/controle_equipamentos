import React, { useEffect, useState } from 'react';
import { FilterType } from '../types/filters';
import './FilterPanel.css';

interface FilterField {
  key: keyof FilterType;
  label: string;
  type: 'text' | 'date' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface FilterPanelProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  fields: FilterField[];
  titulo?: string;
  onDraftChange?: (filters: FilterType) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  fields,
  titulo = 'Filtros',
  onDraftChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterType>(filters);
  const [activeAutocomplete, setActiveAutocomplete] = useState<string | null>(null);

  useEffect(() => {
    setDraftFilters(filters);
    onDraftChange?.(filters);
  }, [filters, onDraftChange]);

  const handleInputChange = (key: keyof FilterType, value: any) => {
    setDraftFilters((prev) => {
      const next = {
        ...prev,
        [key]: value || undefined,
      };
      onDraftChange?.(next);
      return next;
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = fields.reduce((acc, field) => {
      acc[field.key] = undefined;
      return acc;
    }, {} as FilterType);
    setDraftFilters(clearedFilters);
    onDraftChange?.(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = fields.some((field) => filters[field.key]);

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="filter-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" fill="currentColor" />
            </svg>
          </span>
          {titulo}
          {hasActiveFilters && (
            <span className="filter-badge">{fields.filter((f) => filters[f.key]).length} ativo(s)</span>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-fields">
            {fields.map((field) => (
              <div key={String(field.key)} className="filter-field">
                <label>{field.label}</label>
                {field.type === 'text' && !field.options?.length && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={(draftFilters[field.key] as string) || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="filter-input"
                  />
                )}
                {field.type === 'text' && !!field.options?.length && (
                  <div className="filter-autocomplete">
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={(draftFilters[field.key] as string) || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      onFocus={() => setActiveAutocomplete(String(field.key))}
                      onBlur={() => {
                        window.setTimeout(() => setActiveAutocomplete(null), 120);
                      }}
                      className="filter-input"
                      autoComplete="off"
                    />
                    {activeAutocomplete === String(field.key) && (
                      <div className="filter-autocomplete-menu">
                        {field.options
                          .filter((opt) => {
                            const typedValue = String(draftFilters[field.key] || '')
                              .trim()
                              .toLowerCase();
                            if (!typedValue) return true;
                            return opt.label.toLowerCase().includes(typedValue);
                          })
                          .slice(0, 8)
                          .map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className="filter-autocomplete-option"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleInputChange(field.key, opt.value);
                                setActiveAutocomplete(null);
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        {field.options.filter((opt) => {
                          const typedValue = String(draftFilters[field.key] || '')
                            .trim()
                            .toLowerCase();
                          if (!typedValue) return true;
                          return opt.label.toLowerCase().includes(typedValue);
                        }).length === 0 && (
                          <span className="filter-autocomplete-empty">
                            Nenhuma opção encontrada
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={(draftFilters[field.key] as string) || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="filter-input"
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={(draftFilters[field.key] as string) || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="filter-input"
                  >
                    <option value="">Todos</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="filter-actions">
            <button
              className="btn-apply-filter"
              onClick={() => {
                onFiltersChange(draftFilters);
                setIsExpanded(false);
              }}
            >
              Aplicar
            </button>
            <button
              className="btn-clear-filter"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
