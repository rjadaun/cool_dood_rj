import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <PageHeader
        title="New Category"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Categories", href: "/admin/categories" }, { label: "New" }]}
      />
      <CategoryForm />
    </div>
  );
}
