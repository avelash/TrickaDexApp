import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface ParticleBurstProps {
  /** Restarting the animation: change this to replay the burst. */
  burstKey: number | string;
  count?: number;
  colors?: string[];
  /** How far particles travel, in points. */
  spread?: number;
  duration?: number;
  size?: number;
  /** Bias the burst downward like falling confetti instead of a radial pop. */
  fall?: boolean;
}

const DEFAULT_COLORS = [
  "#4ECDC4",
  "#FACC15",
  "#FF6B6B",
  "#7C3AED",
  "#84CC16",
  "#F97316",
];

interface Particle {
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
}

/**
 * Lightweight celebration particles. Uses the Animated API with the native
 * driver rather than a confetti library, because a native dependency could not
 * ship as an over-the-air update.
 */
export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  burstKey,
  count = 14,
  colors = DEFAULT_COLORS,
  spread = 90,
  duration = 900,
  size = 8,
  fall = false,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  // Particles unmount once they finish. Without this every card that has ever
  // sparked keeps its views alive at zero opacity, and they accumulate.
  const [active, setActive] = useState(true);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = fall
          ? // Downward cone, so pieces rain rather than radiate.
            Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9
          : (index / count) * Math.PI * 2 + Math.random() * 0.4;

        return {
          angle,
          distance: spread * (0.55 + Math.random() * 0.65),
          color: colors[index % colors.length],
          size: size * (0.7 + Math.random() * 0.8),
          delay: Math.random() * 0.25,
          rotation: (Math.random() - 0.5) * 360,
        };
      }),
    // Re-randomise per burst so repeats do not look identical.
    [burstKey, count, colors, spread, size, fall]
  );

  useEffect(() => {
    setActive(true);
    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) setActive(false);
    });

    return () => animation.stop();
  }, [burstKey, duration, progress]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => {
        // Each particle runs over its own slice of the timeline.
        const start = particle.delay;
        const range = [start, 1];

        const translateX = progress.interpolate({
          inputRange: range,
          outputRange: [0, Math.cos(particle.angle) * particle.distance],
          extrapolate: "clamp",
        });

        const translateY = progress.interpolate({
          inputRange: range,
          outputRange: [0, Math.sin(particle.angle) * particle.distance],
          extrapolate: "clamp",
        });

        const opacity = progress.interpolate({
          inputRange: [start, start + (1 - start) * 0.6, 1],
          outputRange: [1, 1, 0],
          extrapolate: "clamp",
        });

        const scale = progress.interpolate({
          inputRange: [start, start + (1 - start) * 0.3, 1],
          outputRange: [0.2, 1, 0.6],
          extrapolate: "clamp",
        });

        const rotate = progress.interpolate({
          inputRange: range,
          outputRange: ["0deg", `${particle.rotation}deg`],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: index % 3 === 0 ? particle.size / 2 : 2,
                backgroundColor: particle.color,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
  },
});
