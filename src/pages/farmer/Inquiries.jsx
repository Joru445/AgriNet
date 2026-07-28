export default function Inquiries() {
  return (
    <main class="flex-1 p-4 md:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 class="text-xl font-bold text-[#1B4332]">Inquiry Records</h2>
          <p class="text-sm text-gray-500">
            Manage and track your product inquiries
          </p>
        </div>
      </div>
      <div class="flex gap-1 mb-6 border-b border-gray-200">
        <button class="px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 border-[#2D6A4F] text-[#2D6A4F]">
          All
        </button>
        <button class="px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 border-transparent text-gray-500 hover:text-gray-700">
          Pending
        </button>
        <button class="px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 border-transparent text-gray-500 hover:text-gray-700">
          Ongoing
        </button>
        <button class="px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-b-2 border-transparent text-gray-500 hover:text-gray-700">
          Resolved
        </button>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Product
                </th>
                <th class="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Consumer
                </th>
                <th class="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Date
                </th>
                <th class="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Status
                </th>
                <th class="text-left text-xs font-semibold text-gray-500 px-5 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      alt="Fresh Organic Tomatoes"
                      class="w-10 h-10 rounded-lg object-cover object-top"
                      src="https://readdy.ai/api/search-image?query=fresh%20red%20organic%20tomatoes%20on%20a%20clean%20white%20background%2C%20vibrant%20colors%2C%20professional%20food%20photography&amp;width=100&amp;height=100&amp;seq=inq1&amp;orientation=squarish"
                    />
                    <span class="text-sm font-medium text-gray-800">
                      Fresh Organic Tomatoes
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600">Ana Lim</td>
                <td class="px-5 py-3 text-sm text-gray-500">2026-04-23</td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    Pending
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex gap-2">
                    <button class="text-xs text-[#2D6A4F] font-semibold hover:underline cursor-pointer">
                      View
                    </button>
                    <a
                      class="text-xs text-gray-500 hover:text-[#2D6A4F] cursor-pointer"
                      href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/messaging"
                      data-discover="true"
                    >
                      <i class="ri-message-3-line"></i>
                    </a>
                  </div>
                </td>
              </tr>
              <tr class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      alt="Pechay (Bok Choy)"
                      class="w-10 h-10 rounded-lg object-cover object-top"
                      src="https://readdy.ai/api/search-image?query=fresh%20green%20pechay%20bok%20choy%20vegetables%20on%20white%20background%2C%20vibrant%20green%20leaves%2C%20professional%20food%20photography&amp;width=100&amp;height=100&amp;seq=inq2&amp;orientation=squarish"
                    />
                    <span class="text-sm font-medium text-gray-800">
                      Pechay (Bok Choy)
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600">Carlo Bautista</td>
                <td class="px-5 py-3 text-sm text-gray-500">2026-04-22</td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                    Ongoing
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex gap-2">
                    <button class="text-xs text-[#2D6A4F] font-semibold hover:underline cursor-pointer">
                      View
                    </button>
                    <a
                      class="text-xs text-gray-500 hover:text-[#2D6A4F] cursor-pointer"
                      href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/messaging"
                      data-discover="true"
                    >
                      <i class="ri-message-3-line"></i>
                    </a>
                  </div>
                </td>
              </tr>
              <tr class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      alt="Fresh Organic Tomatoes"
                      class="w-10 h-10 rounded-lg object-cover object-top"
                      src="https://readdy.ai/api/search-image?query=fresh%20red%20organic%20tomatoes%20on%20a%20clean%20white%20background%2C%20vibrant%20colors%2C%20professional%20food%20photography&amp;width=100&amp;height=100&amp;seq=inq3&amp;orientation=squarish"
                    />
                    <span class="text-sm font-medium text-gray-800">
                      Fresh Organic Tomatoes
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600">Liza Ramos</td>
                <td class="px-5 py-3 text-sm text-gray-500">2026-04-20</td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    Resolved
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex gap-2">
                    <button class="text-xs text-[#2D6A4F] font-semibold hover:underline cursor-pointer">
                      View
                    </button>
                    <a
                      class="text-xs text-gray-500 hover:text-[#2D6A4F] cursor-pointer"
                      href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/messaging"
                      data-discover="true"
                    >
                      <i class="ri-message-3-line"></i>
                    </a>
                  </div>
                </td>
              </tr>
              <tr class="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      alt="Pechay (Bok Choy)"
                      class="w-10 h-10 rounded-lg object-cover object-top"
                      src="https://readdy.ai/api/search-image?query=fresh%20green%20pechay%20bok%20choy%20vegetables%20on%20white%20background%2C%20vibrant%20green%20leaves%2C%20professional%20food%20photography&amp;width=100&amp;height=100&amp;seq=inq4&amp;orientation=squarish"
                    />
                    <span class="text-sm font-medium text-gray-800">
                      Pechay (Bok Choy)
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600">Ben Torres</td>
                <td class="px-5 py-3 text-sm text-gray-500">2026-04-19</td>
                <td class="px-5 py-3">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    Pending
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex gap-2">
                    <button class="text-xs text-[#2D6A4F] font-semibold hover:underline cursor-pointer">
                      View
                    </button>
                    <a
                      class="text-xs text-gray-500 hover:text-[#2D6A4F] cursor-pointer"
                      href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/messaging"
                      data-discover="true"
                    >
                      <i class="ri-message-3-line"></i>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
