export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'system-ui',
      textAlign: 'center',
      padding: 20,
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
      <h1 style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 24,
        marginBottom: 16,
      }}>
        404
      </h1>
      <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 24 }}>
        This room doesn&apos;t exist in the office.
      </p>
      <a
        href="/"
        style={{
          background: '#6366f1',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: 8,
          textDecoration: 'none',
          fontSize: 14,
        }}
      >
        Return to Office
      </a>
    </div>
  );
}
