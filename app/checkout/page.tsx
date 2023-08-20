import { ThreeItemGrid } from 'components/grid/three-items';
import Checkoutflow from './checkoutflow';
import { Suspense } from 'react';

export const runtime = 'edge';

export const revalidate = 43200; // 12 hours

export const metadata = {
  description: 'High-performance ecommerce store.',
  openGraph: {
    type: 'website'
  }
};

export default async function Checkout() {
  return (
    <>
      <ThreeItemGrid />
      <Suspense>
        <Suspense>
          <Checkoutflow />
        </Suspense>
    </>
  );
}
