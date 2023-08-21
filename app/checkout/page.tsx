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

export default function Checkout() {
  return (
    <>
      {/* Render the ThreeItemGrid component */}
      <ThreeItemGrid />
      {/* Use Suspense to wrap the Checkoutflow component */}
      <Suspense fallback={<div>Loading...</div>}>
        <Checkoutflow />
      </Suspense>
    </>
  );
}