'use client';

import { useState } from 'react';
import { QUEST_TEMPLATES, type QuestTemplate, cloneTemplate } from '../app/quest-templates/data';

interface TemplateGalleryProps {
  onSelectTemplate: (quest: any) => void;
  onClose: () => void;
}

export function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (template: QuestTemplate) => {
    const clonedQuest = cloneTemplate(template.template);
    onSelectTemplate(clonedQuest);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        background: '#0f172a',
        border: '2px solid #1e293b',
        borderRadius: 16,
        maxWidth: 800,
        width: '90%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          background: '#1e293b',
          padding: '16px 20px',
          borderBottom: '2px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '14px 14px 0 0',
        }}>
          <div>
            <div style={{
              fontSize: 16,
              fontFamily: '"Press Start 2P", monospace',
              color: '#e2e8f0',
              marginBottom: 8,
            }}>
              ✨ Quest Templates
            </div>
            <div style={{
              fontSize: 11,
              color: '#94a3b8',
            }}>
              Jumpstart your office with common workflows
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: '1px solid #475569',
              color: '#cbd5e1',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>

        {/* Template Grid */}
        <div style={{
          padding: 24,
          overflowY: 'auto',
          flex: 1,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {QUEST_TEMPLATES.map(template => (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => handleSelectTemplate(template)}
                style={{
                  background: hoveredTemplate === template.id ? '#1e293b' : '#0f172a',
                  border: `2px solid ${hoveredTemplate === template.id ? '#6366f1' : '#1e293b'}`,
                  borderRadius: 12,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: 32,
                  marginBottom: 12,
                  textAlign: 'center',
                }}>
                  {template.icon}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#e2e8f0',
                  marginBottom: 6,
                  textAlign: 'center',
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {template.name}
                </div>
                <div style={{
                  fontSize: 9,
                  color: '#64748b',
                  lineHeight: 1.4,
                  textAlign: 'center',
                  marginBottom: 12,
                  minHeight: 40,
                }}>
                  {template.description}
                </div>
                <button
                  style={{
                    width: '100%',
                    background: '#6366f1',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 600,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4f46e5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#6366f1';
                  }}
                >
                  Use This
                </button>

                {/* Hover Preview */}
                {hoveredTemplate === template.id && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: 8,
                    background: '#1e293b',
                    border: '2px solid #6366f1',
                    borderRadius: 8,
                    padding: 12,
                    width: 280,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                    zIndex: 10,
                    animation: 'fadeSlideIn 0.2s ease-out',
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#e2e8f0',
                      marginBottom: 6,
                    }}>
                      {template.template.icon} {template.template.title}
                    </div>
                    <div style={{
                      fontSize: 9,
                      color: '#94a3b8',
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}>
                      {template.template.description}
                    </div>
                    <div style={{
                      fontSize: 8,
                      color: '#6366f1',
                      fontWeight: 600,
                    }}>
                      Click to customize →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
