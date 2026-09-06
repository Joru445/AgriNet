import { AuthProvider } from "./context/AuthContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ConversationsProvider } from "./context/ConversationsContext";
import { InquiriesProvider } from "./context/InquiriesContext";
import { UnreadMessagesProvider } from "./context/UnreadMessagesContext";
import { UnreadInquiriesProvider } from "./context/UnreadInquiriesContext";
import { UnreadReportsProvider } from "./context/UnreadReportsContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import AppRoutes from "./routes/AppRoutes";

import "remixicon/fonts/remixicon.css";

export default function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <ConversationsProvider>
          <InquiriesProvider>
            <NotificationsProvider>
              <UnreadMessagesProvider>
                <UnreadInquiriesProvider>
                  <UnreadReportsProvider>
                    <AppRoutes />
                  </UnreadReportsProvider>
                </UnreadInquiriesProvider>
              </UnreadMessagesProvider>
            </NotificationsProvider>
          </InquiriesProvider>
        </ConversationsProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}
