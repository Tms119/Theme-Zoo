import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';

export function SortableImage({ id, url, onRemove, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="sortable-image-container"
    >
      <div 
        {...attributes} 
        {...listeners} 
        style={{ position: 'absolute', top: 2, left: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'grab', zIndex: 5 }}
      >
        <GripVertical size={14} />
      </div>
      
      {index === 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(124, 58, 237, 0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', padding: '2px 0', zIndex: 5 }}>
          PRIMARY
        </div>
      )}

      <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      
      <button 
        type="button" 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }} 
        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.8)', color: '#fff', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer', zIndex: 5 }}
      >
        <X size={12} />
      </button>

      <style jsx>{`
        .sortable-image-container {
          position: relative;
          width: 90px;
          height: 68px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          background: #000;
          touch-action: none;
        }
        .sortable-image-container:hover {
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
