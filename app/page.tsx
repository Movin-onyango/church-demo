import HomepageSections from "@/components/HomepageSections";
import {
  getActiveAnnouncements,
  getFeaturedSermon,
  getHomepageSections,
  getServiceTimes,
  getSettings,
  getSmallGroups,
  getVisitInfo,
} from "@/lib/data";

export const revalidate = 10;

export default async function HomePage() {
  const [settings, services, featured, announcements, visit, groups, sections] =
    await Promise.all([
      getSettings(),
      getServiceTimes(),
      getFeaturedSermon(),
      getActiveAnnouncements(),
      getVisitInfo(),
      getSmallGroups(),
      getHomepageSections(),
    ]);

  return (
    <HomepageSections
      sections={sections}
      settings={settings}
      services={services}
      featured={featured}
      announcements={announcements}
      visit={visit}
      groups={groups}
    />
  );
}
