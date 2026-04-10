import Sidebar from "@/components/mentor/Sidebar";

export default function MentorLayout({ children }) {
  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
