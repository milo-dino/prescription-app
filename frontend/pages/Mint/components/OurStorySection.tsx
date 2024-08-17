// Internal components
import { TriImageBanner } from "@/pages/Mint/components/TriImageBanner";

// Internal config
import { config } from "@/config";

interface OurStorySectionProps {}

export const OurStorySection: React.FC<OurStorySectionProps> = () => {
  if (!config.ourStory) return null;

  return (
    <section className="our-story-container px-4 flex flex-col md:flex-row gap-6 max-w-screen-xl mx-auto w-full items-center">
      <div className="basis-3/5">
        <p className="label-sm">{config.ourStory.subTitle}</p>
        <p className="heading-md">{config.ourStory.title}</p>
        <p className="body-sm pt-2">{config.ourStory.description}</p>
      </div>

      {config.ourStory.images && config.ourStory.images?.length > 0 && (
        <TriImageBanner images={config.ourStory.images} className="basis-2/5" />
      )}
    </section>
  );
};
