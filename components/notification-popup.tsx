export function Notification_popup() {
  return (
    <>
      <div className="absolute right-0 top-12 w-80 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl z-50">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h3 className="font-semibold text-white">Notifications</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-[#9CA3AF]">No new notifications</p>
        </div>
      </div>
    </>
  );
}
