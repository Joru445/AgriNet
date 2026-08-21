import { AuthProvider } from "./context/AuthContext";
import { UnreadMessagesProvider } from "./context/UnreadMessagesContext";
import { UnreadInquiriesProvider } from "./context/UnreadInquiriesContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <UnreadMessagesProvider>
        <UnreadInquiriesProvider>
          <AppRoutes />
        </UnreadInquiriesProvider>
      </UnreadMessagesProvider>
    </AuthProvider>
  );
}
