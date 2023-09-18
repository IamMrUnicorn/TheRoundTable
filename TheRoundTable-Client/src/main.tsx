import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import SignInPage from './Pages/SignInPage';

const clerkPubKey = import.meta.env.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkPubKey}>
        <SignedIn>
          <App />
        </SignedIn>
        <SignedOut>
          <SignInPage/>
        </SignedOut>
      </ClerkProvider>
    </React.StrictMode>
  );
}
