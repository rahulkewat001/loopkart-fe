import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api from '../../utils/api';

export default function GoogleAuthButton({ onAuthSuccess, onAuthError }) {
  const isConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  if (!isConfigured) {
    return (
      <button
        type="button"
        className="auth-google--placeholder"
        onClick={() => onAuthError?.('Google sign-in is not configured for this environment yet. Add VITE_GOOGLE_CLIENT_ID when you are ready to enable it.')}
      >
        Continue with Google
      </button>
    );
  }

  return (
    <div className="auth-google-slot">
      <GoogleLogin
        text="continue_with"
        theme="outline"
        size="large"
        shape="pill"
        width="100%"
        onSuccess={async ({ credential }) => {
          try {
            const profile = jwtDecode(credential);
            const { data } = await api.post('/auth/google', {
              email: profile.email,
              name: profile.name,
              googleId: profile.sub,
              avatar: profile.picture,
            });

            onAuthSuccess?.(data);
          } catch (error) {
            onAuthError?.(error.response?.data?.message || 'Google sign-in failed. Please try again.');
          }
        }}
        onError={() => onAuthError?.('Google sign-in failed. Please try again.')}
      />
    </div>
  );
}
