import { YStack, Paragraph } from "tamagui";

import { TimelineItem } from "@/src/ui/TimelineItem";
import { LinearGradient } from "@tamagui/linear-gradient";

export default function Details() {
  return (
    <YStack f={1} height="100%" backgroundColor={"#0B0B0B"}>
      {/* Header */}
      <YStack height="40%">
        <LinearGradient
          colors={['#003333', 'rgba(8,65,59,0.53)', 'rgb(1,28,25)', '#0B0B0B']}
          start={[0, 0]}
          end={[0, 1]}
          style={{ flex: 1 }}
        >
        </LinearGradient>
      </YStack>

      {/* Timeline */}
      <YStack gap="$3" mx="$4" mb="$6" height={"70%"} backgroundColor={"#0B0B0B"}>
        <Paragraph theme="alt2">Timeline</Paragraph>
        <TimelineItem time="12:02 PM" title="Stress" />
        <TimelineItem time="11:47 AM" title="Plain Yogurt, Strawberries" />
        <TimelineItem time="10:47 AM • 60 min" title="Running" />
      </YStack>
    </YStack>
  );
}
