import React from 'react';
import { Reorder } from 'motion/react';
export default function Test() {
  return <Reorder.Item value={1} onDragEnd={() => console.log('end')}>Hi</Reorder.Item>
}
