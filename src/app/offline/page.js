export const metadata = {
  title: 'Offline | RentifyPro',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
        <p className="text-sm opacity-80">
          RentifyPro could not reach the network. Reconnect to continue browsing live data.
        </p>
      </div>
    </main>
  );
}