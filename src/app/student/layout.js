import StudentSidebar from "@/components/student/Sidebar";

export default function StudentLayout({ children }) {
  return (
    <div className="flex bg-black min-h-screen">
      <StudentSidebar />
      <main className="flex-1 p-8 md:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
