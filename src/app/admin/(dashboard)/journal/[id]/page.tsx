import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { JournalForm } from "@/components/admin/journal/journal-form";

export default async function EditJournalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { cover: true } });
  if (!post) notFound();

  return (
    <div>
      <PageHeader
        title="Edit Post"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Journal", href: "/admin/journal" }, { label: "Edit" }]}
      />
      <JournalForm post={post} />
    </div>
  );
}
