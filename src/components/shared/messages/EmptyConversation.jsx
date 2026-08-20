export default function EmptyConversation() {
  return (
    <section className="hidden flex-1 md:flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#2D6A4F]/10 flex items-center justify-center mb-5">
          <i className="ri-chat-3-line text-4xl text-[#2D6A4F]" />
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          Select a conversation
        </h2>

        <p className="text-gray-500 mt-2">
          Choose a conversation to start messaging.
        </p>
      </div>
    </section>
  );
}
