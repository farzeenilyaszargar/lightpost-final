import { NewsItem } from "@/types/news";

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fallback-world-1",
    title: "Coastal city completes flood resilience pilot",
    description:
      "A new drainage and wetland program reduced peak flooding in a coastal district, with the next phase expanding to nearby neighborhoods.",
    summary:
      "Engineers wrapped a six month pilot that combined restored wetlands, upgraded pumps, and smart gates to reduce flood peaks. Early results show **lower surge levels** and faster water clearance after heavy rain. Officials say the next phase will extend the system to adjacent blocks and include public warning signage. The program also set aside funds for maintenance so the drains do not clog during monsoon season. Meaning: resilience means the ability to recover quickly after disruption.",
    published_at: hoursAgo(6),
    image_url: "/images/ex3.avif",
    bias_score: 0,
    bias_reason: "Straightforward status update without opinionated framing.",
    topic: "world",
    rating: 62,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "coastal-city-completes-flood-resilience-pilot",
    tags: ["infrastructure", "climate"],
  },
  {
    id: "fallback-world-2",
    title: "Regional rail link resumes after coordinated repairs",
    description:
      "A key rail corridor reopened after multi agency repairs, restoring cross border passenger service ahead of the spring travel rush.",
    summary:
      "After weeks of joint maintenance, trains are running again on the regional corridor. Crews replaced damaged track segments and upgraded signal controls, allowing **higher safety margins** and more consistent schedules. Transport officials said a reduced timetable will run for a short transition period while inspection data is reviewed. The reopening is expected to reduce road congestion and support tourism flows. Meaning: a corridor is a major route that connects regions.",
    published_at: hoursAgo(10),
    image_url: "/images/ex1.png",
    bias_score: 0,
    bias_reason: "Neutral coverage focused on logistics and timelines.",
    topic: "world",
    rating: 58,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "regional-rail-link-resumes-after-coordinated-repairs",
    tags: ["transport", "infrastructure"],
  },
  {
    id: "fallback-business-1",
    title: "Local producers form cooperative to stabilize prices",
    description:
      "Small suppliers launched a shared logistics network to reduce shipping costs and keep prices steady during seasonal swings.",
    summary:
      "A new cooperative is pooling storage, delivery routes, and packaging contracts to lower costs for small producers. The group expects **more stable pricing** for staple goods and plans to publish weekly inventory metrics so buyers can plan ahead. Members say the first goal is to lock in fuel and cold chain rates before peak season. Meaning: a cooperative is a jointly owned business that shares profits and decisions.",
    published_at: hoursAgo(3),
    image_url: "/images/ex2.jpeg",
    bias_score: 0,
    bias_reason: "Descriptive business update without commentary.",
    topic: "business",
    rating: 55,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "local-producers-form-cooperative-to-stabilize-prices",
    tags: ["supply", "markets"],
  },
  {
    id: "fallback-business-2",
    title: "Retailers adopt shared inventory network",
    description:
      "Mid size retailers are piloting a shared stock pool to cut delays and reduce waste across multiple storefronts.",
    summary:
      "A new inventory sharing platform lets participating stores borrow stock from nearby locations instead of placing rush orders. The rollout aims to cut **out of stock gaps** and reduce over ordering for seasonal items. Early tests show fewer delivery miles and a modest drop in returns. The group will publish results after the first quarter and decide whether to expand to new regions. Meaning: inventory is the total goods a business holds for sale.",
    published_at: hoursAgo(8),
    image_url: "/images/ex1.png",
    bias_score: 0,
    bias_reason: "Neutral summary of a business pilot program.",
    topic: "business",
    rating: 52,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "retailers-adopt-shared-inventory-network",
    tags: ["retail", "logistics"],
  },
  {
    id: "fallback-science-1",
    title: "Researchers map urban heat pockets using open sensors",
    description:
      "A city wide sensor grid revealed block level temperature spikes, guiding new shade and cooling plans for summer.",
    summary:
      "Scientists and community groups deployed low cost sensors across the city to map hot spots. The data shows **neighborhood scale heat peaks** that do not appear in regional forecasts. Planners will prioritize shade trees, reflective surfaces, and cooling stations in the hottest zones. A public dashboard will update daily to support local decisions. Meaning: a sensor grid is a network of devices that measure conditions in many places at once.",
    published_at: hoursAgo(5),
    image_url: "/images/robo.png",
    bias_score: 0,
    bias_reason: "Factual reporting about a research initiative.",
    topic: "science",
    rating: 60,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "researchers-map-urban-heat-pockets-using-open-sensors",
    tags: ["climate", "research"],
  },
  {
    id: "fallback-science-2",
    title: "Battery recycling line cuts processing time",
    description:
      "A new recycling workflow reduced processing time for used batteries, improving recovery rates for key metals.",
    summary:
      "Engineers introduced a redesigned sorting and shredding sequence that shortens processing steps for mixed battery types. Early tests show **higher metal recovery** and lower energy use per unit. The line will run at pilot scale for several months before full expansion. If results hold, the approach could lower the cost of recycled materials for manufacturers. Meaning: recovery rate is the percentage of material successfully reclaimed.",
    published_at: hoursAgo(12),
    image_url: "/images/ex3.avif",
    bias_score: 0,
    bias_reason: "Technical summary with neutral language.",
    topic: "science",
    rating: 57,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "battery-recycling-line-cuts-processing-time",
    tags: ["energy", "recycling"],
  },
  {
    id: "fallback-sports-1",
    title: "Underdog club seals late comeback to reach final",
    description:
      "A last minute goal completed a turnaround victory, sending the lower seed into the championship match.",
    summary:
      "The match flipped in the closing minutes after a tactical shift pushed the underdogs forward. A quick **two goal surge** secured the comeback and the crowd roared as the final whistle blew. The coach credited fitness work and bench depth for the late push. The team now heads into the final with momentum and a tight turnaround schedule. Meaning: an underdog is the team expected to lose.",
    published_at: hoursAgo(2),
    image_url: "/images/ex2.jpeg",
    bias_score: 1,
    bias_reason: "Mildly upbeat tone typical of sports recaps.",
    topic: "sports",
    rating: 64,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "underdog-club-seals-late-comeback-to-reach-final",
    tags: ["football", "tournament"],
  },
  {
    id: "fallback-sports-2",
    title: "Marathon adds cooling stations after heat study",
    description:
      "Organizers announced extra cooling and hydration points based on new runner safety research ahead of race day.",
    summary:
      "A recent study of runner physiology prompted the marathon team to add more cooling tents and misting points. The route will now include **shorter gaps between aid** stations, and volunteers will receive updated heat protocols. Officials say the changes are designed to reduce dropouts during hot spells without altering the course profile. Meaning: a protocol is a formal set of steps to follow.",
    published_at: hoursAgo(9),
    image_url: "/images/ex1.png",
    bias_score: 0,
    bias_reason: "Informational update about event logistics.",
    topic: "sports",
    rating: 53,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "marathon-adds-cooling-stations-after-heat-study",
    tags: ["health", "events"],
  },
  {
    id: "fallback-politics-1",
    title: "City council passes open data budget tracker",
    description:
      "A new portal will publish quarterly spending and procurement data for public review and analysis.",
    summary:
      "Council members approved a plan to publish spending data in a searchable portal. The tool will provide **line item transparency** for contracts, grants, and maintenance budgets. Advocates say the change makes it easier for residents to see where funds go and to flag inconsistencies. The first public release is scheduled for the next quarter with monthly updates to follow. Meaning: transparency means information is openly available and easy to understand.",
    published_at: hoursAgo(4),
    image_url: "/images/ex3.avif",
    bias_score: 0,
    bias_reason: "Neutral reporting on a policy vote.",
    topic: "politics",
    rating: 59,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "city-council-passes-open-data-budget-tracker",
    tags: ["governance", "civics"],
  },
  {
    id: "fallback-politics-2",
    title: "Cross party committee agrees on election security upgrades",
    description:
      "Lawmakers reached a bipartisan agreement to improve audits, training, and equipment standards before the next cycle.",
    summary:
      "A joint committee unveiled a package that strengthens audit procedures and standardizes training for poll staff. The plan includes **updated equipment checks** and a public reporting schedule. Supporters say the changes focus on reliability rather than partisan advantage. The proposal moves to a budget hearing next month for funding approval. Meaning: an audit is a systematic review to verify accuracy.",
    published_at: hoursAgo(11),
    image_url: "/images/ex1.png",
    bias_score: 0,
    bias_reason: "Balanced summary of a cross party agreement.",
    topic: "politics",
    rating: 56,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "cross-party-committee-agrees-on-election-security-upgrades",
    tags: ["elections", "security"],
  },
  {
    id: "fallback-entertainment-1",
    title: "Indie film festival announces community juries",
    description:
      "The festival is adding local juries to award new honors for debut directors and regional storytelling.",
    summary:
      "Organizers said community juries will join critics and industry panels this year. The new awards highlight **fresh voices** and encourage regional stories that might not reach global stages. Public screenings will include short Q and A sessions with directors, and the festival will release the juries list ahead of opening night. Meaning: a jury is a group of people chosen to decide awards.",
    published_at: hoursAgo(7),
    image_url: "/images/ex2.jpeg",
    bias_score: 0,
    bias_reason: "Cultural announcement with neutral tone.",
    topic: "entertainment",
    rating: 50,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "indie-film-festival-announces-community-juries",
    tags: ["film", "culture"],
  },
  {
    id: "fallback-entertainment-2",
    title: "Museum launches after hours audio tours with local artists",
    description:
      "A new program pairs exhibits with artist narrated audio guides, extending weekend hours for visitors.",
    summary:
      "The museum will host late sessions featuring audio tours recorded by local artists. The project aims to add **personal perspectives** to classic collections and attract visitors outside regular hours. Early previews include short interviews about technique, inspiration, and historical context. Tickets will be priced the same as standard entry to encourage broader access. Meaning: an exhibit is a display of objects or artwork for public viewing.",
    published_at: hoursAgo(13),
    image_url: "/images/ex1.png",
    bias_score: 0,
    bias_reason: "Informational arts update with no editorial slant.",
    topic: "entertainment",
    rating: 48,
    likes: 0,
    dislikes: 0,
    interactions: 0,
    slug: "museum-launches-after-hours-audio-tours-with-local-artists",
    tags: ["arts", "events"],
  },
];

export function getFallbackNewsByTopic(topic: string): NewsItem[] {
  const normalized = topic?.toLowerCase().trim();
  const filtered = FALLBACK_NEWS.filter((item) => item.topic === normalized);
  return filtered.length > 0 ? filtered : FALLBACK_NEWS.slice(0, 8);
}

export function getFallbackNewsBySlug(slug: string): NewsItem | null {
  const normalized = slug?.toLowerCase().trim();
  return (
    FALLBACK_NEWS.find((item) => item.slug === normalized) ??
    FALLBACK_NEWS.find((item) => item.id === normalized) ??
    null
  );
}

export function getFallbackNewsAll(): NewsItem[] {
  return FALLBACK_NEWS;
}
