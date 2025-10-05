export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-4">CondoSync</h1>
        <p className="text-xl text-gray-600">
          AI-Powered Communication Platform for Puerto Rico Condominiums
        </p>
        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <p className="text-green-800">
            ✅ Backend is ready! WhatsApp webhook at:{" "}
            <code className="bg-green-100 px-2 py-1 rounded">/api/webhooks/whatsapp</code>
          </p>
        </div>
      </div>
    </main>
  );
}
