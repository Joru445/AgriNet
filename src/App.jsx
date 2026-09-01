import { AuthProvider } from "./context/AuthContext";
import { UnreadMessagesProvider } from "./context/UnreadMessagesContext";
import { UnreadInquiriesProvider } from "./context/UnreadInquiriesContext";
import { UnreadReportsProvider } from "./context/UnreadReportsContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import AppRoutes from "./routes/AppRoutes";
import OfflineIndicator from "./components/common/OfflineIndicator";
import PWAUpdatePrompt from "./components/common/PWAUpdatePrompt";

import "remixicon/fonts/remixicon.css";

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <UnreadMessagesProvider>
          <UnreadInquiriesProvider>
            <UnreadReportsProvider>
              <AppRoutes />
              <OfflineIndicator />
              <PWAUpdatePrompt />
            </UnreadReportsProvider>
          </UnreadInquiriesProvider>
        </UnreadMessagesProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}
