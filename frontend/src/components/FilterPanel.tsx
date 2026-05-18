import React, { useState } from 'react';
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
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  fields,
  titulo = 'Filtros',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleInputChange = (key: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearFilters = () => {
    const clearedFilters = fields.reduce((acc, field) => {
      acc[field.key] = undefined;
      return acc;
    }, {} as FilterType);
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
          {isExpanded ? '▼' : '▶'} {titulo}
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
                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={(filters[field.key] as string) || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="filter-input"
                  />
                )}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={(filters[field.key] as string) || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="filter-input"
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={(filters[field.key] as string) || ''}
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
                // Filtros já são aplicados em tempo real
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
