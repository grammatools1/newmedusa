// Import necessary modules
import type { Metadata } from 'next';
import Prose from 'components/prose';
import { CHECKOUT_PAGE_PROPS } from 'lib/constants';
import { notFound } from 'next/navigation';
import Checkout from 'components/checkout';

// Set the runtime and revalidate settings
export const runtime = 'edge';
export const revalidate = 43200; // 12 hours

// Function to generate metadata for the page
export async function generateMetadata({
  params
}: {
  params: { page: string };
}): Promise<Metadata> {
  let page;

  if (params.page === 'checkout') {
    page = CHECKOUT_PAGE_PROPS;
  }

  if (!page) return notFound();

  return {
    title: page.title,
    description: '',
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: 'article',
    },
  };
}

// Main page component
export default function Page({ params }: { params: { page: string } }) {
  let page;

  if (params.page === 'checkout') {
    page = CHECKOUT_PAGE_PROPS;
  }

  if (!page) return notFound();

  return (
    <>
      {/* Render the page title */}
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      {/* Render the page content using the Prose component */}
      <Prose className="mb-8" html={page.body as string} />
      {/* Render the last updated date */}
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(page.updatedAt))}.`}
      </p>
      {/* Render the Checkout component if the page is 'checkout' */}
      {params.page === 'checkout' && <Checkout />}
    </>
  );
}
