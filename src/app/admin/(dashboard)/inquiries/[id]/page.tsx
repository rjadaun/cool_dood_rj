import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/badge";
import { InquiryDetailActions } from "@/components/admin/inquiries/inquiry-detail-actions";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-stone-100 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-40 shrink-0 text-xs uppercase tracking-wide text-stone-400">{label}</dt>
      <dd className="text-sm text-ink">{children || <span className="text-stone-300">-</span>}</dd>
    </div>
  );
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) notFound();

  return (
    <div>
      <PageHeader
        title={inquiry.name}
        description={`Received ${formatDate(inquiry.createdAt, { dateStyle: "long", timeStyle: "short" })}`}
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Inquiries", href: "/admin/inquiries" },
          { label: inquiry.name },
        ]}
        actions={<StatusBadge status={inquiry.status} />}
      />

      <div className="mb-6">
        <InquiryDetailActions id={inquiry.id} status={inquiry.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminCard title="Message">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{inquiry.message}</p>
          </AdminCard>

          <AdminCard title="Project details">
            <dl>
              <DetailRow label="Project type">{inquiry.projectType}</DetailRow>
              <DetailRow label="Budget">{inquiry.budget}</DetailRow>
              <DetailRow label="Preferred date">
                {inquiry.preferredDate ? formatDate(inquiry.preferredDate, { dateStyle: "long" }) : ""}
              </DetailRow>
              <DetailRow label="Location">{inquiry.location}</DetailRow>
              <DetailRow label="Company">{inquiry.company}</DetailRow>
              <DetailRow label="Website">
                {inquiry.website ? (
                  <a href={inquiry.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent-deep hover:underline">
                    {inquiry.website} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </DetailRow>
            </dl>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Contact">
            <dl>
              <DetailRow label="Email">
                <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-1.5 text-accent-deep hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {inquiry.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">
                {inquiry.phone ? (
                  <a href={`tel:${inquiry.phone}`} className="inline-flex items-center gap-1.5 text-accent-deep hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {inquiry.phone}
                  </a>
                ) : null}
              </DetailRow>
            </dl>
          </AdminCard>

          <AdminCard title="Meta">
            <dl>
              <DetailRow label="Referral">{inquiry.referral}</DetailRow>
              <DetailRow label="IP address">{inquiry.ipAddress}</DetailRow>
              <DetailRow label="Received">{formatDate(inquiry.createdAt, { dateStyle: "medium", timeStyle: "short" })}</DetailRow>
              <DetailRow label="Last updated">{formatDate(inquiry.updatedAt, { dateStyle: "medium", timeStyle: "short" })}</DetailRow>
            </dl>
          </AdminCard>

          <Link href="/admin/inquiries" className="inline-block text-sm text-stone-500 hover:text-ink">
            ← Back to all inquiries
          </Link>
        </div>
      </div>
    </div>
  );
}
