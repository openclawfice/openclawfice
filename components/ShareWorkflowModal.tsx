'use client';

import React, { useState } from 'react';

interface ShareWorkflowModalProps {
  isVisible: boolean;
  onClose: () => void;
  config: any;
  onShare?: (url: string) => void;
}

export function ShareWorkflowModal({ isVisible, onClose, config, onShare }: ShareWorkflowModalProps) {
  const [name, setName] = useState('My Workflow');
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isVisible) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          config,
        }),
      });

      if (!res.ok) throw new Error('Failed to create template');

      const data = await res.json();
      setShareUrl(data.url || '');
      if (onShare) onShare(data.url);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      alert('Failed to generate share link. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    const importCommand = shareUrl ? 
      `npx openclawfice import ${shareUrl}` : 
      JSON.stringify(config, null, 2);
    
    try {
      await navigator.clipboard.writeText(importCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTweet = () => {
    const text = encodeURIComponent(
      `Just built "${name}" with OpenClawfice 🤖\n\n${description}\n\nTry it:`
    );
    const url = encodeURIComponent(shareUrl || 'https://openclawfice.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '2px solid #6366f1',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Header */}
        <div style={{
          fontSize: '16px',
          color: '#ffd700',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 0 10px #ffd700',
        }}>
          📤 Share Your Workflow
        </div>

        {/* Name input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Workflow Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Twitter Bot"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px',
              padding: '10px',
              color: '#fff',
              fontSize: '12px',
              fontFamily: '"Courier New", monospace',
            }}
          />
        </div>

        {/* Description input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Auto-reply system with 3 agents..."
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px',
              padding: '10px',
              color: '#fff',
              fontSize: '11px',
              fontFamily: '"Courier New", monospace',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Preview toggle */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '6px',
            color: '#6366f1',
            padding: '8px 12px',
            fontSize: '9px',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {showPreview ? 'Hide' : 'Preview'} Config
        </button>

        {/* Config preview */}
        {showPreview && (
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
            maxHeight: '200px',
            overflow: 'auto',
          }}>
            <pre style={{
              fontSize: '8px',
              color: '#00ff00',
              fontFamily: '"Courier New", monospace',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        )}

        {/* Share URL display */}
        {shareUrl && (
          <div style={{
            background: 'rgba(0,255,0,0.1)',
            border: '1px solid rgba(0,255,0,0.3)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '8px', color: '#888', marginBottom: '6px' }}>
              Import command:
            </div>
            <div style={{
              fontSize: '9px',
              color: '#00ff00',
              fontFamily: '"Courier New", monospace',
              wordBreak: 'break-all',
            }}>
              npx openclawfice import {shareUrl}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
        }}>
          {!shareUrl ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !name.trim()}
              style={{
                flex: 1,
                background: isGenerating ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                padding: '12px',
                fontSize: '10px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textShadow: '0 0 8px rgba(255,255,255,0.5)',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Share Link'}
            </button>
          ) : (
            <>
              <button
                onClick={handleCopy}
                style={{
                  flex: 1,
                  background: copied ? 'rgba(0,255,0,0.2)' : 'rgba(255,215,0,0.2)',
                  border: `1px solid ${copied ? 'rgba(0,255,0,0.4)' : 'rgba(255,215,0,0.4)'}`,
                  borderRadius: '8px',
                  color: copied ? '#00ff00' : '#ffd700',
                  padding: '12px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={handleTweet}
                style={{
                  flex: 1,
                  background: 'rgba(29,161,242,0.2)',
                  border: '1px solid rgba(29,161,242,0.4)',
                  borderRadius: '8px',
                  color: '#1da1f2',
                  padding: '12px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                𝕏 Tweet
              </button>
            </>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255,0,0,0.2)',
            border: '1px solid rgba(255,0,0,0.4)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ff4444',
            fontSize: '16px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,0,0,0.4)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,0,0,0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
