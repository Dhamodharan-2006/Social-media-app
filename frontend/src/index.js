import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      theme="colored"
      toastStyle={{ borderRadius: 12, fontSize: 14 }}
    />
  </Provider>
);