import AdminTable from "@/components/admin/AdminTable";
import { ADMIN_TABLES } from "@/lib/admin-fields";

export default function AboutAdminPage() {
  return <AdminTable config={ADMIN_TABLES.about} />;
}
