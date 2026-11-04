import type { Client, Media } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";

type ClientWithLogo = Client & { logo: Media | null; logoDark: Media | null };
export function ClientsSection({ clients }: { clients: ClientWithLogo[] }) {
  if (!clients.length) return null;
  return (
    <section className="container-editorial clients-section">
      <p className="section-label">Selected clients</p>
      <div className="client-list">
        {clients.map((client) => (
          <div key={client.id}>
            {client.logo ? (
              <div className="relative h-10 w-28">
                <MediaImage
                  media={client.logo}
                  alt={client.name}
                  sizes="112px"
                  className="object-contain"
                />
              </div>
            ) : (
              <span>{client.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
