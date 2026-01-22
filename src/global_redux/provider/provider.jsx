import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '../store/store';
// import store from '../store';
// import { setupApiInterceptors } from '../api';
// import { logout } from '../features/auth/authSlice';

export default function Providers({ children }) {
  // Setup API interceptors after store is created
//   useEffect(() => {
//     setupApiInterceptors(store, logout);
//   }, []);

  return <Provider store={store}>{children}</Provider>;
}