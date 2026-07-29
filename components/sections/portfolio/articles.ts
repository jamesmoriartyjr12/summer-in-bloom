const BASE = "/Press%20Images/";

export type Article = {
  publication: string;
  headline: string;
  image?: string;
  company: string;
  url: string;
};

export const ARTICLES: Article[] = [
  {
    publication: "Forbes",
    headline: "Golf Course Service Provider Launches Pro Shops Into Omnichannel Orbit",
    company: "TeeCommerce",
    url: "https://www.forbes.com/sites/mikedojc/2023/09/19/golf-course-service-provider-launches-pro-shops-into-omnichannel-orbit/",
  },
  {
    publication: "Forbes",
    headline: "This Under 30 Raised $18 Million To Make Sleeping Cool—Literally",
    image: `${BASE}Orion_Article.png`,
    company: "Orion",
    url: "https://www.forbes.com/sites/alexyork/2025/11/14/this-under-30-raised-18-million-to-make-sleeping-cool-literally/",
  },
  {
    publication: "Yahoo Finance",
    headline: "Fanfix Surpasses $300 Million Paid Out to Creators",
    company: "FanFix",
    url: "https://finance.yahoo.com/small-business/articles/fanfix-surpasses-300-million-paid-130600213.html",
  },
  {
    publication: "Yahoo Finance",
    headline: "GCash launches new service for dollar transfers to Filipino users",
    company: "Meridian",
    url: "https://finance.yahoo.com/news/gcash-launches-dollar-transfers-filipino-094348264.html",
  },
  {
    publication: "Forbes",
    headline: "Need Servicing for your luxury watch? WatchCheck repairs more than 200 brands.",
    company: "Collectible",
    url: "https://www.forbes.com/sites/robertanaas/2024/11/19/need-servicing-for-your-fine-watch-meet-the-watchcheckcom-platform/",
  },
  {
    publication: "The Verge",
    headline: "A toothbrush with AI, a camera, and a subscription.",
    company: "Feno Labs",
    url: "https://www.theverge.com/gadgets/609541/feno-ai-toothbrush",
  },
  {
    publication: "Yahoo Finance",
    headline: "Sunny Collaborates with Visa to Enhance and Expand Health Benefits Payments",
    company: "Sunny Benefits",
    url: "https://finance.yahoo.com/news/sunny-collaborates-visa-enhance-expand-131700588.html",
  },
  {
    publication: "Science",
    headline: "Toward universal steering and monitoring of AI models",
    company: "OuterProduct",
    url: "https://www.science.org/eprint/7VNDJKEZGK3PAKTBJZK9/full?activationRedirect=/doi/full/10.1126/science.aea6792",
  },
  {
    publication: "Coverager",
    headline: "Eat Cake rebrands to Milly Books",
    company: "Milly Books",
    url: "https://coverager.com/eat-cake-rebrands-to-milly-books/",
  },
];
