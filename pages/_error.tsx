import { NextPage } from 'next';

const Error: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
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
    }}>
      <p style={{ fontSize: 48, margin: 0 }}>🏢</p>
      <h1 style={{ fontSize: 24, margin: '16px 0 8px' }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ color: '#94a3b8' }}>
        {statusCode === 404 ? 'This room doesn\'t exist.' : 'Something went wrong.'}
      </p>
      <a href="/" style={{ color: '#6366f1', marginTop: 16 }}>Return to Office</a>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
