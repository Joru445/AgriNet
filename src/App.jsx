import { AuthProvider } from "./context/AuthContext";
import { UnreadMessagesProvider } from "./context/UnreadMessagesContext";
import { UnreadInquiriesProvider } from "./context/UnreadInquiriesContext";
import { UnreadReportsProvider } from "./context/UnreadReportsContext";
import AppRoutes from "./routes/AppRoutes";

import "remixicon/fonts/remixicon.css";

export default function App() {
  return (
    <AuthProvider>
      <UnreadMessagesProvider>
        <UnreadInquiriesProvider>
          <UnreadReportsProvider>
            <AppRoutes />
          </UnreadReportsProvider>
        </UnreadInquiriesProvider>
      </UnreadMessagesProvider>
    </AuthProvider>
  );
}
