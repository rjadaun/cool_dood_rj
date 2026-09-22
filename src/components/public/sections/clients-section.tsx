import type { Client, Media } from "@prisma/client";
import { MediaImage } from "@/components/shared/media-image";
import { Reveal } from "@/components/shared/reveal";
import { Marquee } from "@/components/shared/marquee";

type ClientWithLogo = Client & { logo: Media | null; logoDark: Media | null };

export function ClientsSection({ clients }: { clients: ClientWithLogo[] }) {
  if (clients.length === 0) return null;
  return (
    <section className="overflow-hidden py-20">
      <Reveal>
        <p className="label mb-12 text-center text-accent-deep">Trusted by</p>
      </Reveal>
      <Marquee speed={38}>
        {clients.map((client) => (
          <div
            key={client.id}
            className="flex shrink-0 items-center opacity-50 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
          >
            {client.logo ? (
              <div className="relative h-9 w-32">
                <MediaImage media={client.logo} alt={client.name} fill sizes="128px" className="!object-contain" />
              </div>
            ) : (
              <span className="whitespace-nowrap font-serif text-2xl tracking-wide text-ink">{client.name}</span>
            )}
          </div>
        ))}
      </Marquee>
    </section>
  );
}
