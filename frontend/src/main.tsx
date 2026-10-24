import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot, Root } from 'react-dom/client'; // 최신 렌더링 방식
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import App from './App';
import store, { persistor } from './redux/store/store';

const container: HTMLElement | null = document.getElementById('root');
const root: Root = createRoot(container as HTMLElement);

const queryClient = new QueryClient();

root.render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </PersistGate>
  </Provider>,
);
