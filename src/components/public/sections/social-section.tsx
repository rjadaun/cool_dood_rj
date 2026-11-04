import type { SocialLink } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SocialIcon } from "@/components/public/social-icon";
import { SectionHeader } from "./section-header";

export function SocialSection({ socials }: { socials: SocialLink[] }) {
  const featured = socials.filter(
    (s) => s.platform === "INSTAGRAM" || s.platform === "YOUTUBE",
  );
  if (featured.length === 0) return null;

  return (
    <section className="border-t border-line section-space">
      <div className="container-editorial">
        <SectionHeader label="Follow along" title="The studio, in motion." />
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((social, i) => (
            <Reveal key={social.id} delay={i * 0.1}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between border-b border-line py-5 transition-colors hover:border-ink"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-11 w-11 items-center justify-center bg-ink text-paper">
                    <SocialIcon
                      platform={social.platform}
                      className="h-6 w-6"
                    />
                  </div>
                  <div>
                    <div className="font-serif text-2xl text-ink">
                      {social.platform === "INSTAGRAM"
                        ? "Instagram"
                        : "YouTube"}
                    </div>
                    <div className="text-sm text-stone-500">
                      {social.username}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-6 w-6 text-stone-300 transition-all group-hover:translate-x-1 group-hover:text-ink" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
