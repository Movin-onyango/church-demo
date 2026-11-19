import AdminTable from '@/components/admin/AdminTable';
import { ADMIN_TABLES } from '@/lib/admin-fields';

export default function Page() {
  return <AdminTable config={ADMIN_TABLES.nav} />;
}