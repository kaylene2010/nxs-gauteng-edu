import React from 'react';
import { View, PanResponder } from 'react-native';

export default function Joystick({ onMove }) {
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const x = gesture.dx / 50;
        const y = -gesture.dy / 50;
        const dist = Math.sqrt(x*x + y*y);
        const clamped = Math.min(dist, 1);
        const angle = Math.atan2(y, x);
        onMove({
          x: Math.cos(angle) * clamped,
          y: Math.sin(angle) * clamped
        });
      },
      onPanResponderRelease: () => onMove({ x: 0, y: 0 }),
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        position: 'absolute',
        bottom: 40,
        left: 20,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.5)' }} />
    </View>
  );
}