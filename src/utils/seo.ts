const SITE_URL = 'https://reborn-bmw.tech';
const SITE_NAME = 'Reborn BMW';
const DEFAULT_OG_IMAGE = '/media/og-image-1768344534832.jpg';

interface SeoParams {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: string;
}

export function updateSeoMeta({ title, description, path, ogImage, ogType }: SeoParams) {
  document.title = title;

  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  const setMeta = (attr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('name', 'description', description);

  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:type', ogType || 'website');
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:locale', 'ru_RU');

  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);

  try {
    const w = window as unknown as Record<string, unknown>;
    if (typeof w.ym === 'function') {
      (w.ym as (id: number, method: string, url: string, opts: { title: string }) => void)(106827578, 'hit', url, { title });
    }
  } catch { /* metrika not loaded */ }
}

interface ArticleSchemaParams {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  readTime: string;
}

export function injectArticleSchema({ title, description, path, datePublished, readTime }: ArticleSchemaParams) {
  removeSchema('article-schema');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'url': `${SITE_URL}${path}`,
    'datePublished': datePublished,
    'dateModified': datePublished,
    'author': { '@type': 'Organization', 'name': SITE_NAME, 'url': SITE_URL },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'url': SITE_URL,
      'logo': { '@type': 'ImageObject', 'url': '/media/favicon-1768344534331.jpg' }
    },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': `${SITE_URL}${path}` },
    'timeRequired': `PT${parseInt(readTime)}M`,
    'inLanguage': 'ru'
  };
  injectSchema(schema, 'article-schema');
}

interface FaqSchemaParams {
  questions: { q: string; a: string }[];
}

export function injectFaqSchema({ questions }: FaqSchemaParams) {
  removeSchema('faq-page-schema');
  if (!questions.length) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(({ q, a }) => ({
      '@type': 'Question',
      'name': q,
      'acceptedAnswer': { '@type': 'Answer', 'text': a }
    }))
  };
  injectSchema(schema, 'faq-page-schema');
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function injectBreadcrumbSchema(items: BreadcrumbItem[]) {
  removeSchema('breadcrumb-page-schema');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.url
    }))
  };
  injectSchema(schema, 'breadcrumb-page-schema');
}

interface ServiceSchemaParams {
  name: string;
  description: string;
  path: string;
}

export function injectServiceSchema({ name, description, path }: ServiceSchemaParams) {
  removeSchema('service-page-schema');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': name,
    'description': description,
    'url': `${SITE_URL}${path}`,
    'provider': { '@type': 'Organization', 'name': SITE_NAME, 'url': SITE_URL },
    'areaServed': { '@type': 'Country', 'name': 'Россия' }
  };
  injectSchema(schema, 'service-page-schema');
}

function injectSchema(data: object, id: string) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function removeSchema(id: string) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}

export function cleanupSchemas() {
  ['article-schema', 'faq-page-schema', 'breadcrumb-page-schema', 'service-page-schema'].forEach(removeSchema);
}

export default updateSeoMeta;