import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onboardingSlides } from '../data/mockData';
import { colors, spacing, radius, typography } from '../theme';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = activeIndex === onboardingSlides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const handleSkip = () => onComplete();

  const renderSlide = ({ item }: { item: (typeof onboardingSlides)[0] }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.bgImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.3)', 'rgba(13,13,13,0.97)']}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.45, 1]}
      />
    </View>
  );

  const ProgressDots = () => (
    <View style={styles.dotsRow}>
      {onboardingSlides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 28, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={[styles.dot, { width: dotWidth, opacity, backgroundColor: colors.primary }]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Icon in center */}
      <View style={styles.iconArea}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={onboardingSlides[activeIndex].icon as any}
            size={36}
            color={colors.textPrimary}
          />
        </View>
      </View>

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        {/* Text that changes with slide */}
        <View style={styles.textArea}>
          {onboardingSlides.map((slide, i) => (
            <View
              key={slide.id}
              style={[
                styles.slideText,
                { display: i === activeIndex ? 'flex' : 'none' },
              ]}
            >
              <Text style={styles.heading}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Progress + CTA */}
        <ProgressDots />

        <TouchableOpacity style={styles.ctaBtn} onPress={handleNext} activeOpacity={0.88}>
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    width,
    height,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  skipText: {
    ...typography.titleSmall,
    color: 'rgba(255,255,255,0.75)',
  },
  iconArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.12,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
  },
  textArea: {
    marginBottom: spacing.xl,
    minHeight: 120,
  },
  slideText: {
    flexDirection: 'column',
  },
  heading: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 44,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
    maxWidth: 280,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...typography.titleMedium,
    color: colors.textInverse,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
